"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ className, ...props }) => (
            <h1 className={cn("text-xl font-bold mt-4 mb-2", className)} {...props} />
          ),
          h2: ({ className, ...props }) => (
            <h2 className={cn("text-lg font-bold mt-3 mb-2", className)} {...props} />
          ),
          h3: ({ className, ...props }) => (
            <h3 className={cn("text-base font-bold mt-2 mb-1", className)} {...props} />
          ),
          // Paragraphs
          p: ({ className, ...props }) => (
            <p className={cn("mb-2 last:mb-0 leading-relaxed", className)} {...props} />
          ),
          // Lists
          ul: ({ className, ...props }) => (
            <ul className={cn("list-disc list-inside mb-2 space-y-1 ml-4", className)} {...props} />
          ),
          ol: ({ className, ...props }) => (
            <ol className={cn("list-decimal list-inside mb-2 space-y-1 ml-4", className)} {...props} />
          ),
          li: ({ className, ...props }) => (
            <li className={cn("mb-1", className)} {...props} />
          ),
          // Code blocks - prevent overflow, responsive
          pre: ({ className, children, ...props }) => (
            <pre className={cn("mb-2 mt-2 overflow-x-auto rounded-lg bg-muted/80 p-3 font-mono text-xs max-w-full", className)} {...props}>
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className?.includes("language");
            return isInline ? (
              <code
                className={cn(
                  "relative rounded bg-muted/80 px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold text-foreground break-all",
                  className,
                )}
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={cn("block font-mono text-xs text-foreground whitespace-pre break-all max-w-full overflow-x-auto", className)} {...props}>
                {children}
              </code>
            );
          },
          // Blockquote
          blockquote: ({ className, ...props }) => (
            <blockquote
              className={cn("border-l-4 border-muted-foreground/50 pl-4 italic my-2 text-muted-foreground", className)}
              {...props}
            />
          ),
          // Links - break long URLs to prevent overflow
          a: ({ className, ...props }) => (
            <a className={cn("break-all text-primary underline hover:text-primary/80", className)} {...props} />
          ),
          // Images - prevent overflow, responsive sizing
          img: ({ className, ...props }) => (
            <img className={cn("rounded-lg max-w-full h-auto my-2 w-full object-contain", className)} {...props} />
          ),
          // Tables
          table: ({ className, ...props }) => (
            <div className="overflow-x-auto my-2">
              <table className={cn("min-w-full border-collapse border border-border", className)} {...props} />
            </div>
          ),
          thead: ({ className, ...props }) => (
            <thead className={cn("bg-muted", className)} {...props} />
          ),
          th: ({ className, ...props }) => (
            <th className={cn("border border-border px-3 py-2 text-left font-semibold", className)} {...props} />
          ),
          td: ({ className, ...props }) => (
            <td className={cn("border border-border px-3 py-2", className)} {...props} />
          ),
          // Horizontal rule
          hr: ({ className, ...props }) => (
            <hr className={cn("my-4 border-t border-border", className)} {...props} />
          ),
          // Strong/Bold
          strong: ({ className, ...props }) => (
            <strong className={cn("font-semibold", className)} {...props} />
          ),
          // Emphasis/Italic
          em: ({ className, ...props }) => (
            <em className={cn("italic", className)} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

