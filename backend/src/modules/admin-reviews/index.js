import adminReviewsRoute from "./admin-reviews.route.js";

export default {
  name: "admin-reviews",
  basePath: "/api/admin/reviews",
  router: adminReviewsRoute,
  isPrivate: false,
};
