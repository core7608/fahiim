import React, { useState } from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { motion } from 'framer-motion';
import { Play, Code, Maximize2, Minimize2, Copy, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

import * as LucideIcons from 'lucide-react';

interface JsxViewerProps {
  code: string;
  className?: string;
}

const scope = { 
  ...LucideIcons, 
  motion, 
  cn, 
  useState, 
  React 
};

export const JsxViewer: React.FC<JsxViewerProps> = ({ code, className }) => {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "glass-card overflow-hidden transition-all duration-500",
      isExpanded ? "fixed inset-4 z-[100] m-0" : "w-full",
      className
    )}>
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/50">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('preview')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              view === 'preview' ? "bg-white text-glass-blue shadow-sm" : "text-slate-400"
            )}
          >
            <Play className="w-3 h-3" />
            <span>عرض</span>
          </button>
          <button 
            onClick={() => setView('code')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              view === 'code' ? "bg-white text-glass-blue shadow-sm" : "text-slate-400"
            )}
          >
            <Code className="w-3 h-3" />
            <span>الكود</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
            title="نسخ الكود"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className={cn(
        "relative bg-slate-50",
        isExpanded ? "h-[calc(100%-64px)]" : "h-[400px]"
      )}>
        <LiveProvider code={code} scope={scope} noInline={false}>
          {view === 'preview' ? (
            <div className="h-full overflow-auto p-6">
              <LivePreview />
            </div>
          ) : (
            <div className="h-full overflow-auto font-mono text-sm">
              <LiveEditor className="min-h-full" />
            </div>
          )}
          <LiveError className="absolute bottom-0 left-0 right-0 p-4 bg-rose-500 text-white text-xs" />
        </LiveProvider>
      </div>
    </div>
  );
};
