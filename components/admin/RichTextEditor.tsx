"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`px-2 py-1 rounded text-[12px] font-medium transition-colors ${
        active
          ? "bg-slate-800 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-slate-200 mx-1 self-center" />;
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class:
          "rich-editor focus:outline-none min-h-[120px] px-3 py-2.5 text-[13px] text-slate-700 leading-relaxed",
      },
    },
  });

  // Sync when switching between products
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML() === "<p></p>" ? "" : editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  if (!editor) return null;

  const e = editor;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-slate-300 focus-within:border-slate-400 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50 flex-wrap">
        <Btn onClick={() => e.chain().focus().toggleBold().run()} active={e.isActive("bold")} title="Bold">
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => e.chain().focus().toggleItalic().run()} active={e.isActive("italic")} title="Italic">
          <em>I</em>
        </Btn>
        <Btn onClick={() => e.chain().focus().toggleUnderline().run()} active={e.isActive("underline")} title="Underline">
          <span className="underline">U</span>
        </Btn>
        <Btn onClick={() => e.chain().focus().toggleStrike().run()} active={e.isActive("strike")} title="Strikethrough">
          <s>S</s>
        </Btn>

        <Divider />

        <Btn onClick={() => e.chain().focus().toggleBulletList().run()} active={e.isActive("bulletList")} title="Bullet List">
          • List
        </Btn>
        <Btn onClick={() => e.chain().focus().toggleOrderedList().run()} active={e.isActive("orderedList")} title="Numbered List">
          1. List
        </Btn>

        <Divider />

        <Btn onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()} active={e.isActive("heading", { level: 2 })} title="Heading">
          H2
        </Btn>
        <Btn onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()} active={e.isActive("heading", { level: 3 })} title="Subheading">
          H3
        </Btn>

        <Divider />

        <Btn onClick={() => e.chain().focus().undo().run()} title="Undo">
          ↩
        </Btn>
        <Btn onClick={() => e.chain().focus().redo().run()} title="Redo">
          ↪
        </Btn>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
