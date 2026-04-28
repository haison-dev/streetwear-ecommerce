import inventoryRoute from "./inventory.route.js";

export default {
  name: "inventory",
  basePath: "/api/admin/inventory",
  router: inventoryRoute,
  isPrivate: false,
};
