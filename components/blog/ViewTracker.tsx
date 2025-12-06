// components/blog/ViewTracker.tsx - ROBUST VERSION
'use client'

import { useEffect, useState } from 'react'
import { incrementPostViewsAction } from '@/actions/postActions'

// Global tracking to prevent multiple components from tracking
const globalTrackingMap = new Set<string>()

export default function ViewTracker({ slug }: { slug: string }) {
  const [isTracking, setIsTracking] = useState(false)
  
  useEffect(() => {
    // Skip if already tracking or globally tracked
    if (isTracking || globalTrackingMap.has(slug)) {
      return
    }
    
    setIsTracking(true)
    globalTrackingMap.add(slug)
    
    console.log(`🚀 ViewTracker: Starting tracking for ${slug}`)
    
    // Create a unique ID for this tracking session
    const trackingId = Math.random().toString(36).substring(7)
    
    const trackView = async () => {
      try {
        console.log(`📤 ViewTracker [${trackingId}]: Sending POST request`)
        const startTime = Date.now()
        
        const result = await incrementPostViewsAction(slug)
        
        const duration = Date.now() - startTime
        console.log(`✅ ViewTracker [${trackingId}]: Completed in ${duration}ms`, result)
        
      } catch (error) {
        console.error(`❌ ViewTracker [${trackingId}]: Error:`, error)
        // Remove from global tracking on error so it can retry
        globalTrackingMap.delete(slug)
        setIsTracking(false)
      }
    }
    
    // Wait for page to be idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        setTimeout(trackView, 500)
      })
    } else {
      setTimeout(trackView, 1500)
    }
    
    return () => {
      // Cleanup
    }
  }, [slug, isTracking])
  
  return null
}