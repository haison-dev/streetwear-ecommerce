import paymentRoute from "./payment.route.js";

export default {
  name: "payment",
  basePath: "/api/payments",
  router: paymentRoute,
  isPrivate: false,
};
