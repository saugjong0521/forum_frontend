// types/editor.ts
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'

export type CustomElement = {
    type: 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3' | 'bulleted-list' | 'numbered-list' | 'list-item' | 'blockquote' | 'code-block'
    children: CustomText[]
    level?: number
    listType?: 'bulleted' | 'numbered'
}

export type CustomText = {
    text: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    code?: boolean
    fontSize?: number
    color?: string
}

export interface SlateTextEditorRef {
    getHTML: () => string;
    clear: () => void;
}

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor
        Element: CustomElement
        Text: CustomText
    }
}