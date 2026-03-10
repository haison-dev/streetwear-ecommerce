import express from "express";
import dotnet from "dotenv";
import { connectDB } from "./libs/db.js";

dotnet.config();

const app = express();
const PORT = process.env.PORT || 5001;

//middleware
app.use(express.json());

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running at ${PORT}`);
  });
});
