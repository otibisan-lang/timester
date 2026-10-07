/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import howToPlayMd from '../HOW_TO_PLAY.md?raw';

function stripLeadingComment(src: string) {
  return src.replace(/^\s*<!--[\s\S]*?-->\s*/m, '').trimStart();
}

const components: Components = {
  h2: ({ children }) => (
    <h2 className="text-3xl font-black text-gray-900 mb-6 font-display border-b-4 border-theme-yellow pb-2 inline-block">
      {children}
    </h2>
  ),
  blockquote: ({ children }) => (
    <div className="mb-4 rounded-xl border-2 border-theme-blue/30 bg-[#F0F7FF] px-4 py-3 text-sm leading-relaxed text-gray-700 [&_p]:m-0">
      {children}
    </div>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-bold text-theme-blue underline decoration-theme-blue underline-offset-2 hover:text-theme-coral hover:decoration-theme-coral"
    >
      {children}
    </a>
  ),
};

export function HowToPlayBody() {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeRaw]} components={components}>
        {stripLeadingComment(howToPlayMd)}
      </ReactMarkdown>
    </div>
  );
}
