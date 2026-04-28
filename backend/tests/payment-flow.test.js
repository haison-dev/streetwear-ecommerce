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

  const repoMock = {
    countAllPaymentTransactions: spy(async () => 0),
    countPaymentTransactionsByPaymentId: spy(async () => 0),
    createPaymentAuditLog: spy(async () => ({ _id: "audit-1" })),
    createPaymentTransaction: spy(async () => ({
      _id: "txn-2",
      paymentId: "pay-1",
      orderId: "ord-1",
      amount: 100000,
      method: "momo",
      status: "pending",
      attemptNo: 2,
    })),
    findPendingPaymentTransactionsBefore: spy(async () => []),
    findAllPaymentTransactions: spy(async () => []),
    findLatestPaymentTransactionByPaymentId: spy(async () => null),
    findOrderById: spy(async () => null),
    findPaymentById: spy(async () => null),
    findPaymentTransactionById: spy(async () => null),
    findPaymentTransactionsByPaymentId: spy(async () => []),
    updateOrderById: spy(async () => null),
    updatePaymentById: spy(async () => null),
    updatePaymentTransactionById: spy(async () => null),
  };

  const providerMock = {
    getPaymentProviderStrategy: spy((name) => ({
      name,
      verifyCallback: () => true,
      classifyCallbackResult: ({ query = {} }) => ({
        status: query?.forceStatus || "failed",
        providerTransactionId: query?.providerTxNo,
        rawResponse: query,
        failureReason: query?.forceStatus === "failed" ? "failed" : undefined,
      }),
      buildCheckout: () => ({ checkoutUrl: "https://sandbox.vnpayment.vn/mock" }),
      queryTransaction: async () => ({ status: "pending", rawResponse: {} }),
    })),
  };

  const service = await esmock("../src/modules/payment/payment.service.js", {
    mongoose: mongooseMock,
    "../src/modules/payment/payment.repository.js": repoMock,
    "../src/modules/payment/providers/index.js": providerMock,
  });

  return {
    service,
    mocks: { session, repoMock, providerMock },
  };
};

