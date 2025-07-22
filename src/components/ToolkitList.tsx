import React, { useEffect } from 'react';
import { useToolsStore } from '../stores/useToolsStore';
import { ToolkitActionButton } from './ToolkitActionButton';
import { ConnectionStatus } from '../types';


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

  const anyInactive = toolkits.some(slug => {
    const connection = connections.find(c => c.toolkit_slug === slug);
    return !(connection && connection.connection_status === ConnectionStatus.ACTIVE);
  });

  return (
    <div className="bg-black/5 backdrop-blur-xl rounded-3xl p-2 shadow-[0_0_14px_rgba(255,255,255,0.2)] border border-black/10 w-full flex flex-col items-center gap-2">
      <div className="w-full flex flex-row items-center overflow-x-auto p-3">
        {toolkits.map((slug) => {
          const connection = connections.find(c => c.toolkit_slug === slug);
          const isInactive = !(connection && connection.connection_status === ConnectionStatus.ACTIVE);
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
      {anyInactive && (
        <div className="w-full text-center text-xs text-blue-500 font-semibold pt-1">Authorize tools by clicking on them  to make them available for use.</div>
      )}
    </div>
  );

  
}; 