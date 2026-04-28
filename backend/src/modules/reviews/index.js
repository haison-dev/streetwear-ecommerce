import reviewsRoute from "./reviews.route.js";

export default {
  name: "reviews",
  basePath: "/api/reviews",
  router: reviewsRoute,
  isPrivate: false,
};
