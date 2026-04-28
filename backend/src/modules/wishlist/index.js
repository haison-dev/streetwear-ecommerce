import wishlistRoute from "./wishlist.route.js";

export default {
  name: "wishlist",
  basePath: "/api/wishlist",
  router: wishlistRoute,
  isPrivate: false,
};
