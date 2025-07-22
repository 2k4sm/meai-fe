import React from 'react';
import { ToolkitConnection, ConnectionStatus } from '../types';
import { FaGoogle, FaRegCalendarAlt, FaRegStickyNote, FaGoogleDrive, FaEnvelope, FaTasks } from 'react-icons/fa';

interface ToolkitActionButtonProps {
  slug: string;
  connection?: ToolkitConnection;
  isConnecting: boolean;
  isSyncing: boolean;
  error?: string | null;
  onConnect: () => void;
  onEnable: () => void;
  onDisable: () => void;
  onHover?: (info: { slug: string; connection?: ToolkitConnection; status: ConnectionStatus | undefined; error?: string | null }) => void;
  onLeave?: () => void;
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
  onHover,
  onLeave,
}) => {
  const status = connection?.connection_status;
  const isActive = status === ConnectionStatus.ACTIVE;
  const isFailed = status === ConnectionStatus.FAILED;

  let buttonAction = onConnect;
  let buttonDisabled = isConnecting || isSyncing;
  let tooltip = '';
  let borderColor = 'border-gray-400';
  let bgColor = 'bg-gray-100';
  let iconColor = 'text-gray-400';
  let grayscale = 'grayscale opacity-60';

  if (isActive) {
    buttonAction = onDisable;
    buttonDisabled = isSyncing;
    tooltip = 'Disable ';
    borderColor = 'border-green-500';
    bgColor = 'bg-green-100';
    iconColor = 'text-green-500';
    grayscale = '';
  } else if (status === ConnectionStatus.PENDING) {
    buttonAction = onConnect;
    buttonDisabled = isConnecting || isSyncing;
    tooltip = 'Connect ';
    borderColor = 'border-gray-400';
    bgColor = 'bg-gray-100';
    iconColor = 'text-gray-400';
    grayscale = 'grayscale opacity-60';
  } else if (isFailed) {
    buttonAction = onConnect;
    buttonDisabled = false;
    tooltip = 'Retry connection ';
    borderColor = 'border-red-500';
    bgColor = 'bg-red-100';
    iconColor = 'text-red-500';
    grayscale = '';
  } else if (connection && !isActive && !isFailed) {
    buttonAction = onEnable;
    buttonDisabled = isSyncing;
    tooltip = 'Enable ';
    borderColor = 'border-gray-400';
    bgColor = 'bg-gray-100';
    iconColor = 'text-gray-400';
    grayscale = 'grayscale opacity-60';
  } else {
    // Disconnected or no connection
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
    <div className="relative group h-20"
      onMouseEnter={() => onHover && onHover({ slug, connection, status, error })}
      onMouseLeave={() => onLeave && onLeave()}
    >
      <button
        className={`relative flex rounded-full items-center justify-center w-14 h-14 border-2 ${borderColor} ${bgColor} mx-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 shadow-lg hover:scale-110 hover:shadow-2xl active:scale-95 ${grayscale}`}
        onClick={buttonAction}
        disabled={buttonDisabled}
        aria-label={tooltip}
        type="button"
      >
        {isConnecting || isSyncing ? (
          <span className="animate-spin text-2xl">⏳</span>
        ) : (
          iconMap[slug] || <FaGoogle size={28} className={iconColor} />
        )}
        {error && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />}
      </button>
    </div>
  );
}; 