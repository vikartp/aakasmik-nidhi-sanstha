import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { User } from "@/types/users";
import { UploadScreenshot } from "../UploadScreenshot";
import { useEffect, useState } from "react";
import Admin from "./Admin";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loggedInUser] = useState<User | null>(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  switch (loggedInUser?.role) {
    case "admin":
      return (
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            <Button onClick={() => navigate("/logout")}>Logout</Button>
          </div>
          <UploadScreenshot />
          <Admin />
        </div>
      );
    case "superadmin":
      return (
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold mb-4">Superadmin Dashboard</h1>
            <Button onClick={() => navigate("/logout")}>Logout</Button>
          </div>
          <UploadScreenshot />
          <p className="text-gray-600 mb-6">Superadmin-specific content...</p>
        </div>
      );
    default:
      return (
        <div>
          <div>
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold mb-4">
                Hi {loggedInUser?.name}
              </h1>
              <Button onClick={() => navigate("/logout")}>Logout</Button>
            </div>
            <p className="text-gray-600 mb-6">
              Welcome to the dashboard! Here you can upload
              screenshots.
            </p>
          </div>
          <UploadScreenshot />
        </div>
      );
  }
}
