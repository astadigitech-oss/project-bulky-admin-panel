import { EditorThemeClasses } from "lexical";

import "./editor-theme.css";

export const editorTheme: EditorThemeClasses = {
  ltr: "text-left",
  rtl: "text-right",
  heading: {
    // H1: 24px
    h1: "mt-6 mb-3 scroll-m-20 text-[24px] font-bold tracking-tight",
    // H2: 20px
    h2: "mt-5 mb-2 scroll-m-20 text-[20px] font-semibold tracking-tight border-b pb-1",
    // H3: 18px
    h3: "mt-4 mb-2 scroll-m-20 text-[18px] font-semibold tracking-tight",
    // H4: 16px
    h4: "mt-3 mb-1 scroll-m-20 text-[16px] font-semibold tracking-tight",
    // H5: 14px (Bold)
    h5: "mt-3 mb-1 scroll-m-20 text-[14px] font-bold tracking-tight",
    // H6: 14px (Semibold)
    h6: "mt-3 mb-1 scroll-m-20 text-[14px] font-semibold tracking-tight uppercase text-muted-foreground",
  },
  paragraph: "text-[14px] leading-relaxed mb-3 last:mb-0",

  quote: "mt-4 mb-4 border-l-4 border-muted pl-6 italic text-muted-foreground",
  link: "text-blue-600 hover:underline hover:cursor-pointer",
  list: {
    checklist: "relative",
    listitem: "my-1 mx-4",
    listitemChecked:
      'relative mx-2 px-6 list-none outline-none line-through before:content-[""] before:w-4 before:h-4 before:top-0.5 before:left-0 before:cursor-pointer before:block before:bg-cover before:absolute before:border before:border-primary before:rounded before:bg-primary before:bg-no-repeat after:content-[""] after:cursor-pointer after:border-white after:border-solid after:absolute after:block after:top-[6px] after:w-[3px] after:left-[7px] after:right-[7px] after:h-[6px] after:rotate-45 after:border-r-2 after:border-b-2 after:border-l-0 after:border-t-0',
    listitemUnchecked:
      'relative mx-2 px-6 list-none outline-none before:content-[""] before:w-4 before:h-4 before:top-0.5 before:left-0 before:cursor-pointer before:block before:bg-cover before:absolute before:border before:border-primary before:rounded',
    nested: {
      listitem: "list-none before:hidden after:hidden my-0",
    },
    ol: "my-4 ml-6 list-decimal [&>li]:leading-relaxed",
    olDepth: [
      "list-outside !list-decimal",
      "list-outside !list-[upper-roman]",
      "list-outside !list-[lower-roman]",
      "list-outside !list-[upper-alpha]",
      "list-outside !list-[lower-alpha]",
    ],
    ul: "my-4 ml-6 list-disc [&>li]:leading-relaxed",
    ulDepth: [
      "list-outside !list-disc",
      "list-outside !list-disc",
      "list-outside !list-disc",
      "list-outside !list-disc",
      "list-outside !list-disc",
    ],
  },
  hashtag: "text-blue-600 bg-blue-100 rounded-md px-1",
  text: {
    bold: "font-bold",
    code: "relative rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground",
    italic: "italic",
    strikethrough: "line-through",
    subscript: "sub",
    superscript: "sup",
    underline: "underline",
    underlineStrikethrough: "[text-decoration:underline_line-through]",
  },
  image: "relative inline-block user-select-none cursor-default editor-image",
  inlineImage:
    "relative inline-block user-select-none cursor-default inline-editor-image",
  keyword: "text-purple-900 font-bold",
  code: "EditorTheme__code",
  codeHighlight: {
    atrule: "EditorTheme__tokenAttr",
    attr: "EditorTheme__tokenAttr",
    boolean: "EditorTheme__tokenProperty",
    builtin: "EditorTheme__tokenSelector",
    cdata: "EditorTheme__tokenComment",
    char: "EditorTheme__tokenSelector",
    class: "EditorTheme__tokenFunction",
    "class-name": "EditorTheme__tokenFunction",
    comment: "EditorTheme__tokenComment",
    constant: "EditorTheme__tokenProperty",
    deleted: "EditorTheme__tokenProperty",
    doctype: "EditorTheme__tokenComment",
    entity: "EditorTheme__tokenOperator",
    function: "EditorTheme__tokenFunction",
    important: "EditorTheme__tokenVariable",
    inserted: "EditorTheme__tokenSelector",
    keyword: "EditorTheme__tokenAttr",
    namespace: "EditorTheme__tokenVariable",
    number: "EditorTheme__tokenProperty",
    operator: "EditorTheme__tokenOperator",
    prolog: "EditorTheme__tokenComment",
    property: "EditorTheme__tokenProperty",
    punctuation: "EditorTheme__tokenPunctuation",
    regex: "EditorTheme__tokenVariable",
    selector: "EditorTheme__tokenSelector",
    string: "EditorTheme__tokenSelector",
    symbol: "EditorTheme__tokenProperty",
    tag: "EditorTheme__tokenProperty",
    url: "EditorTheme__tokenOperator",
    variable: "EditorTheme__tokenVariable",
  },
  characterLimit: "!bg-destructive/50",
  table: "EditorTheme__table w-fit overflow-scroll border-collapse",
  tableCell:
    'EditorTheme__tableCell w-24 relative border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"',
  tableCellActionButton:
    "EditorTheme__tableCellActionButton bg-background block border-0 rounded-2xl w-5 h-5 text-foreground cursor-pointer",
  tableCellActionButtonContainer:
    "EditorTheme__tableCellActionButtonContainer block right-1 top-1.5 absolute z-10 w-5 h-5",
  tableCellEditing: "EditorTheme__tableCellEditing rounded-sm shadow-sm",
  tableCellHeader:
    "EditorTheme__tableCellHeader bg-muted border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
  tableCellPrimarySelected:
    "EditorTheme__tableCellPrimarySelected border border-primary border-solid block h-[calc(100%-2px)] w-[calc(100%-2px)] absolute -left-[1px] -top-[1px] z-10 ",
  tableCellResizer:
    "EditorTheme__tableCellResizer absolute -right-1 h-full w-2 cursor-ew-resize z-10 top-0",
  tableCellSelected: "EditorTheme__tableCellSelected bg-muted",
  tableCellSortedIndicator:
    "EditorTheme__tableCellSortedIndicator block opacity-50 bsolute bottom-0 left-0 w-full h-1 bg-muted",
  tableResizeRuler:
    "EditorTheme__tableCellResizeRuler block absolute w-[1px] h-full bg-primary top-0",
  tableRowStriping:
    "EditorTheme__tableRowStriping m-0 border-t p-0 even:bg-muted",
  tableSelected: "EditorTheme__tableSelected ring-2 ring-primary ring-offset-2",
  tableSelection: "EditorTheme__tableSelection bg-transparent",
  layoutItem: "border border-dashed px-4 py-2",
  layoutContainer: "grid gap-2.5 my-2.5 mx-0",
  autocomplete: "text-muted-foreground",
  blockCursor: "",
  embedBlock: {
    base: "user-select-none",
    focus: "ring-2 ring-primary ring-offset-2",
  },
  hr: 'my-8 border-none cursor-pointer after:content-[""] after:block after:h-[1px] after:bg-border selected:ring-2 selected:ring-primary',
  indent: "[--lexical-indent-base-value:40px]",
  mark: "",
  markOverlap: "",
};
