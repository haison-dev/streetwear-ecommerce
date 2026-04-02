import orderRoute from "./order.route.js";

export default {
  name: "order",
  basePath: "/api/orders",
  router: orderRoute,
  isPrivate: true,
};
