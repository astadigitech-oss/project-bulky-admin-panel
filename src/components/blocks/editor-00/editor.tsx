"use client";

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { editorTheme } from "@/components/editor/themes/editor-theme";
import { TooltipProvider } from "@/components/ui/tooltip";

import { nodes } from "./nodes";
import { Plugins } from "./plugins";
import { HtmlImportPlugin } from "@/components/editor/plugins/html-import-plugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

function HtmlOnChange({
  onHtmlChangeAction,
}: {
  onHtmlChangeAction?: (html: string) => void;
}) {
  // Sekarang ini aman karena komponen ini dibungkus oleh LexicalComposer
  const [editor] = useLexicalComposerContext();

  return (
    <OnChangePlugin
      ignoreSelectionChange={true}
      onChange={(editorState) => {
        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor);
          onHtmlChangeAction?.(htmlString);
        });
      }}
    />
  );
}

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

export default function Editor({
  initialHtml,
  onHtmlChangeAction,
  placeholder,
}: {
  initialHtml?: string;
  onHtmlChangeAction?: (html: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border border-gray-300 dark:border-gray-300/50">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
        }}
      >
        <TooltipProvider>
          <Plugins placeholder={placeholder ?? "Start typing..."} />
          <HtmlImportPlugin html={initialHtml} />

          {/* 3. Panggil Komponen OnChange kustom kita */}
          <HtmlOnChange onHtmlChangeAction={onHtmlChangeAction} />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
