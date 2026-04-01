import adminUsersRoute from "./admin-users.route.js";

export default {
  name: "admin-users",
  basePath: "/api/admin/users",
  router: adminUsersRoute,
  isPrivate: true,
};

