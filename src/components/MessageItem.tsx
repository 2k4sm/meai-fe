import { useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from 'dompurify';
import type { Message } from '../types';

interface MessageItemProps {
  message: Message;
  status?: string;
}

const MessageItem = ({ message, status }: MessageItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isUser = message.type === 'Human';
  const effectiveStatus = status || message.status;

  useEffect(() => {
    if (contentRef.current) {
      const parsedText = marked.parse(message.content || "") as string;
      contentRef.current.innerHTML = DOMPurify.sanitize(parsedText);
    }
  }, [message.content]);

  let statusIndicator = null;
  if (effectiveStatus === "pending") {
    statusIndicator = (
      <span className="ml-2 text-xs text-yellow-400 animate-pulse">Sending...</span>
    );
  } else if (effectiveStatus === "failed") {
    statusIndicator = (
      <span className="ml-2 text-xs text-red-500">Failed to send</span>
    );
  }

  if (isUser) {
    return (
      <div className={`w-full flex justify-end my-6 ${effectiveStatus === "pending" ? "opacity-60" : ""}`}>
        <div className="inline-flex px-3 py-2 rounded-lg bg-cyan-950 backdrop-blur-3xl items-center max-w-[80vw] md:max-w-[60%] overflow-x-auto">
          <div
            ref={contentRef}
            className="break-words overflow-wrap-anywhere leading-relaxed text-white text-right"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          ></div>
          {statusIndicator}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-start my-2">
      <div className="inline-flex flex-col items-start text-left">
        <div
          ref={contentRef}
          className="prose prose-invert max-w-none text-left break-words overflow-wrap-anywhere leading-relaxed text-gray-300 mb-3 flex items-center"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        ></div>
        {statusIndicator}
      </div>
    </div>
  );
};

export default MessageItem;