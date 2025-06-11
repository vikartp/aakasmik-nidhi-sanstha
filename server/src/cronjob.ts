import cron from "node-cron";
import axios, { AxiosResponse } from "axios";
import dotenv from "dotenv";
dotenv.config();

const isLocal = process.env.NODE_ENV === "development";

const API_URL = isLocal ? "http://localhost:5000/health" : "https://aakasmik-nidhi-backend.onrender.com/health";
const REQUEST_TIMEOUT = 30000; // 30 seconds timeout

// Interface for API response (customize based on your API response structure)
interface ApiResponse {
    status: string;
    data?: any;
    error?: string;
}

// Function to get the current time in IST
const getTime = () =>
    new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" });

// Function to make the API call
const callApi = async (): Promise<void> => {
    try {
        const response: AxiosResponse<ApiResponse> = await axios.get(API_URL, {
            timeout: REQUEST_TIMEOUT,
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log(
            `API call successful: ${JSON.stringify(response.data)} at ${getTime()}`
        );
    } catch (error) {
        console.error(`API call failed at ${getTime()}:`, error);
    }
};

// Schedule the cronjob to run every 2 minutes
const startCronJob = (): void => {
    cron.schedule(
        "*/5 * * * *",
        () => {
            console.log("Running cronjob at(IST):", getTime());
            void callApi(); // Using void as we don't need to await here
        },
        {
            timezone: "Asia/Kolkata",
        }
    );

    console.log(isLocal ? "Running in development mode ❤️" : "Running in production mode ❤️");
    console.log("Cronjob scheduled at every 5 minutes to check health...🥳");
};

// Start the cronjob
startCronJob();
