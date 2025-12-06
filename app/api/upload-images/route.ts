// app/api/upload-images/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { uploadMultipleImages } from '@/actions/postActions'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFiles = formData.getAll('bg_image') as File[]

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      )
    }

    // Upload images using your existing server action
    const imageUrls = await uploadMultipleImages(imageFiles)

    return NextResponse.json({
      success: true,
      imageUrls,
      message: `${imageUrls.length} image(s) uploaded successfully`
    })

  } catch (error: any) {
    console.error('Error in upload-images API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to upload images' 
      },
      { status: 500 }
    )
  }
}