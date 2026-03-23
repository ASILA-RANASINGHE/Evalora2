// Server-component-safe HTML renderer for rich text content

const STYLES = `
  .tiptap-render h1 { font-size: 2em; font-weight: 700; margin: 0.5em 0; line-height: 1.2; }
  .tiptap-render h2 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; line-height: 1.3; }
  .tiptap-render h3 { font-size: 1.2em; font-weight: 600; margin: 0.5em 0; line-height: 1.4; }
  .tiptap-render p { margin: 0.4em 0; line-height: 1.7; }
  .tiptap-render ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
  .tiptap-render ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
  .tiptap-render li { margin: 0.25em 0; }
  .tiptap-render blockquote { border-left: 4px solid #4D2FB2; padding-left: 1em; margin: 0.75em 0; color: #555; font-style: italic; }
  .tiptap-render hr { border: none; border-top: 2px solid #e5e7eb; margin: 1em 0; }
  .tiptap-render a { color: #4D2FB2; text-decoration: underline; }
  .tiptap-render img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 0.5em 0; }
  .tiptap-render code { background: #f3f4f6; padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.9em; }
  .tiptap-render pre { background: #1e1e2e; color: #cdd6f4; padding: 1em; border-radius: 0.5rem; overflow-x: auto; margin: 0.75em 0; }
  .tiptap-render pre code { background: none; padding: 0; color: inherit; font-size: 0.9em; }
`;

export function RichTextContent({ html, className = "" }: { html: string; className?: string }) {
  const isHtml = html.trim().startsWith("<");
  if (!isHtml) {
    return (
      <article className={`whitespace-pre-wrap leading-relaxed ${className}`}>
        {html}
      </article>
    );
  }
  return (
    <>
      <style>{STYLES}</style>
      <article
        className={`tiptap-render leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
