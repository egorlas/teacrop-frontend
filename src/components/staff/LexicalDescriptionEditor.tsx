"use client";

import { useMemo } from "react";
import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import {
  $generateHtmlFromNodes,
  $generateNodesFromDOM,
} from "@lexical/html";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import {
  $getRoot,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Link as LinkIcon,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

type ToolbarProps = {};

function Toolbar({}: ToolbarProps) {
  const [editor] = useLexicalComposerContext();

  const exec = (command: any, payload?: any) => {
    editor.dispatchCommand(command, payload as never);
  };

  const insertHtmlSnippet = (html: string) => {
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().append(...nodes);
    });
  };

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1 border-b pb-1 text-xs">
      {/* Font size */}
      <select
        className="h-7 rounded border bg-background px-1 text-[11px]"
        defaultValue=""
        onChange={(e) => {
          const size = e.target.value;
          if (!size) return;
          insertHtmlSnippet(`<span style="font-size:${size}"></span>`);
        }}
      >
        <option value="">Size</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
      </select>

      {/* Font family (option không được chứa SVG) */}
      <select
        className="h-7 rounded border bg-background px-1 text-[11px]"
        defaultValue=""
        onChange={(e) => {
          const font = e.target.value;
          if (!font) return;
          insertHtmlSnippet(`<span style="font-family:${font}"></span>`);
        }}
      >
        <option value="">Font</option>
        <option value="system-ui">System</option>
        <option value="serif">Serif</option>
        <option value="Georgia,serif">Georgia</option>
        <option value="monospace">Mono</option>
      </select>

      <span className="mx-1 h-4 w-px bg-border" />
      <button
        type="button"
        className="rounded border px-2 py-1 hover:bg-muted"
        onClick={() => exec(FORMAT_TEXT_COMMAND, "bold")}
      >
        <BoldIcon className="h-3 w-3" />
      </button>
      <button
        type="button"
        className="rounded border px-2 py-1 hover:bg-muted"
        onClick={() => exec(FORMAT_TEXT_COMMAND, "italic")}
      >
        <ItalicIcon className="h-3 w-3" />
      </button>
      <button
        type="button"
        className="rounded border px-2 py-1 hover:bg-muted"
        onClick={() => exec(FORMAT_TEXT_COMMAND, "underline")}
      >
        <UnderlineIcon className="h-3 w-3" />
      </button>
      <span className="mx-1 h-4 w-px bg-border" />
      <button
        type="button"
        className="rounded border px-2 py-1 hover:bg-muted"
        onClick={() => exec(FORMAT_ELEMENT_COMMAND, "h2")}
      >
        H2
      </button>
      <button
        type="button"
        className="rounded border px-2 py-1 hover:bg-muted"
        onClick={() => exec(FORMAT_ELEMENT_COMMAND, "h3")}
      >
        H3
      </button>
      <span className="mx-1 h-4 w-px bg-border" />
      {/* Insert link */}
      <button
        type="button"
        className="rounded border px-2 py-1 hover:bg-muted"
        onClick={() => {
          const url = window.prompt("Nhập URL liên kết:");
          if (!url) return;
          const text = window.prompt("Text hiển thị (tùy chọn):") || url;
          insertHtmlSnippet(
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`,
          );
        }}
      >
        <LinkIcon className="h-3 w-3" />
      </button>
      <span className="mx-1 h-4 w-px bg-border" />
      <button
        type="button"
        className="rounded border px-2 py-1 hover:bg-muted"
        onClick={() => exec(UNDO_COMMAND)}
      >
        Undo
      </button>
      <button
        type="button"
        className="rounded border px-2 py-1 hover:bg-muted"
        onClick={() => exec(REDO_COMMAND)}
      >
        Redo
      </button>
    </div>
  );
}

export function LexicalDescriptionEditor({ value, onChange }: Props) {
  const initialConfig: InitialConfigType = useMemo(
    () => ({
      namespace: "ProductDescriptionEditor",
      onError(error) {
        console.error(error);
      },
      // Bật đầy đủ rich text nodes (heading, quote, list...)
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
      editorState: (editor) => {
        if (!value) return;
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      },
      theme: {
        paragraph: "mb-1",
      },
    }),
    [value],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="min-h-[160px] rounded-md border bg-background px-2 py-1 text-sm">
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[140px] outline-none" />
          }
          placeholder={
            <div className="pointer-events-none select-none text-xs text-muted-foreground">
              Nhập nội dung mô tả, ghi chú, thông tin chi tiết về sản phẩm...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin
          onChange={(editorState, editor) => {
            editorState.read(() => {
              const html = $generateHtmlFromNodes(editor);
              onChange(html);
            });
          }}
        />
      </div>
    </LexicalComposer>
  );
}

