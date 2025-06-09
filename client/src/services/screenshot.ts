import type { User } from "@/types/users"
import api from "./api"

export async function uploadScreenshot(file: File, user: User): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append("screenshot", file)
  formData.append("userId", user._id)
  formData.append("userName", user.name)
  

  const response = await api.post("/screenshots/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export async function getAllScreenshots(): Promise<{ _id: string; url: string; uploadedAt: string }[]> {
  const response = await api.get("/screenshots")
  return response.data
}
