import { API_BASE_URL } from './config';
import type { Message } from '../types';

export async function getMessages(conversationId: number): Promise<Message[]> {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  const data = await res.json();
  return data.messages;
}

export async function deleteMessage(conversationId: number, messageId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/${messageId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete message');
} 