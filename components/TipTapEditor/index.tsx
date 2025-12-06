'use client'

import { useEditor, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { TextStyleKit } from '@tiptap/extension-text-style' // Updated import
import TextAlign from '@tiptap/extension-text-align'
import MenuBar from './MenuBar'
import EditorContent from './EditorContent'
import './styles.css'

// Use TextStyleKit instead of separate TextStyle and Color
const extensions = [
  StarterKit,
  Image.configure({
    inline: true,
    allowBase64: false,
    HTMLAttributes: {
      class: 'editor-image',
    },
  }),
  TextStyleKit, // Simplified - this includes both TextStyle and Color
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
  }),
]

interface TiptapEditorProps {
  content?: string
  onUpdate?: (html: string) => void
  onImagesUpload?: (images: any[]) => void
}

const TiptapEditor = ({ content = '', onUpdate, onImagesUpload }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions,
    content: content,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML())
      }
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="tiptap-editor">
      <MenuBar 
        editor={editor} 
        onImagesUpload={onImagesUpload}
      />
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor