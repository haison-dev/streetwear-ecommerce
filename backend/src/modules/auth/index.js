import authRoute from "./auth.route.js";

export default {
  name: "auth",
  basePath: "/api/auth",
  router: authRoute,
  isPrivate: false,
};

