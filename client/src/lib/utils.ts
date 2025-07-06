import { clsx, type ClassValue } from 'clsx';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import { type Month } from '@/services/screenshot';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function downloadImage(url: string, filename = 'image.png') {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);
    toast.success('Image downloaded successfully!');
  } catch (error) {
    console.error('Failed to download image:', error);
  }
}

export function getMonthList() {
  return [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
}

export function getMonthName(date: string) {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format');
  }
  return getMonthList()[parsedDate.getMonth()];
}

export function getYear(date: string) {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format');
  }
  return parsedDate.getFullYear().toString();
}

export function getCurrentMonth(): Month {
  const now = new Date();
  return getMonthList()[now.getMonth()] as Month;
}

export function getAvatarLink(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
}
