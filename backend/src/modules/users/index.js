import usersRoute from "./users.route.js";

export default {
  name: "users",
  basePath: "/api/users",
  router: usersRoute,
  isPrivate: true,
};

