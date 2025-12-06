//components/TipTapEditor/MenuBar.tsx

'use client'

import { useEditorState, Editor } from '@tiptap/react'
import FormattingButtons from './FormattingButtons'
import HeadingButtons from './HeadingButtons'
import ListButtons from './ListButtons'
import HistoryButtons from './HistoryButtons'
import ImageUpload from './ImageUpload'
import AlignmentButtons from './AlignmentButtons'

interface MenuBarProps {
  editor: Editor
  onImagesUpload?: (images: any[]) => void
}

const MenuBar = ({ editor, onImagesUpload }: MenuBarProps) => {
  // Updated to match official TipTap pattern with nullish coalescing
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      }
    },
  })

  return (
    <div className="menu-bar">
      <div className="button-group">
        <FormattingButtons editor={editor} editorState={editorState} />
        <HeadingButtons editor={editor} editorState={editorState} />
        <ListButtons editor={editor} editorState={editorState} />
        <AlignmentButtons editor={editor} />
        <ImageUpload 
          editor={editor} 
          onImagesUpload={onImagesUpload}
        />
        <HistoryButtons editor={editor} editorState={editorState} />
      </div>
    </div>
  )
}

export default MenuBar