  import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import dotnet from "dotenv";
import authRoute from "./routes/authRoute.js";
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

//private routes
app.use(protectedRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running at ${PORT}`);
  });
});
