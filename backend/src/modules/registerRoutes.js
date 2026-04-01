import modules from "./index.js";
import { protectedRoute } from "../shared/middleware/authMiddleware.js";

export const registerModuleRoutes = (app) => {
  modules.forEach((moduleDef) => {
    if (moduleDef.isPrivate) {
      app.use(moduleDef.basePath, protectedRoute, moduleDef.router);
      return;
    }
    app.use(moduleDef.basePath, moduleDef.router);
  });
};


