import productsRoute from "./products.route.js";

export default {
  name: "products",
  basePath: "/api/products",
  router: productsRoute,
  isPrivate: false,
};

