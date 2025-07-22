import React from 'react';
import { ToolkitConnection, ConnectionStatus } from '../types';
import { FaGoogle, FaRegCalendarAlt, FaRegStickyNote, FaEnvelope, FaTasks, FaTwitter, FaSlack } from 'react-icons/fa';

interface ToolkitActionButtonProps {
  slug: string;
  connection?: ToolkitConnection;
  isConnecting: boolean;
  isSyncing: boolean;
  error?: string | null;
  onConnect: () => void;
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
  onHover,
  onLeave,
}) => {
  const status = connection?.connection_status;
  const isActive = status === ConnectionStatus.ACTIVE;
  const isPending = status === ConnectionStatus.PENDING;
  const isDisconnected = !status || status === undefined || status === null;

  let buttonAction = onConnect;
  let buttonDisabled = isConnecting || isSyncing;
  let tooltip = '';
  let borderColor = 'border-gray-400';
  let bgColor = 'bg-gray-100';
  let iconColor = 'text-gray-400';
  let grayscale = 'grayscale opacity-60';
  let extraClasses = '';

  if (isActive) {
    buttonAction = () => {};
    buttonDisabled = true;
    tooltip = 'Connected ';
    borderColor = 'border-green-600';
    bgColor = 'bg-green-600'; // strong solid green
    iconColor = 'text-green-600'; // green icon on green button
    grayscale = '';
    extraClasses = 'pointer-events-none';
  } else if (isPending) {
    buttonAction = onConnect;
    buttonDisabled = isConnecting || isSyncing;
    tooltip = 'Syncing... ';
    borderColor = 'border-blue-400';
    bgColor = 'bg-blue-100';
    iconColor = 'text-blue-400';
    grayscale = '';
  } else if (isDisconnected) {
    buttonAction = onConnect;
    buttonDisabled = isConnecting || isSyncing;
    tooltip = 'Connect ';
    borderColor = 'border-gray-400';
    bgColor = 'bg-gray-100';
    iconColor = 'text-gray-400';
    grayscale = 'grayscale opacity-60';
  }
  tooltip += slug.replace('GOOGLE', 'Google ').replace('NOTION', 'Notion').replace('GMAIL', 'Gmail').replace('TASKS', 'Tasks');

  const iconMap: Record<string, React.ReactNode> = {
    GOOGLECALENDAR: <FaRegCalendarAlt size={28} className={iconColor} />,
    NOTION: <FaRegStickyNote size={28} className={iconColor} />,
    SLACKBOT: <FaSlack size={28} className={iconColor} />,
    GMAIL: <FaEnvelope size={28} className={iconColor} />,
    GOOGLETASKS: <FaTasks size={28} className={iconColor} />,
    TWITTER: <FaTwitter size={28} className={iconColor} />,
  };

  return (
    <div className={`relative group h-15 ${isActive ? 'pointer-events-none' : ''}`}
      onMouseEnter={() => !isActive && onHover && onHover({ slug, connection, status, error })}
      onMouseLeave={() => !isActive && onLeave && onLeave()}
    >
      <button
        className={`relative flex rounded-full items-center justify-center w-14 h-14 border-2 ${borderColor} ${bgColor} mx-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 shadow-lg ${isActive ? '' : 'hover:scale-110 hover:shadow-2xl active:scale-95'} ${grayscale} ${extraClasses}`}
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
        {error && !isActive && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />}
      </button>
    </div>
  );
}; 