'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import Image from 'next/image';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm, // GitHub Flavored Markdown (tables, task lists, strikethrough)
          remarkMath, // Math expressions support
        ]}
        rehypePlugins={[
          rehypeRaw, // Allow HTML in markdown
          rehypeHighlight, // Syntax highlighting for code blocks
          rehypeSlug, // Add IDs to headings
          [rehypeAutolinkHeadings, { behavior: 'wrap' }], // Make headings linkable
        ]}
        components={{
          // Custom image component with Next.js optimization
          img: ({ node, src, alt, ...props }) => {
            if (!src) return null;
            
            // Handle external vs internal images
            // @ts-ignore
            const isExternal = src.startsWith('http://') || src.startsWith('https://');
            
            return (
              <span className="block my-6 overflow-hidden rounded-lg border border-border">
               
                <Image
                // @ts-ignore
                  src={src}
                  alt={alt || 'Image'}
                  // @ts-ignore
                  width={800}
                  // @ts-ignore
                  height={450}
                  className="w-full h-auto"
                  unoptimized={isExternal} // Don't optimize external images
                  {...props}
                />
                {alt && (
                  <span className="block text-center text-sm text-muted-foreground mt-2 px-4 pb-2">
                    {alt}
                  </span>
                )}
              </span>
            );
          },

          // Enhanced code blocks with copy button
          // @ts-ignore
          code: ({ node, inline , className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            if (!inline && language) {
              return (
                <CodeBlock language={language} {...props}>
                  {String(children).replace(/\n$/, '')}
                </CodeBlock>
              );
            }

            return (
              <code
                className={`${className} px-1.5 py-0.5 rounded bg-muted text-sm font-mono border border-border`}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Custom heading styles
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4 pb-2 border-b border-border" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-semibold mt-5 mb-2" {...props} />
          ),

          // Custom link styles
          a: ({ node, href, children, ...props }) => (
            <a
              href={href}
              className="text-primary hover:underline font-medium"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          ),

          // Custom blockquote styles
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground bg-muted/30 py-2 rounded-r"
              {...props}
            />
          ),

          // Custom table styles
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border border-border rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left font-semibold border-b border-border" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 border-b border-border" {...props} />
          ),

          // Custom list styles
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-4 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
          ),
          li: ({ node, children, ...props }) => (
            <li className="ml-4" {...props}>
              <span className="ml-2">{children}</span>
            </li>
          ),

          // Task list support
          input: ({ node, ...props }) => (
            <input
              type="checkbox"
              className="mr-2 rounded border-border"
              disabled
              {...props}
            />
          ),

          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-border" {...props} />
          ),

          // Paragraph spacing
          p: ({ node, ...props }) => (
            <p className="my-4 leading-7" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Separate CodeBlock component with copy functionality
const CodeBlock: React.FC<{
  language: string;
  children: string;
}> = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border border-b-0 border-border">
        <span className="text-xs font-mono text-muted-foreground uppercase">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded bg-background hover:bg-accent transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="!mt-0 !rounded-t-none overflow-x-auto border border-border">
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  );
};

export default MarkdownRenderer;
