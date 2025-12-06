
//components/TipTapEditor/FormattingButtons.tsx

import { Editor } from '@tiptap/react'

interface FormattingButtonsProps {
  editor: Editor
  editorState: {
    isBold: boolean
    canBold: boolean
    isItalic: boolean
    canItalic: boolean
    isStrike: boolean
    canStrike: boolean
    isCode: boolean
    canCode: boolean
  }
}

const FormattingButtons = ({ editor, editorState }: FormattingButtonsProps) => (
  <>
    <button
      onClick={() => editor.chain().focus().toggleBold().run()}
      disabled={!editorState.canBold}
      className={editorState.isBold ? 'is-active' : ''}
      title="Bold"
      type="button"
    >
      <strong>B</strong>
    </button>
    <button
      onClick={() => editor.chain().focus().toggleItalic().run()}
      disabled={!editorState.canItalic}
      className={editorState.isItalic ? 'is-active' : ''}
      title="Italic"
      type="button"
    >
      <em>I</em>
    </button>
    <button
      onClick={() => editor.chain().focus().toggleStrike().run()}
      disabled={!editorState.canStrike}
      className={editorState.isStrike ? 'is-active' : ''}
      title="Strikethrough"
      type="button"
    >
      <s>S</s>
    </button>
    <button
      onClick={() => editor.chain().focus().toggleCode().run()}
      disabled={!editorState.canCode}
      className={editorState.isCode ? 'is-active' : ''}
      title="Code"
      type="button"
    >
      {'</>'}
    </button>
    <button 
      onClick={() => editor.chain().focus().unsetAllMarks().run()}
      title="Clear formatting"
      type="button"
    >
      Clear
    </button>
  </>
)

export default FormattingButtons