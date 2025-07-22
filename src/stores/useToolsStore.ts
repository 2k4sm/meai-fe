import { create } from 'zustand';
import {
  getToolkits,
  connectToolkit as apiConnectToolkit,
  enableToolkit,
  disableToolkit,
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
  enableToolkit: (slug: string) => Promise<void>;
  disableToolkit: (slug: string) => Promise<void>;
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
      for (let i = 0; i < 30; i++) {
        const res = await syncConnection(connectionRequestId);
        status = res.connection_status as ConnectionStatus;
        if (status === ConnectionStatus.ACTIVE) {
          break;
        }
        await new Promise(res => setTimeout(res, 2000));
      }
      await get().fetchConnections();
      get().clearPendingConnection(slug);
    } catch (e: any) {
      set(state => ({ syncing: { ...state.syncing, [slug]: false }, error: e.message }));
      return;
    }
    set(state => ({
      syncing: { ...state.syncing, [slug]: false },
      connecting: { ...state.connecting, [slug]: false },
      error: null,
    }));
  },

  enableToolkit: async (slug: string) => {
    set(state => ({ syncing: { ...state.syncing, [slug]: true }, error: null }));
    try {
      await enableToolkit(slug);
      await get().fetchConnections();
      set({ error: null });
    } catch (e: any) {
      set(state => ({ error: e.message }));
    }
    set(state => ({ syncing: { ...state.syncing, [slug]: false } }));
  },

  disableToolkit: async (slug: string) => {
    set(state => ({ syncing: { ...state.syncing, [slug]: true }, error: null }));
    try {
      await disableToolkit(slug);
      await get().fetchConnections();
      set({ error: null });
    } catch (e: any) {
      set(state => ({ error: e.message }));
    }
    set(state => ({ syncing: { ...state.syncing, [slug]: false } }));
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