export type Screenshot = {
  _id: string;
  userId: string;
  url: string;
  uploadedAt: Date;
  uploadMonth: string;
  type: 'payment' | 'qrCode';
  verified: boolean;
};
