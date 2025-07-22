import React, { useEffect } from 'react';
import { useToolsStore } from '../stores/useToolsStore';
import { ToolkitActionButton } from './ToolkitActionButton';


export const ToolkitList = () => {
  const {
    toolkits,
    connections,
    connecting,
    syncing,
    error,
    fetchToolkits,
    fetchConnections,
    connectToolkit,
    enableToolkit,
    disableToolkit,
    syncConnectionPeriodically,
    pendingConnections,
  } = useToolsStore();

  useEffect(() => {
    fetchToolkits();
    fetchConnections();
  }, []);

  useEffect(() => {
    Object.entries(pendingConnections).forEach(([slug, connectionRequestId]) => {
      syncConnectionPeriodically(connectionRequestId, slug);
    });
  }, [pendingConnections, syncConnectionPeriodically]);

    return (
      <div className="w-full flex flex-row items-center overflow-x-auto py-2 px-1 gap-1 bg-white/40 rounded-t-xl shadow-md backdrop-blur-md border-b border-white/30 max-w-full">
        {toolkits.map((slug) => {
          const connection = connections.find(c => c.toolkit_slug === slug);
          return (
            <ToolkitActionButton
              key={slug}
              slug={slug}
              connection={connection}
              isConnecting={!!connecting[slug]}
              isSyncing={!!syncing[slug]}
              error={error}
              onConnect={() => connectToolkit(slug)}
              onEnable={() => enableToolkit(slug)}
              onDisable={() => disableToolkit(slug)}
            />
          );
        })}
      </div>
    );

  
}; 