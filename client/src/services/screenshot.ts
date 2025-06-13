import type { User } from '@/types/users';
import api from './api';
import type { Screenshot } from '@/types/screenshots';

export type Month =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

export async function uploadScreenshot(
  file: File,
  user: User,
  isQrCode = false,
  uploadMonth?: Month,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('screenshot', file);
  formData.append('userId', user._id);
  formData.append('userName', user.name);
  formData.append('fatherName', user.fatherName);
  if (isQrCode) {
    formData.append('type', 'qrCode');
  }

  if (uploadMonth) {
    formData.append('uploadMonth', uploadMonth);
  }

  const response = await api.post('/screenshots/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function getAllScreenshots(): Promise<
  Screenshot[]
> {
  const response = await api.get('/screenshots');
  return response.data;
}

export async function deleteScreenshot(id: string): Promise<void> {
  await api.delete(`/screenshots/${id}`);
}

export async function getScreenshotById(
  id: string,
): Promise<{ _id: string; url: string; uploadedAt: string }> {
  const response = await api.get(`/screenshots/${id}`);
  return response.data;
}

export async function getScreenshotsByUserId(
  userId: string,
): Promise<{ _id: string; url: string; uploadedAt: string }[]> {
  const response = await api.get(`/screenshots/user/${userId}`);
  return response.data;
}

export async function getScreenshotsByMonth(
  month: Month,
): Promise<{ _id: string; url: string; uploadedAt: string }[]> {
  const response = await api.get(`/screenshots/month/${month}`);
  return response.data;
}

export async function getScreenshotsByUserIdAndMonth(
  userId: string,
  month: Month,
): Promise<{ _id: string; url: string; uploadedAt: string }[]> {
  const response = await api.get(`/screenshots/user/${userId}/month/${month}`);
  return response.data;
}

export async function getScreenshotsByQrCode(): Promise<Screenshot> {
  const response = await api.get(`/screenshots/qrCode`);
  return response.data;
}
