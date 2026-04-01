import uploadsRoute from "./uploads.route.js";

export default {
  name: "uploads",
  basePath: "/api/uploads",
  router: uploadsRoute,
  isPrivate: false,
};

