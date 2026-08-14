import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Stream Event Types (mirrors server) ──────────────────────────────

export type StreamEvent =
  | { type: 'status'; message: string }
  | { type: 'tool_call'; tool: string; args: Record<string, any> }
  | { type: 'tool_result'; tool: string; duration_ms: number }
  | { type: 'text_delta'; delta: string }
  | { type: 'done'; total_ms: number }
  | { type: 'error'; message: string };

// ─── Non-Streaming (legacy) ───────────────────────────────────────────

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

// ─── Streaming (SSE) ──────────────────────────────────────────────────

const getBaseUrl = (): string => {
  const isLocalhost = window.location.hostname === 'localhost';
  return isLocalhost
    ? 'http://localhost:5000'
    : 'https://aakasmik-nidhi-backend.onrender.com';
};

export const streamChatMessage = async (
  message: string,
  history: ChatMessage[],
  onEvent: (event: StreamEvent) => void,
  abortSignal?: AbortSignal
): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        history: history.slice(-10),
      }),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg =
        response.status === 429
          ? 'Too many messages! Please wait a moment before trying again.'
          : response.status === 400
            ? errorData?.error || 'Invalid message. Please try again.'
            : 'Something went wrong. Please try again later.';
      onEvent({ type: 'error', message: errorMsg });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onEvent({ type: 'error', message: 'Streaming not supported by browser.' });
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete last line in buffer

      let currentData = '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          currentData = line.slice(6);
        } else if (line === '' && currentData) {
          // Empty line = end of event
          try {
            const event = JSON.parse(currentData) as StreamEvent;
            onEvent(event);
          } catch (e) {
            console.warn('Failed to parse SSE event:', currentData);
          }
          currentData = '';
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // User cancelled, no need to emit error
      return;
    }
    onEvent({
      type: 'error',
      message: 'Unable to reach the server. Please check your connection.',
    });
  }
};
