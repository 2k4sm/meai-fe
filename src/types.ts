export interface Message {
  message_id: number;
  conversation_id: number;
  user_id: number;
  type: 'Human' | 'AI' | 'TOOL';
  content: string;
  created_at: string;
  status?: 'pending' | 'failed';
} 