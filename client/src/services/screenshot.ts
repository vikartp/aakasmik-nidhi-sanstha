import { api } from "./api"

export async function uploadScreenshot(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append("screenshot", file)

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
