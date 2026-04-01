import rbacRoute from "./rbac.route.js";

export default {
  name: "rbac",
  basePath: "/api/admin",
  router: rbacRoute,
  isPrivate: true,
};

