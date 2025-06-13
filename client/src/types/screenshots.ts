export type Screenshot = {
  _id: string;
  userId: string;
  userName: string;
  fatherName: string;
  url: string;
  uploadedAt: Date;
  uploadMonth: string;
  type: 'payment' | 'qrCode';
  verified: boolean;
};
