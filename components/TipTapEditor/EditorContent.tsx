//components/TipTapEditor/EditorContent.tsx

'use client'

import { EditorContent, Editor } from '@tiptap/react'

interface EditorContentProps {
  editor: Editor | null
}

const EditorContentComponent = ({ editor }: EditorContentProps) => {
  return <EditorContent editor={editor} />
}

export default EditorContentComponent