import categoriesRoute from "./categories.route.js";

export default {
  name: "categories",
  basePath: "/api/categories",
  router: categoriesRoute,
  isPrivate: false,
};

