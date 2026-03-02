import React, { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function TiptapEditor({ value, onChange }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const initialContent = useMemo(() => value ?? "", []);

  const editor = useEditor(
    mounted
      ? {
          extensions: [
            StarterKit,
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
          content: initialContent,
          onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
          },
        }
      : null
  );

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!mounted) return null;

  const btn = "px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50";

  return (
    <div className="border rounded-md bg-white">
      <div className="flex flex-wrap gap-2 border-b p-2">
        <button className={btn} onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
        <button className={btn} onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</button>
        <button className={btn} onClick={() => editor?.chain().focus().toggleUnderline().run()}>Underline</button>
        <button className={btn} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>OL</button>
        <button className={btn} onClick={() => editor?.chain().focus().toggleBulletList().run()}>UL</button>
        <button className={btn} onClick={() => editor?.chain().focus().setTextAlign("left").run()}>Left</button>
        <button className={btn} onClick={() => editor?.chain().focus().setTextAlign("center").run()}>Center</button>
        <button className={btn} onClick={() => editor?.chain().focus().setTextAlign("right").run()}>Right</button>
        <button className={btn} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          Table
        </button>
      </div>
      <EditorContent editor={editor} className="p-3 min-h-[250px]" />
    </div>
  );
}
