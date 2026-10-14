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

/** HOW_TO_PLAY.md の <example-button></example-button> の場所に出すボタン */
function exampleButton(onShowExample?: () => void) {
  return () =>
    onShowExample ? (
      <div className="not-prose my-4 flex justify-center">
        <button
          type="button"
          onClick={onShowExample}
          className="w-full md:w-auto bg-white text-theme-blue px-6 md:px-12 py-3 rounded-[1.25rem] font-black text-base md:text-lg border-2 border-theme-blue/40 shadow-[0_0.3125rem_0_rgba(77,150,255,0.2)] hover:scale-105 active:translate-y-1 active:shadow-none transition-all"
        >
          ▶ ゲームのやりかたの例を見る
        </button>
      </div>
    ) : null;
}

export function HowToPlayBody({ onShowExample }: { onShowExample?: () => void }) {
  const allComponents = { ...components, 'example-button': exampleButton(onShowExample) } as Components;
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeRaw]} components={allComponents}>
        {stripLeadingComment(howToPlayMd)}
      </ReactMarkdown>
    </div>
  );
}
