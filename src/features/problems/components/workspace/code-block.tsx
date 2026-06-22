'use client';
import { useState, useEffect } from 'react';
import { createHighlighter, BundledLanguage } from 'shiki';
import { useTheme } from 'next-themes';

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['monokai', 'min-light'],
      langs: [
        'cpp', 'java', 'python', 'javascript', 'typescript',
        'go', 'rust', 'c', 'csharp', 'sql',
        'tsx', 'jsx', 'bash', 'json',
      ],
    });
  }
  return highlighterPromise;
}

function cssVarToHex(name: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  if (!value) return 'transparent';

  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return 'transparent';

  ctx.fillStyle = value;
  return ctx.fillStyle;
}

interface CodeBlockProps {
  code: string;
  lang?: BundledLanguage;
}

export default function CodeBlock({ code, lang = 'typescript' }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [html, setHtml] = useState('');
  const [bg, setBg] = useState('transparent');
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  const shikiTheme = resolvedTheme === 'dark' ? 'monokai' : 'min-light';

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    getHighlighter().then(async (highlighter) => {
      if (cancelled) return;

      const loaded = highlighter.getLoadedLanguages();
      if (!loaded.includes(lang)) {
        await highlighter.loadLanguage(lang);
      }

      if (cancelled) return;

      const result = highlighter.codeToHtml(code, { lang, theme: shikiTheme });
      // strip shiki's <pre> background so ours shows through
      const stripped = result.replace(/background-color:[^;"]*;?/g, '');

      setHtml(stripped);
      setBg(cssVarToHex('--background'));
    });

    return () => { cancelled = true; };
  }, [code, lang, shikiTheme, mounted]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!mounted || !html) {
    return <pre className="animate-pulse rounded-lg bg-muted h-24" />;
  }

  return (
    <div
      className="relative group rounded-lg overflow-hidden"
      style={{ background: bg }}
    >
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded bg-zinc-700 text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <div
        className="text-sm [&_pre]:!bg-transparent [&_pre]:whitespace-pre-wrap [&_pre]:break-all [&_pre]:p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}