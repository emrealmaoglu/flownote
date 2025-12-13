import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CodeBlock } from '../../types';

interface CodeBlockRendererProps {
    block: CodeBlock;
}

/**
 * CodeBlockRenderer - Syntax Highlighting
 * Sprint 1 - prism-react-renderer entegrasyonu
 * 10 dil desteği: js, ts, python, sql, bash, json, html, css, markdown, plaintext
 */
export function CodeBlockRenderer({ block }: CodeBlockRendererProps) {
    const { code, language, filename } = block.data;
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Map our language types to Prism language names
    const prismLanguage = language === 'plaintext' ? 'text' : language;

    return (
        <div className="rounded-lg overflow-hidden border border-dark-700 bg-dark-900 my-2">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary-400 uppercase tracking-wide">
                        {language}
                    </span>
                    {filename && (
                        <span className="text-xs text-dark-500 font-mono">{filename}</span>
                    )}
                </div>
                <button
                    onClick={handleCopy}
                    className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded text-xs',
                        'transition-colors duration-200',
                        copied
                            ? 'text-green-400 bg-green-400/10'
                            : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700'
                    )}
                    title={copied ? 'Copied!' : 'Copy code'}
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Content */}
            <Highlight theme={themes.vsDark} code={code.trim()} language={prismLanguage}>
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                        className={cn(className, 'p-4 overflow-x-auto text-sm leading-relaxed')}
                        style={{ ...style, margin: 0, background: 'transparent' }}
                    >
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })} className="table-row">
                                <span className="table-cell pr-4 text-dark-600 select-none text-right w-8 text-xs">
                                    {i + 1}
                                </span>
                                <span className="table-cell">
                                    {line.map((token, key) => (
                                        <span key={key} {...getTokenProps({ token })} />
                                    ))}
                                </span>
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    );
}

export default CodeBlockRenderer;
