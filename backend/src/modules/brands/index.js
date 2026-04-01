import brandsRoute from "./brands.route.js";

export default {
  name: "brands",
  basePath: "/api/brands",
  router: brandsRoute,
  isPrivate: false,
};

