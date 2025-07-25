import { create } from 'zustand';
import {
  getToolkits,
  connectToolkit as apiConnectToolkit,
  getConnections,
  getConnectionStatus,
  syncConnection,
} from '../api/tools';
import { ToolkitConnection, ConnectionStatus } from '../types';

interface ToolsStoreState {
  toolkits: string[];
  connections: ToolkitConnection[];
  userId: number | null;
  connecting: { [slug: string]: boolean };
  syncing: { [slug: string]: boolean };
  error: string | null;
  pendingConnections: { [slug: string]: string };
  setPendingConnection: (slug: string, connectionRequestId: string) => void;
  clearPendingConnection: (slug: string) => void;
  fetchToolkits: () => Promise<void>;
  fetchConnections: () => Promise<void>;
  connectToolkit: (slug: string) => Promise<void>;
  syncConnectionPeriodically: (connectionRequestId: string, slug: string) => Promise<void>;
  getConnectionStatus: (slug: string) => Promise<ToolkitConnection | null>;
  reset: () => void;
}

export const useToolsStore = create<ToolsStoreState>((set, get) => ({
  toolkits: [],
  connections: [],
  userId: null,
  connecting: {},
  syncing: {},
  error: null,
  pendingConnections: {},
  setPendingConnection: (slug, connectionRequestId) => {
    set(state => ({
      pendingConnections: { ...state.pendingConnections, [slug]: connectionRequestId }
    }));
  },
  clearPendingConnection: (slug) => {
    set(state => {
      const { [slug]: _, ...rest } = state.pendingConnections;
      return { pendingConnections: rest };
    });
  },

  fetchToolkits: async () => {
    try {
      const { toolkits, user_id } = await getToolkits();
      set({ toolkits, userId: user_id, error: null });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fetchConnections: async () => {
    try {
      const { connections } = await getConnections();
      set({ connections, error: null });
      connections.forEach((conn: ToolkitConnection) => {
        if (conn.connection_status === ConnectionStatus.PENDING) {
          get().clearPendingConnection(conn.toolkit_slug);
        }
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  connectToolkit: async (slug: string) => {
    set(state => ({ connecting: { ...state.connecting, [slug]: true }, error: null }));
    try {
      const { connection_request_id, redirect_url } = await apiConnectToolkit(slug);
      get().setPendingConnection(slug, connection_request_id);
      const win = window.open(redirect_url, '_blank', 'noopener,noreferrer');
      if (!win) {
        set(state => ({
          connecting: { ...state.connecting, [slug]: false },
          error: 'Popup blocked. Please allow popups and try again.',
        }));
      } else {
        setTimeout(() => {
          set(state => ({
            connecting: { ...state.connecting, [slug]: false },
          }));
        }, 60000);
      }
    } catch (e: any) {
      set(state => ({ connecting: { ...state.connecting, [slug]: false }, error: e.message }));
    }
  },

  syncConnectionPeriodically: async (connectionRequestId: string, slug: string) => {
    set(state => ({ syncing: { ...state.syncing, [slug]: true }, error: null }));
    let status: ConnectionStatus | null = null;
    try {
      for (let i = 0; i < 30; i++) { // Try 30 times
        const res = await syncConnection(connectionRequestId);
        status = res.connection_status as ConnectionStatus;
        if (status === ConnectionStatus.ACTIVE) {
          break;
        }
        await new Promise(res => setTimeout(res, 2000));
      }
      await get().fetchConnections();
      // If not ACTIVE after 5 tries, clear pendingConnection for this slug
      const conn = get().connections.find(c => c.toolkit_slug === slug);
      if (!conn || conn.connection_status !== ConnectionStatus.ACTIVE) {
        get().clearPendingConnection(slug);
      } else {
        get().clearPendingConnection(slug); // Always clear after success too
      }
    } catch (e: any) {
      set(state => ({ syncing: { ...state.syncing, [slug]: false }, error: e.message }));
      get().clearPendingConnection(slug); // Also clear on error
      return;
    }
    set(state => ({
      syncing: { ...state.syncing, [slug]: false },
      connecting: { ...state.connecting, [slug]: false },
      error: null,
    }));
  },

  getConnectionStatus: async (slug: string) => {
    try {
      const connection = await getConnectionStatus(slug);
      return connection;
    } catch (e: any) {
      set({ error: e.message });
      return null;
    }
  },

  reset: () => {
    set({
      toolkits: [],
      connections: [],
      userId: null,
      connecting: {},
      syncing: {},
      error: null,
      pendingConnections: {},
    });
  },
})); 