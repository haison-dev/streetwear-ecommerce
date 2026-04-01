import cartRoute from "./cart.route.js";

export default {
  name: "cart",
  basePath: "/api/cart",
  router: cartRoute,
  isPrivate: true,
};


