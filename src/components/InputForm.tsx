import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { ToolkitList } from './ToolkitList';
import { ConnectionStatus, ToolkitConnection } from '../types';
import { useToolsStore } from '../stores/useToolsStore';

const InputForm = ({ onSubmit, disabled }: { onSubmit: (input: string) => void; disabled: boolean }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [hoveredToolkit, setHoveredToolkit] = useState<{
    slug: string;
    connection?: ToolkitConnection;
    status: ConnectionStatus | undefined;
    error?: string | null;
  } | null>(null);

  const { toolkits, connections } = useToolsStore();
  const anyInactive = toolkits.some(slug => {
    const connection = connections.find(c => c.toolkit_slug === slug);
    return !(connection && connection.connection_status === ConnectionStatus.ACTIVE);
  });

  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    const minHeight = 60;
    const maxHeight = 300;
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = newHeight + 'px';
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  const resetTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = '60px';
    textarea.style.overflowY = 'hidden';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || disabled) return;
    onSubmit(input);
    setInput('');
    if (inputRef.current) {
      resetTextareaHeight(inputRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    } else if (e.key === 'Escape') {
      resetTextareaHeight(e.target as HTMLTextAreaElement);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      setTimeout(() => adjustTextareaHeight(e.target as HTMLTextAreaElement), 0);
    }
  };

  const buttonColor = input.trim()
    ? 'bg-[#697565] hover:bg-[#8B9A83] shadow-[0_0_20px_rgba(105,117,101,0.2)] hover:shadow-[0_0_30px_rgba(139,154,131,0.3)]'
    : 'bg-[#3C3D37] hover:bg-[#4D5147] shadow-[0_0_15px_rgba(60,61,55,0.2)] hover:shadow-[0_0_25px_rgba(77,81,71,0.3)]';

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[85%] lg:w-[70%] min-w-[260px] max-w-3xl z-40 pointer-events-none flex flex-col items-center justify-center">
      <div className="bg-[#2A2E24]/80 backdrop-blur-xl rounded-3xl p-4 shadow-[0_0_30px_rgba(42,46,36,0.4)] border border-[#697565]/30 flex flex-col gap-4 relative pointer-events-auto w-full">
        <ToolkitList
          onToolkitHover={setHoveredToolkit}
          onToolkitLeave={() => setHoveredToolkit(null)}
        />
        {hoveredToolkit && (
          <div className="absolute left-1/2 top-0 z-50 w-full flex justify-center pointer-events-none" style={{ transform: 'translate(-50%, -110%)' }}>
            <div className="bg-[#2A2E24] text-[#ECDFCC] text-xs rounded-xl px-4 py-3 shadow-[0_0_25px_rgba(42,46,36,0.4)] whitespace-pre-line max-w-xs text-center border border-[#697565]/40 pointer-events-auto">
              <div className="font-semibold mb-2">{hoveredToolkit.slug.replace('GOOGLE', 'Google ').replace('NOTION', 'Notion').replace('GMAIL', 'Gmail').replace('TASKS', 'Tasks')}</div>
              <div>Status: <span className="font-mono text-[#8B9A83]">{hoveredToolkit.status || 'disconnected'}</span></div>
              {hoveredToolkit.error && <div className="text-red-400 mt-2">{hoveredToolkit.error}</div>}
              {hoveredToolkit.connection?.last_synced_at && <div className="text-[#D4C5B3] mt-2">Last synced: {new Date(hoveredToolkit.connection.last_synced_at).toLocaleString()}</div>}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1 bg-[#2A2E24]/80 backdrop-blur-lg rounded-2xl shadow-[0_0_25px_rgba(42,46,36,0.3)] border border-[#697565]/30">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight(e.target);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={disabled}
              autoFocus
              rows={1}
              className="w-full p-5 bg-transparent text-[#ECDFCC] placeholder-[#697565] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#697565]/60 focus:shadow-[0_0_30px_rgba(105,117,101,0.3)] disabled:opacity-60 transition-all duration-300 resize-none overflow-hidden min-h-[60px] max-h-[200px]"
              style={{ height: '60px', minHeight: '60px' }}
            />
          </div>
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className={`h-[60px] w-[60px] ${buttonColor} flex items-center justify-center text-[#ECDFCC] rounded-2xl backdrop-blur-lg border border-[#697565]/40 focus:outline-none focus:ring-2 focus:ring-[#697565]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0 group hover:scale-105 active:scale-95`}
          >
            <FaPaperPlane className="w-5 h-5 drop-shadow-[0_0_4px_rgba(236,223,204,0.3)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" />
          </button>
        </form>
      </div>
      {anyInactive && (
        <div className="w-full text-center text-xs text-[#8B9A83] font-semibold pt-3 drop-shadow-[0_0_4px_rgba(139,154,131,0.3)]">
          Authorize tools by clicking on them to make them available for use.
        </div>
      )}
    </div>
  );
};

export default InputForm; 