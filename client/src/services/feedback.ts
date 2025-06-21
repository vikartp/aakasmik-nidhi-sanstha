import api from './api';

export interface FeedbackPayload {
  content: string;
  target: 'admin' | 'superadmin';
}

export interface Feedback {
  _id: string;
  userName: string;
  fatherName: string;
  content: string;
  target: 'admin' | 'superadmin';
  createdAt: string;
}

export const postFeedback = async (payload: FeedbackPayload) => {
  const res = await api.post('/feedback', payload);
  return res.data;
};

export const getFeedbacks = async () => {
  const res = await api.get<Feedback[]>('/feedback');
  return res.data;
};

export const deleteFeedback = async (id: string) => {
  const res = await api.delete(`/feedback/${id}`);
  return res.data;
};
