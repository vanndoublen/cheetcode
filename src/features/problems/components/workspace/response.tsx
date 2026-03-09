'use client';

import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
  type CodeBlockProps,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from '../code-block';
import type { HTMLAttributes } from 'react';
import { memo } from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import remarkMath from 'remark-math';
import remarkToc from "remark-toc";

import 'katex/dist/katex.min.css'; // <--- THIS IS REQUIRED FOR THE FORMULAS TO LOOK LIKE MATH!

export type AIResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options['children'];
};

const components: Options['components'] = {
  code: ({ node, className, children, ...props }: any) => {
    // 1. Detect if this is a "Code Block" (like the ones in your pre tag)
    // Code blocks usually have a class like "language-javascript"
    const isBlock = className && className.includes('language-');

    if (isBlock) {
      return <code className={className} {...props}>{children}</code>;
    }

    // 2. Everything else (the backticked items) gets the grey background style
    return (
      <code
        className={cn(
          "px-[0.3rem] py-[0.15rem] rounded-md bg-zinc-200 dark:bg-zinc-800 font-mono text-sm font-medium text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  sup: ({ children, ...props }: any) => (
    <sup className="text-[0.6rem] align-super font-medium" {...props}>
      {children}
    </sup>
  ),
  // Hints Accordion
  details: ({ className, ...props }: any) => (
    <details
      className={cn("my-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50", className)}
      {...props}
    />
  ),
  summary: ({ className, ...props }: any) => (
    <summary
      className={cn("font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-none", className)}
      {...props}
    />
  ),

  blockquote: ({ className, ...props }: any) => (
    <blockquote className={cn("my-4 border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 italic text-muted-foreground", className)} {...props} />
  ),

  p: ({ node, children, className, ...props }: any) => {
    // This function looks for the number "10" followed immediately by "9" or "4"
    // and turns it into HTML superscript tags.
    const processText = (text: any): any => {
      if (typeof text !== 'string') return text;
      return text.replace(/10([49])\b/g, (match, p1) => {
        return `10<sup>${p1}</sup>`;
      });
    };

    return (
      <p className={cn('mb-4 leading-relaxed', className)} {...props}>
        {processText(children)}
      </p>
    );
  },
  ol: ({ node, children, className, ...props }) => (
    <ol className={cn('ml-4 list-outside list-decimal', className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ node, children, className, ...props }: any) => {
    const processText = (text: any): any => {
      if (typeof text !== 'string') return text;
      // This regex handles the "109" and "104" replacement
      return text.replace(/10([49])\b/g, (match, p1) => {
        return `10<sup>${p1}</sup>`;
      });
    };

    return (
      <li className={cn('py-1', className)} {...props}>
        {processText(children)}
      </li>
    );
  },
  ul: ({ node, children, className, ...props }) => (
    <ul className={cn('ml-4 list-outside list-disc', className)} {...props}>
      {children}
    </ul>
  ),
  // Inside components in AIResponse.tsx
  strong: ({ className, children, ...props }: any) => {
    const isLabel = typeof children === 'string' && /Input:|Output:|Explanation:/.test(children);
    return (
      <strong
        className={cn(
          "font-semibold text-foreground",
          isLabel && "block mt-3", // Forces the label onto its own line
          className
        )}
        {...props}
      >
        {children}
      </strong>
    );
  },
  a: ({ node, children, className, href, ...props }: any) => {
    // Check if it's an internal hash link (e.g., #approach-1)
    const isHashLink = href?.startsWith('#');

    return (
      <a
        className={cn('font-medium text-primary underline', className)}
        // If it's a hash link, don't open in new tab
        target={isHashLink ? undefined : '_blank'}
        rel={isHashLink ? undefined : 'noreferrer'}
        onClick={(e) => {
          if (isHashLink) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }}
        href={href}
        {...props}
      >
        {children}
      </a>
    );
  },

  table: ({ className, ...props }: any) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn("w-full border-collapse border border-zinc-200 dark:border-zinc-800", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: any) => (
    <th className={cn("border border-zinc-200 dark:border-zinc-800 px-4 py-2 font-bold bg-zinc-100 dark:bg-zinc-900", className)} {...props} />
  ),
  td: ({ className, ...props }: any) => (
    <td className={cn("border border-zinc-200 dark:border-zinc-800 px-4 py-2", className)} {...props} />
  ),

  h1: ({ node, children, className, ...props }) => (
    <h1
      className={cn('mt-6 mb-2 font-semibold text-xl', className)}
      {...props}
    >
      {children}
    </h1>
  ),
  // 3. IMPROVED HEADINGS
  h2: ({ node, children, className, ...props }: any) => (
    <h2 className={cn('mt-8 mb-4 font-bold text-lg pb-2', className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ node, children, className, ...props }: any) => (
    <h3 className={cn('mt-6 mb-3 font-semibold text-lg text-primary', className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ node, children, className, ...props }) => (
    <h4 className={cn('mt-6 mb-2 font-semibold text-md', className)} {...props}>
      {children}
    </h4>
  ),
  h5: ({ node, children, className, ...props }) => (
    <h5
      className={cn('mt-6 mb-2 font-semibold text-base', className)}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ node, children, className, ...props }) => (
    <h6 className={cn('mt-6 mb-2 font-semibold text-sm', className)} {...props}>
      {children}
    </h6>
  ),
  pre: ({ node, className, children }) => {
    let language = 'text';

    // Try to detect language from <code> className
    const codeNode = node?.children?.[0];
    if (codeNode?.type === 'element' && codeNode.tagName === 'code') {
      const classNames = codeNode.properties?.className;
      if (Array.isArray(classNames)) {
        const langClass = classNames.find(
          (cls) => typeof cls === 'string' && cls.startsWith('language-')
        );
        if (langClass) {
          language = langClass.toString().replace('language-', '');
        }
      }
    }

    // Check if children is actually a <code> element
    const childrenIsCode =
      typeof children === 'object' &&
      children !== null &&
      'type' in children &&
      children.type === 'code';

    // If it's not a <code> element yet (streaming incomplete), render plain <pre>
    if (!childrenIsCode) {
      return <pre className={className}>{children}</pre>;
    }

    // Safely extract code string (fallback to empty string)
    const codeString =
      (children as any)?.props?.children?.toString?.() ?? '';

    // If code is still empty (streaming), render plain <pre>
    if (!codeString.trim()) {
      return <pre className={className}>{children}</pre>;
    }

    // Prepare data for CodeBlock
    const data: CodeBlockProps['data'] = [
      {
        language,
        filename: `code.${language}`,
        code: codeString,
      },
    ];

    return (
      <CodeBlock
        className={cn('my-4 h-auto', className)}
        data={data}
        defaultValue={data[0].language}
      >
        <CodeBlockHeader>
          <CodeBlockFiles>
            {(item) => (
              <CodeBlockFilename key={item.language} value={item.language}>
                {item.filename}
              </CodeBlockFilename>
            )}
          </CodeBlockFiles>
          <CodeBlockCopyButton
            className="border-none"
            onCopy={() => console.log('Copied code to clipboard')}
            onError={() => console.error('Failed to copy code to clipboard')}
          />
        </CodeBlockHeader>
        <CodeBlockBody>
          {(item) => (
            <CodeBlockItem key={item.language} value={item.language}>
              <CodeBlockContent
                language={item.language as BundledLanguage}
                themes={{
                  light: 'slack-ochin',
                  dark: 'gruvbox-dark-medium',
                }}
              >
                {item.code}
              </CodeBlockContent>
            </CodeBlockItem>
          )}
        </CodeBlockBody>
      </CodeBlock>
    );
  }
};

export const AIResponse = memo(
  ({ className, options, children, ...props }: AIResponseProps) => {
    return (
      <div
        className={cn(
          'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
          className
        )}
        {...props}
      >
        <ReactMarkdown
          components={components}
          remarkPlugins={[remarkGfm, remarkMath, remarkToc]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeKatex, {
              // This is the magic: it tells Katex to ignore errors 
              // and process the math nodes generated by remark-math
              throwOnError: false,
              strict: false
            }],
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap' }]
          ]}
          {...options}
        >
          {children}
        </ReactMarkdown>
      </div>
    )
  },
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children
);
