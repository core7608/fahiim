import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text', className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("group relative my-4 rounded-2xl overflow-hidden border border-slate-200 shadow-sm", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{language}</span>
        <button 
          onClick={handleCopy}
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          title="نسخ الكود"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="text-sm font-mono">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#1e1e1e',
            fontSize: '13px',
            lineHeight: '1.5',
          }}
          codeTagProps={{
            style: { fontFamily: 'inherit' }
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
