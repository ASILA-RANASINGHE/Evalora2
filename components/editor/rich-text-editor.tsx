"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useRef, useCallback } from "react";
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link2, ImagePlus, Minus, Quote, Undo2, Redo2, Highlighter,
  Type, Loader2, X, RemoveFormatting,
} from "lucide-react";

// ── Image compression ──────────────────────────────────────────────────────
async function compressImage(file: File, maxWidth = 1200, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas error")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

// ── Toolbar button ─────────────────────────────────────────────────────────
function ToolBtn({
  onClick, active = false, disabled = false, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-[#4D2FB2] text-white"
          : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground"
      } disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 self-center" />;
}

// ── Toolbar ────────────────────────────────────────────────────────────────
function Toolbar({ editor, compressing, onImagePick }: {
  editor: Editor;
  compressing: boolean;
  onImagePick: () => void;
}) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL:", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-gray-50 dark:bg-gray-900 rounded-t-lg sticky top-0 z-10">
      {/* History */}
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <Undo2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <Redo2 className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Text type */}
      <select
        onMouseDown={(e) => e.preventDefault()}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().setHeading({ level: parseInt(v) as 1|2|3 }).run();
          e.target.blur();
        }}
        value={
          editor.isActive("heading", { level: 1 }) ? "1" :
          editor.isActive("heading", { level: 2 }) ? "2" :
          editor.isActive("heading", { level: 3 }) ? "3" : "p"
        }
        className="h-7 text-xs px-1.5 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        title="Text style"
      >
        <option value="p">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <Divider />

      {/* Inline formatting */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
        <Bold className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
        <Italic className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
        <UnderlineIcon className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Headings shortcuts */}
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
        <Heading1 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
        <Heading2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
        <Heading3 className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Lists */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
        <List className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
        <ListOrdered className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Alignment */}
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
        <AlignLeft className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
        <AlignCenter className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
        <AlignRight className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
        <AlignJustify className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Blockquote + HR */}
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
        <Quote className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
        <Minus className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Link */}
      <ToolBtn onClick={setLink} active={editor.isActive("link")} title="Insert / edit link">
        <Link2 className="h-4 w-4" />
      </ToolBtn>
      {editor.isActive("link") && (
        <ToolBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">
          <X className="h-3.5 w-3.5" />
        </ToolBtn>
      )}

      {/* Image */}
      <ToolBtn onClick={onImagePick} title="Insert image" disabled={compressing}>
        {compressing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
      </ToolBtn>

      <Divider />

      {/* Color */}
      <span className="relative inline-flex items-center" title="Text color">
        <label className="p-1.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-0.5" title="Text color">
          <Type className="h-4 w-4 text-muted-foreground" />
          <input
            type="color"
            defaultValue="#1c1a32"
            className="sr-only"
            onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
          />
        </label>
      </span>

      {/* Highlight */}
      <span className="relative inline-flex items-center" title="Highlight color">
        <label className="p-1.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-0.5" title="Highlight">
          <Highlighter className="h-4 w-4 text-muted-foreground" />
          <input
            type="color"
            defaultValue="#fef08a"
            className="sr-only"
            onInput={(e) => editor.chain().focus().toggleHighlight({ color: (e.target as HTMLInputElement).value }).run()}
          />
        </label>
      </span>

      <Divider />

      {/* Clear formatting */}
      <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
        <RemoveFormatting className="h-4 w-4" />
      </ToolBtn>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  error?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing here...",
  minHeight = 400,
  error = false,
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const compressingRef = useRef(false);
  const compressingState = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TiptapImage.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none",
        style: `min-height: ${minHeight}px; padding: 1rem;`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. reset after submit)
  useEffect(() => {
    if (!editor) return;
    if (value === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  const handleImageFile = useCallback(async (file: File) => {
    if (!editor || compressingRef.current) return;
    compressingRef.current = true;
    compressingState.current = true;
    // Force re-render via a small state trick — we use a ref for perf but re-render toolbar
    editor.setEditable(false);
    try {
      const data = await compressImage(file);
      editor.chain().focus().setImage({ src: data }).run();
    } catch {
      alert("Failed to process image. Please try a different file.");
    } finally {
      compressingRef.current = false;
      compressingState.current = false;
      editor.setEditable(true);
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={`border rounded-lg overflow-hidden ${error ? "border-red-500" : "border-input"}`}>
      <Toolbar
        editor={editor}
        compressing={compressingRef.current}
        onImagePick={() => imageInputRef.current?.click()}
      />
      <div className="bg-background">
        <EditorContent editor={editor} />
      </div>
      {/* Hidden image input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file);
          e.target.value = "";
        }}
      />
      {/* Editor styles */}
      <style>{`
        .tiptap-editor h1 { font-size: 2em; font-weight: 700; margin: 0.5em 0; line-height: 1.2; }
        .tiptap-editor h2 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; line-height: 1.3; }
        .tiptap-editor h3 { font-size: 1.2em; font-weight: 600; margin: 0.5em 0; line-height: 1.4; }
        .tiptap-editor p { margin: 0.4em 0; line-height: 1.7; }
        .tiptap-editor ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap-editor ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap-editor li { margin: 0.25em 0; }
        .tiptap-editor blockquote { border-left: 4px solid #4D2FB2; padding-left: 1em; margin: 0.75em 0; color: #555; font-style: italic; }
        .tiptap-editor hr { border: none; border-top: 2px solid #e5e7eb; margin: 1em 0; }
        .tiptap-editor a { color: #4D2FB2; text-decoration: underline; }
        .tiptap-editor img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 0.5em 0; cursor: pointer; }
        .tiptap-editor img.ProseMirror-selectednode { outline: 3px solid #4D2FB2; border-radius: 0.5rem; }
        .tiptap-editor code { background: #f3f4f6; padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.9em; }
        .tiptap-editor pre { background: #1e1e2e; color: #cdd6f4; padding: 1em; border-radius: 0.5rem; overflow-x: auto; margin: 0.75em 0; }
        .tiptap-editor pre code { background: none; padding: 0; color: inherit; font-size: 0.9em; }
        .tiptap-editor .ProseMirror-focused { outline: none; }
        .tiptap-editor p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #9ca3af; pointer-events: none; height: 0; }
      `}</style>
    </div>
  );
}

