import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import type { Message } from '../types';

const MarkdownComponents = {
  pre: (props: any) => (
    <div className="w-full max-w-full min-w-0 my-3" >
      <pre className="w-full max-w-full min-w-0 font-mono text-sm bg-[#232336] text-[#e0e0e0] rounded-xl break-words break-all whitespace-pre-wrap overflow-wrap-anywhere" {...props} />
    </div>
  ),
  code: (props: any) => (
    <code className="inline font-mono text-[#e0e0e0] bg-[#232336] rounded text-sm align-middle break-words break-all whitespace-pre-wrap overflow-wrap-anywhere" {...props} />
  ),
  table: (props: any) => (
    <div className="w-full overflow-x-auto my-3">
      <table className="w-full table-auto border border-[#3C3D37] bg-[#18181b] text-left text-sm break-words break-all whitespace-pre-wrap overflow-wrap-anywhere">
        {props.children}
      </table>
    </div>
  ),
  th: (props: any) => (
    <th className="border border-[#3C3D37] bg-[#232336] text-[#e0e0e0] px-2 py-1 font-semibold break-words break-all whitespace-pre-wrap overflow-wrap-anywhere" {...props} />
  ),
  td: (props: any) => (
    <td className="border border-[#3C3D37] bg-[#18181b] text-[#e0e0e0] px-2 py-1 break-words break-all whitespace-pre-wrap overflow-wrap-anywhere" {...props} />
  ),
  tr: (props: any) => (
    <tr className="even:bg-[#232336]" {...props} />
  ),
};

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
            className="markdown-body text-[#ECDFCC] text-right drop-shadow-[0_0_2px_rgba(236,223,204,0.2)] break-words max-w-full overflow-x-auto w-full"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            <ReactMarkdown
              children={markdownContent}
              rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
              skipHtml={false}
              components={MarkdownComponents}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full flex justify-start my-2 overflow-x-auto">
      <div className="inline-flex flex-col items-start text-left w-full max-w-full overflow-x-auto">
        <div
          className="markdown-body prose prose-invert text-left break-words break-all max-w-full overflow-x-auto w-full mb-3 drop-shadow-[0_0_2px_rgba(236,223,204,0.2)] overflow-wrap-anywhere"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          <ReactMarkdown
            children={markdownContent}
            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
            skipHtml={false}
            components={MarkdownComponents}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageItem;