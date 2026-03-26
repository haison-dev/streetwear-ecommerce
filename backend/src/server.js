  import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import dotnet from "dotenv";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import adminUserRoute from "./routes/adminUserRoute.js";
import rbacRoute from "./routes/rbacRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import brandRoute from "./routes/brandRoute.js";
import productRoute from "./routes/productRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import cartRoute from "./routes/cartRoute.js";
import { connectDB } from "./libs/db.js";
import { protectedRoute } from "./middleware/authMiddleware.js";
dotnet.config();

const app = express();
const PORT = process.env.PORT || 5001;

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

//public routes
app.use("/api/auth", authRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/brands", brandRoute);
app.use("/api/products", productRoute);

//private routes
app.use(protectedRoute);
app.use("/api/users", userRoute);
app.use("/api/cart", cartRoute);
app.use("/api/admin/users", adminUserRoute);
app.use("/api/admin", rbacRoute);
app.use("/api/uploads", uploadRoute);


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running at ${PORT}`);
  });
});
