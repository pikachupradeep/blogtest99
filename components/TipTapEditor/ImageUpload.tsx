//components/TipTapEditor/ImageUpload.tsx


'use client'

import { useState, useRef } from 'react'
import { Editor } from '@tiptap/react'

interface ImageUploadProps {
  editor: Editor
  onImagesUpload?: (images: any[]) => void
}

const ImageUpload = ({ editor, onImagesUpload }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      alert('Please select image files only')
      return
    }

    // Check file sizes (limit to 5MB each)
    const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert('Image sizes should be less than 5MB each')
      return
    }

    setIsUploading(true)

    try {
      // Create FormData to send to server action
      const formData = new FormData()
      imageFiles.forEach(file => {
        formData.append('bg_image', file)
      })

      // Upload images to server
      const response = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload images')
      }

      const result = await response.json()
      
      if (result.success && result.imageUrls) {
        // Insert each image into the editor
        result.imageUrls.forEach((imageUrl: string) => {
          editor.chain().focus().setImage({ src: imageUrl }).run()
        })

        // Notify parent component about uploaded images if callback provided
        if (onImagesUpload) {
          onImagesUpload(result.imageUrls.map((url: string, index: number) => ({
            url,
            file: imageFiles[index]
          })))
        }
      } else {
        throw new Error(result.error || 'Failed to upload images')
      }
      
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Error uploading images')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple // Allow multiple file selection
        style={{ display: 'none' }}
      />
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        title="Insert Image"
        type="button"
        style={{
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          padding: '6px 10px',
          fontSize: '13px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          opacity: isUploading ? 0.6 : 1
        }}
      >
        {isUploading ? '📤 Uploading...' : '🖼️ Image'}
      </button>
    </div>
  )
}

export default ImageUpload