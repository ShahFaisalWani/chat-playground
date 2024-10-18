import React, { FC, memo, useState, useEffect } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { IoCopy } from 'react-icons/io5';
import { FaCheck } from "react-icons/fa6";
import clsx from "clsx";

interface MarkdownRendererProps {
  content: string;
  onCopy?: (text: string) => void;
  setContainsCodeBlock?: (hasCode: boolean) => void;
}

const customStyle = {
  ...dracula,
  'pre[class*="language-"]': {
    ...dracula['pre[class*="language-"]'],
    background: 'var(--color-gray-20)',
    borderRadius: '0 0 0.5rem 0.5rem',
    padding: '1em',
    position: 'relative',
  },
};

const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (props.setContainsCodeBlock) props.setContainsCodeBlock(true);
  }, [props]);


  if (typeof children !== 'string' && !Array.isArray(children)) {
    return null;
  }

  if (!children || children.length === 0 || children[0] === undefined) {
    return null;
  }

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'code';

  const handleCopy = () => {
    const textToCopy = String(children).replace(/\n$/, '');
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopied(true);
          props.onCopy?.(textToCopy);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(err => {
          console.log('Failed to copy text to clipboard:', err);
          alert('Failed to copy. Please try again.');
        });
    } else {
      alert('Clipboard API not supported on your device.');
    }
  };

  return (
    <div className={clsx('md:mb-3 relative', !inline && match ? 'w-full' : 'w-fit inline-block text-primary-10')}>
      {!inline && match ? (
        <>
          <div className="w-full -mb-1 flex justify-between items-center h-8 bg-gray-20 rounded-t-[0.5rem] px-2">
            <span className="text-xs text-text-gray">
              {language}
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-text"
            >
              {copied ? <span className="flex items-center gap-1 text-xs"><FaCheck /> Copied </span> : <IoCopy size="1rem" />}
            </button>
          </div>
          <SyntaxHighlighter
            style={customStyle}
            language={match[1]}
            PreTag="div"
            wrapLines={true}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </>
      ) : (
        <code className={clsx(className, 'w-fit inline-block')} {...props}>
          {children}
        </code>
      )}
    </div>
  );
};

const components = (onCopy?: (text: string) => void, setContainsCodeBlock?: (hasCode: boolean) => void) => ({
  code: (props: any) => <CodeBlock {...props} onCopy={onCopy} setContainsCodeBlock={setContainsCodeBlock} />,
});

const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children && prevProps.className === nextProps.className
);

export const MarkdownRenderer: FC<MarkdownRendererProps> = ({ content, onCopy, setContainsCodeBlock }) => {
  return (
    <div className="text-xxs md:text-xs">
      <MemoizedReactMarkdown
        components={components(onCopy, setContainsCodeBlock)}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </MemoizedReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
