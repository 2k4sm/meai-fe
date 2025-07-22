import React from 'react';
import {
  FaGoogle,
  FaCalendarAlt,
  FaStickyNote,
  FaSlack,
  FaEnvelope,
  FaTasks,
  FaTwitter,
  FaSpinner
} from 'react-icons/fa';
import { ConnectionStatus, ToolkitConnection } from '../types';

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
  let borderColor = 'border-[#697565]/40';
  let bgColor = 'bg-[#2A2E24] hover:bg-[#3C3D37]';
  let iconColor = 'text-[#697565]';
  let grayscale = 'opacity-60';
  let extraClasses = 'hover:scale-105 hover:shadow-[0_0_20px_rgba(105,117,101,0.2)]';
  let iconExtraClasses = '';

  if (isActive) {
    buttonAction = () => {};
    buttonDisabled = true;
    tooltip = 'Connected ';
    borderColor = 'border-[#8B9A83]';
    bgColor = 'bg-[#697565]';
    iconColor = 'text-[#ECDFCC]';
    grayscale = '';
    extraClasses = 'pointer-events-none shadow-[0_0_15px_rgba(139,154,131,0.2)]';
    iconExtraClasses = 'drop-shadow-[0_0_4px_rgba(236,223,204,0.3)]';
  } else if (isPending) {
    buttonAction = onConnect;
    buttonDisabled = isConnecting || isSyncing;
    tooltip = 'Syncing... ';
    borderColor = 'border-[#697565]';
    bgColor = 'bg-[#3C3D37] hover:bg-[#4D5147]';
    iconColor = 'text-[#D4C5B3]';
    grayscale = '';
    extraClasses = 'hover:scale-105 hover:shadow-[0_0_20px_rgba(105,117,101,0.3)]';
    iconExtraClasses = 'drop-shadow-[0_0_4px_rgba(212,197,179,0.3)]';
  } else if (isDisconnected) {
    buttonAction = onConnect;
    buttonDisabled = isConnecting || isSyncing;
    tooltip = 'Connect ';
    borderColor = 'border-[#697565]/40';
    bgColor = 'bg-[#2A2E24] hover:bg-[#3C3D37]';
    iconColor = 'text-[#697565]';
    grayscale = 'opacity-60';
    extraClasses = 'hover:scale-105 hover:shadow-[0_0_20px_rgba(105,117,101,0.2)]';
  }
  tooltip += slug.replace('GOOGLE', 'Google ').replace('NOTION', 'Notion').replace('GMAIL', 'Gmail').replace('TASKS', 'Tasks');

  const iconMap: Record<string, React.ReactNode> = {
    GOOGLECALENDAR: <FaCalendarAlt size={24} className={`${iconColor} ${iconExtraClasses} transition-all duration-200`} />,
    NOTION: <FaStickyNote size={24} className={`${iconColor} ${iconExtraClasses} transition-all duration-200`} />,
    SLACKBOT: <FaSlack size={24} className={`${iconColor} ${iconExtraClasses} transition-all duration-200`} />,
    GMAIL: <FaEnvelope size={24} className={`${iconColor} ${iconExtraClasses} transition-all duration-200`} />,
    GOOGLETASKS: <FaTasks size={24} className={`${iconColor} ${iconExtraClasses} transition-all duration-200`} />,
    TWITTER: <FaTwitter size={24} className={`${iconColor} ${iconExtraClasses} transition-all duration-200`} />,
  };

  return (
    <div className={`relative group h-15 ${isActive ? 'pointer-events-none' : ''}`}
      onMouseEnter={() => !isActive && onHover && onHover({ slug, connection, status, error })}
      onMouseLeave={() => !isActive && onLeave && onLeave()}
    >
      <button
        className={`relative flex rounded-xl items-center justify-center w-14 h-14 border-2 ${borderColor} ${bgColor} mx-1 focus:outline-none focus:ring-2 focus:ring-[#697565]/60 transition-all duration-300 shadow-lg ${extraClasses} ${grayscale}`}
        onClick={buttonAction}
        disabled={buttonDisabled}
        aria-label={tooltip}
        type="button"
      >
        {isConnecting || isSyncing ? (
          <FaSpinner className="animate-spin text-2xl text-[#ECDFCC] drop-shadow-[0_0_4px_rgba(236,223,204,0.3)]" size={24} />
        ) : (
          iconMap[slug] || <FaGoogle size={24} className={`${iconColor} ${iconExtraClasses} transition-all duration-200`} />
        )}
        {error && !isActive && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[#2A2E24] shadow-[0_0_8px_rgba(239,68,68,0.4)]" />}
      </button>
    </div>
  );
}; 