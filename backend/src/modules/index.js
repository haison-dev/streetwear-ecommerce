import adminUsersModule from "./admin-users/index.js";
import authModule from "./auth/index.js";
import brandsModule from "./brands/index.js";
import cartModule from "./cart/index.js";
import categoriesModule from "./categories/index.js";
import orderModule from "./order/index.js";
import paymentModule from "./payment/index.js";
import productsModule from "./products/index.js";
import rbacModule from "./rbac/index.js";
import uploadsModule from "./uploads/index.js";
import usersModule from "./users/index.js";

const modules = [
  authModule,
  categoriesModule,
  brandsModule,
  productsModule,
  usersModule,
  cartModule,
  orderModule,
  paymentModule,
  adminUsersModule,
  rbacModule,
  uploadsModule,
];

export default modules;


