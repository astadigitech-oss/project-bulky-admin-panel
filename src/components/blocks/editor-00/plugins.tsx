import { useState } from "react";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph";
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list";
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote";
import { ClearFormattingToolbarPlugin } from "@/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/element-format-toolbar-plugin";
import { FontColorToolbarPlugin } from "@/components/editor/plugins/toolbar/font-color-toolbar-plugin";
import { FontBackgroundToolbarPlugin } from "@/components/editor/plugins/toolbar/font-background-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import { FontSizeToolbarPlugin } from "@/components/editor/plugins/toolbar/font-size-toolbar-plugin";
import { HistoryToolbarPlugin } from "@/components/editor/plugins/toolbar/history-toolbar-plugin";
import { LinkToolbarPlugin } from "@/components/editor/plugins/toolbar/link-toolbar-plugin";
import { AutoLinkPlugin } from "@/components/editor/plugins/auto-link-plugin";
import { LinkPlugin } from "@/components/editor/plugins/link-plugin";
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { ActionsPlugin } from "@/components/editor/plugins/actions/actions-plugin";
import { ClearEditorActionPlugin } from "@/components/editor/plugins/actions/clear-editor-plugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { CounterCharacterPlugin } from "@/components/editor/plugins/actions/counter-character-plugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { FloatingTextFormatToolbarPlugin } from "@/components/editor/plugins/floating-text-format-plugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { InsertImage } from "@/components/editor/plugins/toolbar/block-insert/insert-image";
import { ImagesPlugin } from "@/components/editor/plugins/images-plugin";
import { InsertTable } from "@/components/editor/plugins/toolbar/block-insert/insert-table";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { InsertHorizontalRule } from "@/components/editor/plugins/toolbar/block-insert/insert-horizontal-rule";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { Separator } from "@/components/ui/separator";

export function Plugins({ placeholder }: { placeholder: string }) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      {/* toolbar plugins */}
      <ToolbarPlugin
        childrenAction={() => (
          <div className="vertical-align-middle sticky top-0 z-5 flex gap-2 overflow-auto border-b p-1">
            <HistoryToolbarPlugin />
            <Separator orientation="vertical" className={"h-5!"} />
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatNumberedList />
              <FormatBulletedList />
              <FormatCheckList />
              <FormatQuote />
            </BlockFormatDropDown>
            <FontSizeToolbarPlugin />
            <Separator orientation="vertical" className={"h-5!"} />
            <FontFormatToolbarPlugin />
            <Separator orientation="vertical" className={"h-5!"} />
            <ElementFormatToolbarPlugin />
            <Separator orientation="vertical" className={"h-5!"} />
            <LinkToolbarPlugin setIsLinkEditModeAction={setIsLinkEditMode} />
            <InsertImage />
            <InsertTable />
            <InsertHorizontalRule />
            <Separator orientation="vertical" className={"h-5!"} />
            <FontColorToolbarPlugin />
            <FontBackgroundToolbarPlugin />
            <Separator orientation="vertical" className={"h-5!"} />
            <ClearFormattingToolbarPlugin />
          </div>
        )}
      />
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable
                  placeholder={placeholder}
                  className="ContentEditable__root relative block h-[50vh] overflow-auto px-8 py-4 focus:outline-none scrollbar-hide"
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <TabIndentationPlugin />
        <ImagesPlugin />
        <TablePlugin />
        <ListPlugin />
        <CheckListPlugin />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ClickableLinkPlugin />
        <AutoLinkPlugin />
        <LinkPlugin />
        <HorizontalRulePlugin />
        <FloatingLinkEditorPlugin
          anchorElem={floatingAnchorElem}
          isLinkEditMode={isLinkEditMode}
          setIsLinkEditModeAction={setIsLinkEditMode}
        />
        <FloatingTextFormatToolbarPlugin
          anchorElem={floatingAnchorElem}
          setIsLinkEditModeAction={setIsLinkEditMode}
        />
      </div>
      {/* actions plugins */}
      <ActionsPlugin>
        <div className="clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1">
          <div className="flex flex-1 justify-start px-2">
            <CounterCharacterPlugin charset="UTF-16" />
          </div>
          <div></div>
          <div className="flex flex-1 justify-end">
            <ClearEditorActionPlugin />
            <ClearEditorPlugin />
          </div>
        </div>
      </ActionsPlugin>
    </div>
  );
}
