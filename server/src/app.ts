import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/user";
import screenshotRoutes from "./routes/screenshot";
import cors from "cors";

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/screenshots", screenshotRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

const main = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

main().catch((err) => {
  console.error("Error starting the server:");
  console.error((err as Error).message);
  process.exit(1);
});
