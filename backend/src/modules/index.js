import adminUsersModule from "./admin-users/index.js";
import authModule from "./auth/index.js";
import brandsModule from "./brands/index.js";
import cartModule from "./cart/index.js";
import categoriesModule from "./categories/index.js";
import inventoryModule from "./inventory/index.js";
import orderModule from "./order/index.js";
import paymentModule from "./payment/index.js";
import productsModule from "./products/index.js";
import rbacModule from "./rbac/index.js";
import reviewsModule from "./reviews/index.js";
import adminReviewsModule from "./admin-reviews/index.js";
import uploadsModule from "./uploads/index.js";
import usersModule from "./users/index.js";
import variantsModule from "./variants/index.js";
import wishlistModule from "./wishlist/index.js";

const modules = [
  authModule,
  categoriesModule,
  brandsModule,
  productsModule,
  variantsModule,
  inventoryModule,
  usersModule,
  wishlistModule,
  cartModule,
  orderModule,
  paymentModule,
  reviewsModule,
  adminReviewsModule,
  adminUsersModule,
  rbacModule,
  uploadsModule,
];

export default modules;


