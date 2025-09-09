import express, { Application } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import connectDB from "./config/db";
import userRoutes from "./routes/user";
import screenshotRoutes from "./routes/screenshot";
import contributionRoutes from "./routes/contribution";
import feedbackRoutes from "./routes/feedback";
import expenseRoutes from "./routes/expense";
import cors from "cors";
import cookieParser from "cookie-parser";
import { IUser } from "./models/User";
import authenticateToken from "./middleware/authMiddleware";
import { getAdminAndSuperAdmin, getPublicUsers, getQrCode } from "./controllers/publicInfo";
// import './cronjob'; // Enable this line if you want to check health periodiacally

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
        origin: function(origin, callback) {
            console.log('🌐 CORS Check - Origin:', origin || 'No origin (mobile app)');
            
            // ✅ MOBILE APPS (PRODUCTION): No origin header - this is normal for native apps
            if (!origin) {
                console.log('✅ Allowed: Mobile app or native request (no origin)');
                return callback(null, true);
            }
            
            const allowedOrigins = [
                process.env.CLIENT_URL,
                process.env.CLIENT_URL?.replace('http://', 'https://'), // HTTP to HTTPS fallback
                process.env.CLIENT_URL?.replace('https://', 'http://'), // HTTPS to HTTP fallback
                // Development: Local network IPs for mobile testing via Expo
                'http://192.168.1.100:8081',   // Example Expo dev server
                'http://10.0.0.100:8081',      // Example Expo dev server  
                'http://172.16.0.100:8081',    // Example Expo dev server
            ].filter(Boolean); // Remove undefined values

            // ✅ WEB APPS & EXPO DEVELOPMENT: Check allowed origins
            if (allowedOrigins.includes(origin) ||
                origin.includes('netlify.app') ||
                origin.includes('netlify.com') ||
                origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||  // Local network IPs
                origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/) ||    // Local network IPs  
                origin.match(/^http:\/\/172\.16\.\d+\.\d+:\d+$/)) {    // Local network IPs
                console.log('✅ Allowed: Recognized origin');
                return callback(null, true);
            }
            
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true, // Allow cookies to be sent
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
        optionsSuccessStatus: 200 // Some legacy browsers choke on 204
    }
));
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
// Logging middleware for debugging
// app.use((req, res, next) => {
//     console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
//     if (req.headers.authorization) {
//         console.log(`Authorization Header: ${req.headers.authorization}`);
//     }
//     next();
// });

// Routes
app.use("/auth", authRoutes)
app.use("/users", authenticateToken, userRoutes);
app.use("/screenshots", authenticateToken, screenshotRoutes);
app.use("/contributions", authenticateToken, contributionRoutes);
app.use("/feedback", authenticateToken, feedbackRoutes);
app.use("/expense", authenticateToken, expenseRoutes);

// Public Route
app.use("/public/users", getPublicUsers); // Gets information about users without authentication for home page
app.use("/public/qr", getQrCode); // Gets public screenshot of a user
app.use("/get-admins-superadmin", getAdminAndSuperAdmin); // Gets all admins for public view

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.get("/health", (req, res) => {
    console.log("Health check endpoint hit");
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
