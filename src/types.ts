export interface Message {
  message_id: number;
  conversation_id: number;
  user_id: number;
  type: 'Human' | 'AI' | 'TOOL';
  content: string;
  created_at: string;
  status?: 'pending' | 'failed';
}

export enum ConnectionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FAILED = 'failed',
  DISCONNECTED = 'disconnected',
}

export interface ToolkitConnection {
  connection_id: number;
  user_id: number;
  toolkit_slug: string;
  connection_status: ConnectionStatus;
  connected_account_id?: string;
  auth_config_id?: string;
  connection_request_id?: string;
  last_synced_at?: string;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
} 