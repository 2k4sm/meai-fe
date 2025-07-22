import React from 'react';
import { ToolkitConnection, ConnectionStatus } from '../types';
import { FaGoogle, FaRegCalendarAlt, FaRegStickyNote, FaGoogleDrive, FaEnvelope, FaTasks } from 'react-icons/fa';

const toolkitIcons: Record<string, React.ReactNode> = {
  GOOGLECALENDAR: <FaRegCalendarAlt size={20} />,
  NOTION: <FaRegStickyNote size={20} />,
  GOOGLEDRIVE: <FaGoogleDrive size={20} />,
  GMAIL: <FaEnvelope size={20} />,
  GOOGLETASKS: <FaTasks size={20} />,
};

interface ToolkitActionButtonProps {
  slug: string;
  connection?: ToolkitConnection;
  isConnecting: boolean;
  isSyncing: boolean;
  error?: string | null;
  onConnect: () => void;
  onEnable: () => void;
  onDisable: () => void;
}

export const ToolkitActionButton: React.FC<ToolkitActionButtonProps> = ({
  slug,
  connection,
  isConnecting,
  isSyncing,
  error,
  onConnect,
  onEnable,
  onDisable,
}) => {
  const status = connection?.connection_status || ConnectionStatus.DISCONNECTED;
  const isActive = status === ConnectionStatus.ACTIVE;
  const isPending = status === ConnectionStatus.PENDING;
  const isFailed = status === ConnectionStatus.FAILED;
  const isDisconnected = status === ConnectionStatus.DISCONNECTED;

  let buttonLabel = 'Connect';
  let buttonAction = onConnect;
  let buttonDisabled = isConnecting || isSyncing;
  let tooltip = '';
  let borderColor = 'border-gray-300';
  let bgColor = 'bg-white/80';
  let cardButtonColor = 'bg-blue-500 text-white hover:bg-blue-600';

  if (isActive) {
    buttonLabel = 'Disable';
    buttonAction = onDisable;
    buttonDisabled = isSyncing;
    tooltip = 'Disable ';
    borderColor = 'border-green-500';
    bgColor = 'bg-green-100';
    cardButtonColor = 'bg-red-500 text-white hover:bg-red-600';
  } else if (isPending) {
    buttonLabel = 'Syncing...';
    buttonDisabled = true;
    tooltip = 'Syncing...';
    borderColor = 'border-yellow-500';
    bgColor = 'bg-yellow-100';
    cardButtonColor = 'bg-gray-300 text-gray-500';
  } else if (connection && !isActive && !isPending) {
    buttonLabel = 'Enable';
    buttonAction = onEnable;
    buttonDisabled = isSyncing;
    tooltip = 'Enable ';
    borderColor = 'border-blue-500';
    bgColor = 'bg-blue-100';
    cardButtonColor = 'bg-blue-500 text-white hover:bg-blue-600';
  } else {
    tooltip = 'Connect ';
  }
  tooltip += slug.replace('GOOGLE', 'Google ').replace('NOTION', 'Notion').replace('GMAIL', 'Gmail').replace('TASKS', 'Tasks');


  return (
    <button
      className={`relative flex items-center justify-center w-9 h-9 rounded-full border-2 ${borderColor} ${bgColor} mx-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 shadow-sm`}
      onClick={buttonAction}
      disabled={buttonDisabled}
      title={tooltip + (error ? `\n${error}` : '')}
      aria-label={tooltip}
      type="button"
    >
      {isConnecting || isSyncing ? (
        <span className="animate-spin text-xs">⏳</span>
      ) : (
        toolkitIcons[slug] || <FaGoogle size={20} />
      )}
      {error && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />}
    </button>
  );
}; 