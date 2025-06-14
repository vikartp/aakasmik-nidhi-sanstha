import api from './api';

export const makeAdminReq = async (userId: string) => {
  const response = await api.put(`/users/make-admin/${userId}`);
  if (response.status !== 200) {
    console.error('Error making user admin:', response);
    throw new Error('Failed to make user admin');
  }
  return response.data;
};

export const verifyMemberReq = async (userId: string) => {
  const response = await api.put(`/users/verify-member/${userId}`);
  if (response.status !== 200) {
    console.error('Error verifying member:', response);
    throw new Error('Failed to verify member');
  }
  return response.data;
};
