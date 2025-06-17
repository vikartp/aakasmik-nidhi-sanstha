export type Screenshot = {
  _id: string;
  userId: string;
  url: string;
  uploadedAt: Date;
  uploadMonth: string;
  uploadYear: string;
  type: 'payment' | 'qrCode';
  verified: boolean;
};
