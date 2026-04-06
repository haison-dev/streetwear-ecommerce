import assert from "node:assert/strict";
import esmock from "esmock";

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}`);
    throw err;
  }
};

const spy = (impl = () => undefined) => {
  const fn = (...args) => {
    fn.calls.push(args);
    return impl(...args);
  };
  fn.calls = [];
  fn.setImpl = (nextImpl) => {
    impl = nextImpl;
  };
  return fn;
};

const setupService = async ({ isObjectIdValid = () => true } = {}) => {
  const session = {
    startTransaction: spy(),
    commitTransaction: spy(async () => undefined),
    abortTransaction: spy(async () => undefined),
    endSession: spy(async () => undefined),
  };

  const mongooseMock = {
    default: {
      startSession: spy(async () => session),
      Types: {
        ObjectId: {
          isValid: isObjectIdValid,
        },
      },
    },
  };

  const inventoryMock = {
    getRealAvailable: spy((inventory) =>
      Math.max(0, Number(inventory?.available || 0) - Number(inventory?.reserved || 0)),
    ),
    reserveStockForItems: spy(async () => true),
    releaseReservedForItems: spy(async () => true),
    commitReservedForItems: spy(async () => true),
  };

  const validationMock = {
    validateCreateOrderFromCartInput: spy(() => undefined),
  };

  const pricingMock = {
    computeOrderPricing: spy(() => ({
      shippingFee: 30000,
      discount: 0,
      totalPrice: 230000,
    })),
  };

  const orderNumberMock = {
    createOrderWithRetry: spy(async () => ({
      _id: "order-1",
      totalPrice: 230000,
      items: [{ variantId: "v1", quantity: 2 }],
      paymentMethod: "cod",
      status: "pending",
    })),
  };

  const repoMock = {
    countOrders: spy(async () => 0),
    createOrder: spy(async () => ({ _id: "created-order" })),
    createPayment: spy(async () => ({
      _id: "pay-1",
      amount: 230000,
      method: "cod",
      status: "pending",
    })),
    createPaymentTransaction: spy(async () => ({
      _id: "txn-1",
      paymentId: "pay-1",
      orderId: "order-1",
      status: "pending",
      attemptNo: 1,
    })),
    deleteCartItemsByIds: spy(async () => ({ deletedCount: 1 })),
    findCartItemsByUserId: spy(async () => []),
    findInventoryByVariantId: spy(async () => null),
    findLatestPaymentTransactionByOrderId: spy(async () => null),
    findOrderById: spy(async () => null),
    findOrderByIdAndUserId: spy(async () => null),
    findOrders: spy(async () => []),
    findPaymentByOrderId: spy(async () => null),
    findProductById: spy(async () => null),
    findVariantById: spy(async () => null),
    updateOrderById: spy(async () => null),
    updatePaymentByOrderId: spy(async () => null),
    updatePaymentTransactionById: spy(async () => null),
  };

  const service = await esmock("../src/modules/order/order.service.js", {
    mongoose: mongooseMock,
    "../src/shared/utils/inventory.js": inventoryMock,
    "../src/modules/order/domain/order-validation.js": validationMock,
    "../src/modules/order/domain/order-pricing.js": pricingMock,
    "../src/modules/order/domain/order-number.js": orderNumberMock,
    "../src/modules/order/order.repository.js": repoMock,
  });

  return {
    service,
    mocks: {
      session,
      inventoryMock,
      validationMock,
      pricingMock,
      orderNumberMock,
      repoMock,
      mongooseMock,
    },
  };
};

await test("createOrderFromCartService creates order+payment+transaction and commits transaction", async () => {
  const { service, mocks } = await setupService();
  const { repoMock, inventoryMock, session } = mocks;

  repoMock.findCartItemsByUserId.setImpl(async () => [
    { _id: "c1", productId: "p1", variantId: "v1", quantity: 2 },
  ]);
  repoMock.findProductById.setImpl(async () => ({
    _id: "p1",
    status: "active",
    name: "T-Shirt",
    images: ["img.jpg"],
    price: 120000,
    salePrice: 100000,
  }));
  repoMock.findVariantById.setImpl(async () => ({
    _id: "v1",
    productId: "p1",
    size: 42,
    color: "black",
    price: 100000,
  }));
  repoMock.findInventoryByVariantId.setImpl(async () => ({
    variantId: "v1",
    available: 10,
    reserved: 0,
  }));
  repoMock.createPayment.setImpl(async () => ({
    _id: "pay-1",
    amount: 230000,
    method: "cod",
    status: "pending",
  }));
  repoMock.createPaymentTransaction.setImpl(async () => ({
    _id: "txn-1",
    paymentId: "pay-1",
    orderId: "order-1",
    amount: 230000,
    method: "cod",
    status: "pending",
    attemptNo: 1,
  }));

  const result = await service.createOrderFromCartService({
    userId: "u1",
    payload: {
      shippingAddress: {
        name: "A",
        phone: "1",
        address: "B",
        city: "C",
        district: "D",
        ward: "E",
      },
      paymentMethod: "cod",
    },
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.order._id, "order-1");
  assert.equal(result.body.payment._id, "pay-1");
  assert.equal(result.body.paymentTransaction._id, "txn-1");
  assert.equal(inventoryMock.reserveStockForItems.calls.length, 1);
  assert.equal(repoMock.deleteCartItemsByIds.calls.length, 1);
  assert.equal(session.commitTransaction.calls.length, 1);
  assert.equal(session.abortTransaction.calls.length, 0);
});

await test("createOrderFromCartService throws when cart is empty", async () => {
  const { service, mocks } = await setupService();
  mocks.repoMock.findCartItemsByUserId.setImpl(async () => []);

  await assert.rejects(
    service.createOrderFromCartService({
      userId: "u1",
      payload: {
        shippingAddress: {
          name: "A",
          phone: "1",
          address: "B",
          city: "C",
          district: "D",
          ward: "E",
        },
        paymentMethod: "cod",
      },
    }),
    (err) => err?.status === 400 && err?.message === "Cart is empty",
  );
});

await test("createOrderFromCartService aborts transaction when reserve fails", async () => {
  const { service, mocks } = await setupService();
  const { repoMock, inventoryMock, session } = mocks;

  repoMock.findCartItemsByUserId.setImpl(async () => [
    { _id: "c1", productId: "p1", variantId: "v1", quantity: 2 },
  ]);
  repoMock.findProductById.setImpl(async () => ({
    _id: "p1",
    status: "active",
    name: "T-Shirt",
    images: ["img.jpg"],
  }));
  repoMock.findVariantById.setImpl(async () => ({
    _id: "v1",
    productId: "p1",
    size: 42,
    color: "black",
    price: 100000,
  }));
  repoMock.findInventoryByVariantId.setImpl(async () => ({
    variantId: "v1",
    available: 10,
    reserved: 0,
  }));
  inventoryMock.reserveStockForItems.setImpl(async () => false);

  await assert.rejects(
    service.createOrderFromCartService({
      userId: "u1",
      payload: {
        shippingAddress: {
          name: "A",
          phone: "1",
          address: "B",
          city: "C",
          district: "D",
          ward: "E",
        },
        paymentMethod: "cod",
      },
    }),
    (err) => err?.status === 409 && err?.message === "Insufficient stock",
  );

  assert.equal(session.abortTransaction.calls.length, 1);
});

await test("listOrdersService filters by current user when caller is not admin", async () => {
  const { service, mocks } = await setupService();
  const { repoMock } = mocks;
  repoMock.findOrders.setImpl(async () => [{ _id: "o1", userId: "u1" }]);
  repoMock.countOrders.setImpl(async () => 1);

  const result = await service.listOrdersService({
    userId: "u1",
    query: { status: "pending", page: 2, limit: 10, sort: "oldest" },
    canReadAllOrders: false,
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.meta.total, 1);
  const [arg] = repoMock.findOrders.calls[0];
  assert.deepEqual(arg.filter, { status: "pending", userId: "u1" });
  assert.equal(arg.skip, 10);
  assert.equal(arg.limit, 10);
});

await test("updateOrderStatusService cancels order and updates payment state", async () => {
  const { service, mocks } = await setupService();
  const { repoMock, inventoryMock } = mocks;

  repoMock.findOrderById.setImpl(async () => ({
    _id: "o1",
    status: "pending",
    paymentMethod: "momo",
    items: [{ variantId: "v1", quantity: 2 }],
  }));
  repoMock.updateOrderById.setImpl(async () => ({
    _id: "o1",
    status: "cancelled",
    paymentStatus: "failed",
  }));
  repoMock.updatePaymentByOrderId.setImpl(async () => ({
    _id: "p1",
    status: "failed",
  }));
  repoMock.findLatestPaymentTransactionByOrderId.setImpl(async () => ({
    _id: "t1",
    status: "pending",
  }));
  repoMock.updatePaymentTransactionById.setImpl(async () => ({
    _id: "t1",
    status: "failed",
  }));

  const result = await service.updateOrderStatusService({
    orderId: "o1",
    nextStatus: "cancelled",
  });

  assert.equal(result.status, 200);
  assert.equal(inventoryMock.releaseReservedForItems.calls.length, 1);
  assert.equal(repoMock.updateOrderById.calls.length, 1);
  assert.equal(repoMock.updatePaymentByOrderId.calls.length, 1);
  assert.equal(repoMock.updatePaymentTransactionById.calls.length, 1);
});

await test("updateOrderStatusService sets COD payment to paid when delivered", async () => {
  const { service, mocks } = await setupService();
  const { repoMock, inventoryMock } = mocks;

  repoMock.findOrderById.setImpl(async () => ({
    _id: "o1",
    status: "shipping",
    paymentMethod: "cod",
    items: [{ variantId: "v1", quantity: 1 }],
  }));
  repoMock.updateOrderById.setImpl(async () => ({
    _id: "o1",
    status: "delivered",
    paymentStatus: "paid",
  }));
  repoMock.updatePaymentByOrderId.setImpl(async () => ({
    _id: "p1",
    status: "paid",
  }));
  repoMock.findLatestPaymentTransactionByOrderId.setImpl(async () => ({ _id: "t1" }));
  repoMock.updatePaymentTransactionById.setImpl(async () => ({
    _id: "t1",
    status: "paid",
  }));

  const result = await service.updateOrderStatusService({
    orderId: "o1",
    nextStatus: "delivered",
  });

  assert.equal(result.status, 200);
  assert.equal(inventoryMock.commitReservedForItems.calls.length, 1);
  assert.equal(repoMock.updatePaymentByOrderId.calls.length, 1);
});

await test("updateOrderStatusService rejects invalid transition", async () => {
  const { service, mocks } = await setupService();
  const { repoMock, session } = mocks;

  repoMock.findOrderById.setImpl(async () => ({
    _id: "o1",
    status: "pending",
    paymentMethod: "cod",
    items: [],
  }));

  await assert.rejects(
    service.updateOrderStatusService({
      orderId: "o1",
      nextStatus: "delivered",
    }),
    (err) => err?.status === 400,
  );

  assert.equal(session.abortTransaction.calls.length, 1);
});
