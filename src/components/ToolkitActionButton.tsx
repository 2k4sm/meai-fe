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
  const status = connection?.connection_status;
  const isActive = status === ConnectionStatus.ACTIVE;
  const isFailed = status === ConnectionStatus.FAILED;
  const isDisconnected = status === ConnectionStatus.DISCONNECTED || !connection;
  const isPending = status === ConnectionStatus.PENDING;

  let buttonLabel = 'Connect';
  let buttonAction = onConnect;
  let buttonDisabled = isConnecting || isSyncing;
  let tooltip = '';
  let borderColor = 'border-gray-400';
  let bgColor = 'bg-gray-100';
  let iconColor = 'text-gray-400';
  let grayscale = 'grayscale opacity-60';

  if (isActive) {
    buttonLabel = 'Disable';
    buttonAction = onDisable;
    buttonDisabled = isSyncing;
    tooltip = 'Disable ';
    borderColor = 'border-green-500';
    bgColor = 'bg-green-100';
    iconColor = 'text-green-500';
    grayscale = '';
  } else if (isFailed) {
    buttonLabel = 'Retry';
    buttonAction = onConnect;
    buttonDisabled = false;
    tooltip = 'Retry connection ';
    borderColor = 'border-red-500';
    bgColor = 'bg-red-100';
    iconColor = 'text-red-500';
    grayscale = '';
  } else if (connection && !isActive && !isFailed) {
    buttonLabel = 'Enable';
    buttonAction = onEnable;
    buttonDisabled = isSyncing;
    tooltip = 'Enable ';
    borderColor = 'border-gray-400';
    bgColor = 'bg-gray-100';
    iconColor = 'text-gray-400';
    grayscale = 'grayscale opacity-60';
  } else {
    // Disconnected or no connection
    buttonLabel = 'Connect';
    buttonAction = onConnect;
    buttonDisabled = isConnecting || isSyncing;
    tooltip = 'Connect ';
    borderColor = 'border-gray-400';
    bgColor = 'bg-gray-100';
    iconColor = 'text-gray-400';
    grayscale = 'grayscale opacity-60';
  }
  tooltip += slug.replace('GOOGLE', 'Google ').replace('NOTION', 'Notion').replace('GMAIL', 'Gmail').replace('TASKS', 'Tasks');

  // Icon rendering with color
  const iconMap: Record<string, React.ReactNode> = {
    GOOGLECALENDAR: <FaRegCalendarAlt size={28} className={iconColor} />,
    NOTION: <FaRegStickyNote size={28} className={iconColor} />,
    GOOGLEDRIVE: <FaGoogleDrive size={28} className={iconColor} />,
    GMAIL: <FaEnvelope size={28} className={iconColor} />,
    GOOGLETASKS: <FaTasks size={28} className={iconColor} />,
  };

  return (
    <div className="relative group">
      <button
        className={`relative flex items-center justify-center w-14 h-14 border-2 ${borderColor} ${bgColor} mx-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 shadow-lg hover:scale-110 hover:shadow-2xl active:scale-95 ${grayscale}`}
        onClick={buttonAction}
        disabled={buttonDisabled}
        aria-label={tooltip}
        type="button"
        style={{ borderRadius: '9999px' }}
      >
        {isConnecting || isSyncing ? (
          <span className="animate-spin text-2xl">⏳</span>
        ) : (
          iconMap[slug] || <FaGoogle size={28} className={iconColor} />
        )}
        {error && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />}
      </button>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto bg-black text-white text-xs rounded px-2 py-1 shadow-lg z-50 whitespace-nowrap transition-opacity duration-200">
        {tooltip + (error ? `\n${error}` : '')}
      </div>
    </div>
  );
}; 