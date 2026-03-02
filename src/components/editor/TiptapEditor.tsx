import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function TiptapEditor({ value, onChange }: Props) {
  // ✅ Prevent execution during prerender
  if (typeof window === "undefined") return null;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] }, // enable all heading levels
      }),
      Underline,
      Link,
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,

    // ✅ Key fix for "can't select pasted text":
    // Put selectable/caret styles directly on ProseMirror node
    editorProps: {
      attributes: {
        class:
          // layout
          "min-h-[250px] p-3 " +
          // selection + caret
          "select-text cursor-text " +
          // focus/appearance
          "focus:outline-none " +
          // content styling (optional but nice)
          "prose max-w-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const btn =
    "px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50";
  const btnActive =
    "px-2 py-1 text-xs border rounded bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";

  const isHeading = (level: number) => editor.isActive("heading", { level });

  return (
    <div className="border rounded-md bg-white">
      <div className="flex flex-wrap gap-2 border-b p-2">
        {/* Headings */}
        <button
          type="button"
          className={isHeading(1) ? btnActive : btn}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </button>
        <button
          type="button"
          className={isHeading(2) ? btnActive : btn}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={isHeading(3) ? btnActive : btn}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>

        {/* Formatting */}
        <button
          type="button"
          className={editor.isActive("bold") ? btnActive : btn}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={editor.isActive("italic") ? btnActive : btn}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className={editor.isActive("underline") ? btnActive : btn}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </button>

        {/* Lists */}
        <button
          type="button"
          className={editor.isActive("orderedList") ? btnActive : btn}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          OL
        </button>
        <button
          type="button"
          className={editor.isActive("bulletList") ? btnActive : btn}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          UL
        </button>

        {/* Align */}
        <button type="button" className={btn} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          Left
        </button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          Center
        </button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          Right
        </button>

        {/* Table */}
        <button
          type="button"
          className={btn}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          Table
        </button>
      </div>

      {/* Important: EditorContent doesn't need padding now because ProseMirror has it via editorProps */}
      <EditorContent editor={editor} />
    </div>
  );
}
