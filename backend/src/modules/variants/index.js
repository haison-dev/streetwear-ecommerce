import variantsRoute from "./variants.route.js";

export default {
  name: "variants",
  basePath: "/api/admin/variants",
  router: variantsRoute,
  isPrivate: false,
};
