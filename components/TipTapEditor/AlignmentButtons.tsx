//components/TipTapEditor/AlignmentButtons.tsx


'use client'

import { useEditorState, Editor } from '@tiptap/react'

interface AlignmentButtonsProps {
  editor: Editor
}

const AlignmentButtons = ({ editor }: AlignmentButtonsProps) => {
  // Use useEditorState to make the component reactive to editor changes
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isLeft: ctx.editor.isActive({ textAlign: 'left' }),
      isCenter: ctx.editor.isActive({ textAlign: 'center' }),
      isRight: ctx.editor.isActive({ textAlign: 'right' }),
      isJustify: ctx.editor.isActive({ textAlign: 'justify' }),
    }),
  })

  const alignments = [
    { 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ), 
      title: 'Align left', 
      action: () => {
        editor.commands.setTextAlign('left')
      },
      isActive: editorState.isLeft
    },
    { 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ), 
      title: 'Align center', 
      action: () => {
        editor.commands.setTextAlign('center')
      },
      isActive: editorState.isCenter
    },
    { 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M9 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ), 
      title: 'Align right', 
      action: () => {
        editor.commands.setTextAlign('right')
      },
      isActive: editorState.isRight
    },
    { 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ), 
      title: 'Justify', 
      action: () => {
        editor.commands.setTextAlign('justify')
      },
      isActive: editorState.isJustify
    },
  ]

  return (
    <div className="button-group">
      {alignments.map((alignment, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            editor.commands.focus()
            alignment.action()
          }}
          className={`menu-button ${alignment.isActive ? 'is-active' : ''}`}
          title={alignment.title}
        >
          {alignment.icon}
        </button>
      ))}
    </div>
  )
}

export default AlignmentButtons