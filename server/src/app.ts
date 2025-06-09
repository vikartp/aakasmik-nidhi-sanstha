import express, { Application } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import connectDB from "./config/db";
import userRoutes from "./routes/user";
import screenshotRoutes from "./routes/screenshot";
import cors from "cors";
import cookieParser from "cookie-parser";
import { IUser } from "./models/User";

dotenv.config();

const app: Application = express();

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: Express.Multer.File; // For file uploads
    }
  }
}

app.use(cors(
  {
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }
));
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoutes)
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
