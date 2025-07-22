import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type { Message } from '../types';

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
        <div className="inline-flex px-4 py-3 rounded-2xl bg-[#697565] shadow-[0_0_20px_rgba(105,117,101,0.15)] backdrop-blur-3xl items-center max-w-[80vw] md:max-w-[60%] overflow-x-auto border border-[#8B9A83]/30">
          <div
            className="break-words overflow-wrap-anywhere leading-relaxed text-[#ECDFCC] text-right markdown-body drop-shadow-[0_0_2px_rgba(236,223,204,0.2)]"
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
          className="prose prose-invert max-w-none text-left break-words overflow-wrap-anywhere leading-relaxed text-[#ECDFCC] mb-3 markdown-body drop-shadow-[0_0_2px_rgba(236,223,204,0.2)]"
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