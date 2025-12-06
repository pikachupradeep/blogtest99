
//components/TipTapEditor/ListButtons.tsx


import { Editor } from '@tiptap/react'

interface ListButtonsProps {
  editor: Editor
  editorState: {
    isBulletList: boolean
    isOrderedList: boolean
    isCodeBlock: boolean
    isBlockquote: boolean
  }
}

const ListButtons = ({ editor, editorState }: ListButtonsProps) => (
  <>
    <button
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      className={editorState.isBulletList ? 'is-active' : ''}
      title="Bullet List"
      type="button"
    >
      • List
    </button>
    <button
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      className={editorState.isOrderedList ? 'is-active' : ''}
      title="Numbered List"
      type="button"
    >
      1. List
    </button>
    <button
      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      className={editorState.isCodeBlock ? 'is-active' : ''}
      title="Code Block"
      type="button"
    >
      Code
    </button>
    <button
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
      className={editorState.isBlockquote ? 'is-active' : ''}
      title="Blockquote"
      type="button"
    >
      Quote
    </button>
    <button 
      onClick={() => editor.chain().focus().setHorizontalRule().run()}
      title="Horizontal Rule"
      type="button"
    >
      HR
    </button>
  </>
)

export default ListButtons