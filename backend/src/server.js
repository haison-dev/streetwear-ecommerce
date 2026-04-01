import dotnet from "dotenv";
import { createApp } from "./app.js";
import { connectDB } from "./libs/db.js";
dotnet.config();

const app = createApp();
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running at ${PORT}`);
  });
});

