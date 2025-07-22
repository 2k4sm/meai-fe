import { useEffect } from 'react';
import { useToolsStore } from '../stores/useToolsStore';
import { ToolkitActionButton } from './ToolkitActionButton';


export const ToolkitList = ({ onToolkitHover, onToolkitLeave }: { onToolkitHover?: (info: any) => void; onToolkitLeave?: () => void }) => {
  const {
    toolkits,
    connections,
    connecting,
    syncing,
    error,
    fetchToolkits,
    fetchConnections,
    connectToolkit,
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
    <div className="bg-[#2A2E24]/5 backdrop-blur-xl rounded-3xl p-[5px] shadow-[0_0_14px_rgba(236,223,204,0.1)] border border-[#697565]/10 w-full flex flex-col items-center h-fit" >
      <div className="w-full flex flex-row items-center overflow-x-auto overflow-visible z-50 h-fit pt-2">
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
              onHover={onToolkitHover}
              onLeave={onToolkitLeave}
            />
          );
        })}
      </div>
    </div>
  );
}; 