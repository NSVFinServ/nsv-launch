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
  // IMPORTANT: avoids SSR/prerender crashes by only mounting editor on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const initialContent = useMemo(() => value ?? "", []); // keep initial stable

  const editor = useEditor(
    mounted
      ? {
          extensions: [
            StarterKit.configure({
              // keep behavior similar to Quill
              heading: { levels: [1, 2, 3, 4, 5, 6] },
            }),
            Underline,
            Link.configure({
              openOnClick: true,
              autolink: true,
              linkOnPaste: true,
              HTMLAttributes: {
                rel: "noopener noreferrer nofollow",
                target: "_blank",
              },
            }),
            Image.configure({
              inline: false,
              allowBase64: true,
            }),
            TextAlign.configure({
              types: ["heading", "paragraph"],
            }),
            Table.configure({
              resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
          ],
          content: initialContent,
          onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
          },
          editorProps: {
            attributes: {
              class:
                "min-h-[220px] w-full rounded-md border border-gray-200 bg-white p-3 outline-none",
            },
            // simple paste cleanup (keeps structure, removes heavy styling)
            transformPastedHTML(html) {
              // strip <style> tags & inline style attributes
              const noStyleTags = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
              const noInlineStyles = noStyleTags.replace(/\sstyle="[^"]*"/gi, "");
              return noInlineStyles;
            },
          },
        }
      : null
  );

  // Keep editor in sync when you open Edit Blog and set newBlog.content
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value ?? "";
    if (current !== next) {
      // do not create extra history events
      editor.commands.setContent(next, false);
    }
  }, [value, editor]);

  if (!mounted) {
    return (
      <div className="min-h-[220px] w-full rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-500">
        Loading editor…
      </div>
    );
  }

  const btn =
    "px-2 py-1 rounded border text-xs bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      {/* Toolbar (kept close to your Quill features) */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 p-2">
        {/* headings */}
        <select
          className="px-2 py-1 rounded border text-xs bg-white"
          value={
            editor?.isActive("heading", { level: 1 })
              ? "h1"
              : editor?.isActive("heading", { level: 2 })
              ? "h2"
              : editor?.isActive("heading", { level: 3 })
              ? "h3"
              : editor?.isActive("heading", { level: 4 })
              ? "h4"
              : editor?.isActive("heading", { level: 5 })
              ? "h5"
              : editor?.isActive("heading", { level: 6 })
              ? "h6"
              : "p"
          }
          onChange={(e) => {
            const v = e.target.value;
            if (!editor) return;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(v.replace("h", "")) as any }).run();
          }}
          disabled={!editor}
        >
          <option value="p">Paragraph</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
          <option value="h5">H5</option>
          <option value="h6">H6</option>
        </select>

        {/* marks */}
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          Underline
        </button>
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          Strike
        </button>

        {/* lists */}
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          Ordered
        </button>
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          Bullet
        </button>

        {/* align */}
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
          Left
        </button>
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
          Center
        </button>
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().setTextAlign("right").run()}>
          Right
        </button>

        {/* link */}
        <button
          className={btn}
          disabled={!editor}
          onClick={() => {
            if (!editor) return;
            const prev = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Enter URL", prev || "https://");
            if (url === null) return;
            if (!url.trim()) {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
          }}
        >
          Link
        </button>

        {/* image */}
        <button
          className={btn}
          disabled={!editor}
          onClick={() => {
            if (!editor) return;
            const url = window.prompt("Enter Image URL");
            if (!url) return;
            editor.chain().focus().setImage({ src: url.trim() }).run();
          }}
        >
          Image
        </button>

        {/* table */}
        <button
          className={btn}
          disabled={!editor}
          onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          Table
        </button>
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().addRowAfter().run()}>
          Row +
        </button>
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().addColumnAfter().run()}>
          Col +
        </button>
        <button className={btn} disabled={!editor} onClick={() => editor?.chain().focus().deleteTable().run()}>
          Delete Table
        </button>

        {/* clean */}
        <button
          className={btn}
          disabled={!editor}
          onClick={() => {
            if (!editor) return;
            editor.chain().focus().unsetAllMarks().run();
            editor.chain().focus().clearNodes().run();
          }}
        >
          Clean
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
