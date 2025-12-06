//components/TipTapEditor/HistoryButtons.tsx


import { Editor } from '@tiptap/react'

interface HistoryButtonsProps {
  editor: Editor
  editorState: {
    canUndo: boolean
    canRedo: boolean
  }
}

const HistoryButtons = ({ editor, editorState }: HistoryButtonsProps) => (
  <>
    <button 
      onClick={() => editor.chain().focus().undo().run()} 
      disabled={!editorState.canUndo}
      title="Undo"
      type="button"
    >
      Undo
    </button>
    <button 
      onClick={() => editor.chain().focus().redo().run()} 
      disabled={!editorState.canRedo}
      title="Redo"
      type="button"
    >
      Redo
    </button>
  </>
)

export default HistoryButtons