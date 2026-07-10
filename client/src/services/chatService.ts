import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    const response = await api.post('/chat/message', {
      message,
      history: history.slice(-10), // Send last 10 messages for context
    });
    return response.data.reply;
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      if (status === 429) {
        return 'Too many messages! Please wait a moment before trying again.';
      }
      if (status === 400) {
        return (
          error.response.data?.error || 'Invalid message. Please try again.'
        );
      }
      return 'Something went wrong. Please try again later.';
    }
    return 'Unable to reach the server. Please check your connection.';
  }
};
