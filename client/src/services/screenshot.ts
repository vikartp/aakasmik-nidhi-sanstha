import api from './api';
import type { User } from './user';

export type Screenshot = {
  _id: string;
  userId: string;
  url: string;
  uploadedAt: Date;
  uploadMonth: string;
  uploadYear: string;
  type: 'payment' | 'qrCode';
  verified: boolean;
  rejected?: string;
};

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
  uploadMonth?: Month
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('screenshot', file);
  formData.append('userId', user._id);
  formData.append(
    'uploadMonth',
    uploadMonth ?? new Date().toLocaleString('default', { month: 'long' })
  );
  if (isQrCode) {
    formData.append('type', 'qrCode');
  }

  const response = await api.post('/screenshots/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

// export async function getAllScreenshots(): Promise<Screenshot[]> {
//   const response = await api.get('/screenshots');
//   return response.data;
// }

export async function deleteScreenshot(id: string): Promise<void> {
  await api.delete(`/screenshots/${id}`);
}

export async function getScreenshotById(id: string): Promise<Screenshot> {
  const response = await api.get(`/screenshots/${id}`);
  return response.data;
}

export async function getScreenshotsByUserId(
  userId: string
): Promise<{ _id: string; url: string; uploadedAt: string }[]> {
  const response = await api.get(`/screenshots/user/${userId}`);
  return response.data;
}

/**
 * It is assumed that we have screenshots for current year month only.
 * Don't forget to delete screenshots for previous months.
 * @param month
 * @returns
 */
export async function getScreenshotsByMonth(
  month: Month
): Promise<Screenshot[]> {
  const response = await api.get(`/screenshots/month/${month}`);
  return response.data;
}

export async function getScreenshotsByUserIdAndMonth(
  userId: string,
  month: Month
): Promise<Screenshot[]> {
  const response = await api.get(`/screenshots/user/${userId}/month/${month}`);
  return response.data;
}

export async function getQrCode(): Promise<Screenshot> {
  const response = await api.get(`/public/qr`);
  return response.data;
}

export async function rejectScreenshot(data: {
  screenshotId: string;
  rejectionReason: string;
}): Promise<void> {
  const response = await api.post('/screenshots/reject', data);
  return response.data;
}
