import { api } from "./api"

export async function uploadScreenshot(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append("screenshot", file)

  const response = await api.post("/screenshots/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data // Expects { url: string } from backend
}
