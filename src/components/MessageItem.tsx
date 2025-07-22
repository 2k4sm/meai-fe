import { useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from 'dompurify';
import type { Message } from '../types';
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

interface MessageItemProps {
  message: Message;
  status?: string;
}

const MessageItem = ({ message, status }: MessageItemProps) => {
  const isUser = message.type === 'Human';
  const effectiveStatus = status || message.status;

  // Defensive fallback for malformed markdown
  let markdownContent = message.content || "";
  if (typeof markdownContent !== "string") {
    markdownContent = String(markdownContent);
  }

  if (isUser) {
    return (
      <div className={`w-full flex justify-end my-6 ${effectiveStatus === "pending" ? "opacity-60" : ""}`}>
        <div className="inline-flex px-3 py-2 rounded-lg bg-cyan-950 backdrop-blur-3xl items-center max-w-[80vw] md:max-w-[60%] overflow-x-auto">
          <div
            className="break-words overflow-wrap-anywhere leading-relaxed text-white text-right markdown-body"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            <ReactMarkdown
              children={markdownContent}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              skipHtml={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-start my-2">
      <div className="inline-flex flex-col items-start text-left">
        <div
          className="prose prose-invert max-w-none text-left break-words overflow-wrap-anywhere leading-relaxed text-gray-300 mb-3 markdown-body"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          <ReactMarkdown
            children={markdownContent}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            skipHtml={false}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageItem;