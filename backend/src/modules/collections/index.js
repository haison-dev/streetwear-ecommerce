import collectionsRoute from "./collections.route.js";

export default {
  name: "collections",
  basePath: "/api/collections",
  router: collectionsRoute,
  isPrivate: false,
};

