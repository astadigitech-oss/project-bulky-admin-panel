"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes, $getRoot } from "lexical";

export function HtmlImportPlugin({ html }: { html?: string }) {
  const [editor] = useLexicalComposerContext();
  const hasImportedRef = useRef(false);

  useEffect(() => {
    if (!html || hasImportedRef.current) return;

    editor.update(() => {
      const root = $getRoot();
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, "text/html");

      // 2. Ubah DOM menjadi Node Lexical
      const nodes = $generateNodesFromDOM(editor, dom);
      root.clear();
      // 3. Masukkan ke root editor
      $getRoot().select();
      $insertNodes(nodes);

      hasImportedRef.current = true;
    });
  }, [editor, html]);

  return null;
}