await test("getPaymentByIdService returns payment when user owns order", async () => {
  const { service, mocks } = await setupService();
  const { repoMock } = mocks;

  repoMock.findPaymentById.setImpl(async () => ({
    _id: "pay-1",
    orderId: "ord-1",
    amount: 100000,
    method: "momo",
    status: "pending",
  }));
  repoMock.findOrderById.setImpl(async () => ({
    _id: "ord-1",
    userId: "u1",
  }));
  repoMock.findLatestPaymentTransactionByPaymentId.setImpl(async () => ({
    _id: "txn-1",
    attemptNo: 1,
    status: "pending",
  }));

  const result = await service.getPaymentByIdService({
    paymentId: "pay-1",
    userId: "u1",
    canReadAll: false,
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.payment._id, "pay-1");
  assert.equal(result.body.latestTransaction._id, "txn-1");
});

await test("listAllPaymentTransactionsService returns paginated list for backoffice", async () => {
  const { service, mocks } = await setupService();
  const { repoMock } = mocks;

  repoMock.findAllPaymentTransactions.setImpl(async () => [
    { _id: "txn-1", status: "pending", method: "vnpay" },
  ]);
  repoMock.countAllPaymentTransactions.setImpl(async () => 1);

  const result = await service.listAllPaymentTransactionsService({
    query: { status: "pending", method: "vnpay", page: 1, limit: 10, sort: "newest" },
    canReadAll: true,
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.transactions.length, 1);
  assert.equal(result.body.meta.total, 1);
});

await test("createPaymentAttemptService creates new pending attempt with incremented attemptNo", async () => {
  const { service, mocks } = await setupService();
  const { repoMock } = mocks;

  repoMock.findPaymentById.setImpl(async () => ({
    _id: "pay-1",
    orderId: "ord-1",
    amount: 100000,
    method: "momo",
    status: "pending",
  }));
  repoMock.findOrderById.setImpl(async () => ({
    _id: "ord-1",
    userId: "u1",
  }));
  repoMock.findLatestPaymentTransactionByPaymentId.setImpl(async () => ({
    _id: "txn-1",
    attemptNo: 1,
    status: "failed",
  }));

  const result = await service.createPaymentAttemptService({
    paymentId: "pay-1",
    userId: "u1",
    canReadAll: false,
    payload: { provider: "momo" },
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.paymentTransaction.attemptNo, 2);
  assert.equal(result.body.nextAction.provider, "momo");
  assert.equal(repoMock.createPaymentTransaction.calls.length, 1);
});

await test("createPaymentAttemptService rejects when latest attempt is not failed", async () => {
  const { service, mocks } = await setupService();
  const { repoMock } = mocks;

  repoMock.findPaymentById.setImpl(async () => ({
    _id: "pay-1",
    orderId: "ord-1",
    amount: 100000,
    method: "momo",
    status: "pending",
  }));
  repoMock.findOrderById.setImpl(async () => ({
    _id: "ord-1",
    userId: "u1",
  }));
  repoMock.findLatestPaymentTransactionByPaymentId.setImpl(async () => ({
    _id: "txn-1",
    attemptNo: 1,
    status: "pending",
  }));

  await assert.rejects(
    service.createPaymentAttemptService({
      paymentId: "pay-1",
      userId: "u1",
      canReadAll: false,
      payload: { provider: "momo" },
    }),
    (err) => err?.status === 409,
  );
});

await test("createPaymentAttemptService allows new attempt when latest pending attempt is expired", async () => {
  const { service, mocks } = await setupService();
  const { repoMock } = mocks;

  repoMock.findPaymentById.setImpl(async () => ({
    _id: "pay-1",
    orderId: "ord-1",
    amount: 100000,
    method: "momo",
    status: "pending",
  }));
  repoMock.findOrderById.setImpl(async () => ({
    _id: "ord-1",
    userId: "u1",
  }));

  let callNo = 0;
  repoMock.findLatestPaymentTransactionByPaymentId.setImpl(async () => {
    callNo += 1;
    return {
      _id: "txn-1",
      attemptNo: 1,
      status: "pending",
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    };
  });

  const result = await service.createPaymentAttemptService({
    paymentId: "pay-1",
    userId: "u1",
    canReadAll: false,
    payload: { provider: "momo" },
  });

  assert.equal(result.status, 201);
  assert.equal(repoMock.updatePaymentTransactionById.calls.length, 1);
  assert.equal(repoMock.createPaymentTransaction.calls.length, 1);
  assert.ok(callNo >= 2);
});

await test("listPaymentTransactionsService rejects when requester is not owner", async () => {
  const { service, mocks } = await setupService();
  const { repoMock } = mocks;

  repoMock.findPaymentById.setImpl(async () => ({
    _id: "pay-1",
    orderId: "ord-1",
    amount: 100000,
    method: "momo",
    status: "pending",
  }));
  repoMock.findOrderById.setImpl(async () => ({
    _id: "ord-1",
    userId: "u-owner",
  }));

  await assert.rejects(
    service.listPaymentTransactionsService({
      paymentId: "pay-1",
      userId: "u-other",
      canReadAll: false,
      query: { page: 1, limit: 20 },
    }),
    (err) => err?.status === 404,
  );
});

await test("updatePaymentTransactionStatusService marks paid and updates payment/order", async () => {
  const { service, mocks } = await setupService();
  const { repoMock, session } = mocks;

  repoMock.findPaymentTransactionById.setImpl(async () => ({
    _id: "txn-1",
    paymentId: "pay-1",
    orderId: "ord-1",
    status: "pending",
  }));
  repoMock.findPaymentById.setImpl(async () => ({
    _id: "pay-1",
    orderId: "ord-1",
    status: "pending",
  }));
  repoMock.findOrderById.setImpl(async () => ({
    _id: "ord-1",
    paymentStatus: "pending",
  }));
  repoMock.updatePaymentTransactionById.setImpl(async () => ({
    _id: "txn-1",
    status: "paid",
  }));
  repoMock.updatePaymentById.setImpl(async () => ({
    _id: "pay-1",
    status: "paid",
  }));
  repoMock.updateOrderById.setImpl(async () => ({
    _id: "ord-1",
    paymentStatus: "paid",
  }));
  repoMock.findLatestPaymentTransactionByPaymentId.setImpl(async () => ({
    _id: "txn-1",
    attemptNo: 1,
    status: "pending",
  }));

  const result = await service.updatePaymentTransactionStatusService({
    transactionId: "txn-1",
    payload: { status: "paid", providerTransactionId: "gw-1" },
  });

  assert.equal(result.status, 200);
  assert.equal(repoMock.updatePaymentById.calls.length, 1);
  assert.equal(repoMock.updateOrderById.calls.length, 1);
  assert.equal(session.commitTransaction.calls.length, 1);
  assert.equal(session.abortTransaction.calls.length, 0);
});

await test("updatePaymentTransactionStatusService rejects reverse transition from paid to failed", async () => {
  const { service, mocks } = await setupService();
  const { repoMock, session } = mocks;

  repoMock.findPaymentTransactionById.setImpl(async () => ({
    _id: "txn-1",
    paymentId: "pay-1",
    orderId: "ord-1",
    status: "paid",
  }));
  repoMock.findPaymentById.setImpl(async () => ({
    _id: "pay-1",
    orderId: "ord-1",
    status: "paid",
  }));
  repoMock.findOrderById.setImpl(async () => ({
    _id: "ord-1",
    paymentStatus: "paid",
  }));

  await assert.rejects(
    service.updatePaymentTransactionStatusService({
      transactionId: "txn-1",
      payload: { status: "failed" },
    }),
    (err) => err?.status === 409,
  );

  assert.equal(session.abortTransaction.calls.length, 1);
});

await test("updatePaymentTransactionStatusService ignores stale callback from old attempt", async () => {
  const { service, mocks } = await setupService();
  const { repoMock } = mocks;

  repoMock.findPaymentTransactionById.setImpl(async () => ({
    _id: "txn-1",
    paymentId: "pay-1",
    orderId: "ord-1",
    status: "pending",
    attemptNo: 1,
  }));
  repoMock.findPaymentById.setImpl(async () => ({
    _id: "pay-1",
    orderId: "ord-1",
    status: "pending",
  }));
  repoMock.findOrderById.setImpl(async () => ({
    _id: "ord-1",
    paymentStatus: "pending",
  }));
  repoMock.findLatestPaymentTransactionByPaymentId.setImpl(async () => ({
    _id: "txn-2",
    paymentId: "pay-1",
    attemptNo: 2,
    status: "pending",
  }));

  const result = await service.updatePaymentTransactionStatusService({
    transactionId: "txn-1",
    payload: { status: "failed" },
  });

  assert.equal(result.status, 200);
  assert.match(result.body.message, /Stale callback ignored/);
  assert.equal(repoMock.updatePaymentById.calls.length, 0);
  assert.equal(repoMock.updateOrderById.calls.length, 0);
});

await test("updatePaymentTransactionStatusService rejects invalid status", async () => {
  const { service } = await setupService();

  await assert.rejects(
    service.updatePaymentTransactionStatusService({
      transactionId: "txn-1",
      payload: { status: "done" },
    }),
    (err) => err?.status === 400,
  );
});
