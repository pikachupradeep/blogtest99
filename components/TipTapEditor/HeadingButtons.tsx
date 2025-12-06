//components/TipTapEditor/HeadingButtons.tsx

import { Editor } from '@tiptap/react'

interface HeadingButtonsProps {
  editor: Editor
  editorState: {
    isParagraph: boolean
    isHeading1: boolean
    isHeading2: boolean
    isHeading3: boolean
  }
}

const HeadingButtons = ({ editor, editorState }: HeadingButtonsProps) => (
  <>
    <button
      onClick={() => editor.chain().focus().setParagraph().run()}
      className={editorState.isParagraph ? 'is-active' : ''}
      title="Paragraph"
      type="button"
    >
      P
    </button>
    <button
      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      className={editorState.isHeading1 ? 'is-active' : ''}
      title="Heading 1"
      type="button"
    >
      H1
    </button>
    <button
      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      className={editorState.isHeading2 ? 'is-active' : ''}
      title="Heading 2"
      type="button"
    >
      H2
    </button>
    <button
      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      className={editorState.isHeading3 ? 'is-active' : ''}
      title="Heading 3"
      type="button"
    >
      H3
    </button>
  </>
)

export default HeadingButtons