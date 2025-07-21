import { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';

const InputForm = ({ onSubmit, disabled }: { onSubmit: (input: string) => void; disabled: boolean }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    ? 'bg-blue-400/90 hover:bg-blue-500/90'
    : 'bg-blue-600/90 hover:bg-blue-700/90';

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] lg:w-[50%] z-50">
      <div className="bg-black/5 backdrop-blur-xl rounded-3xl p-2 shadow-[0_0_14px_rgba(255,255,255,0.2)] border border-black/10">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1 bg-black/15 backdrop-blur-lg rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-black/20">
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
              className="w-full p-5 bg-transparent text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-60 transition-all duration-200 resize-none overflow-hidden min-h-[60px] max-h-[200px]"
              style={{ height: '60px', minHeight: '60px' }}
            />
          </div>
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className={`h-[60px] w-[60px] ${buttonColor} flex items-center justify-center text-white rounded-2xl ${buttonColor} backdrop-blur-lg shadow-[0_12px_24px_rgba(37,99,235,0.3)] border border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0`}
          >
            <FiSend className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputForm; 