'use client'

import React, { useEffect, useState } from 'react'
import styles from './NavbarTop.module.css'
import { getCategoriesAction } from '@/actions/category-actions'
import Link from 'next/link'

interface DisplayCategory {
  $id: string;
  name: string;
  slug?: string;
}

// Type guard to check if data matches Category structure
function isCategoryArray(data: any): data is DisplayCategory[] {
  if (!Array.isArray(data)) return false
  return data.every(item => 
    typeof item === 'object' && 
    item !== null &&
    typeof item.$id === 'string' &&
    typeof item.name === 'string'
  )
}

const NavbarTop = () => {
  const [categories, setCategories] = useState<DisplayCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await getCategoriesAction()
        
        // Transform the data to match DisplayCategory
        let transformedData: DisplayCategory[] = []
        
        if (isCategoryArray(data)) {
          transformedData = data
        } else if (Array.isArray(data)) {
          // Handle Appwrite's DefaultDocument structure
          transformedData = data.map(doc => ({
            $id: doc.$id || doc.id || Math.random().toString(),
            name: doc.name || 'Unnamed Category',
            slug: doc.slug || undefined
          }))
        }
        
        setCategories(transformedData)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Fallback items if no categories are available
  const fallbackItems: DisplayCategory[] = [
    { $id: 'travel', name: "✈️ Travel", slug: "travel" },
    { $id: 'hotels', name: "🏨 Hotels", slug: "hotels" },
    { $id: 'deals', name: "🎯 Deals", slug: "deals" },
    { $id: 'support', name: "📞 Support", slug: "support" },
    { $id: 'destinations', name: "🌴 Destinations", slug: "destinations" },
    { $id: 'discounts', name: "💰 Discounts", slug: "discounts" }
  ]

  // Use real categories if available, otherwise use fallback
  const displayItems: DisplayCategory[] = categories.length > 0 
    ? categories
    : fallbackItems

  // Function to create URL-friendly slug
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  // Handle loading state
  if (loading && categories.length === 0) {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800 py-3 overflow-hidden relative">
        <div className="flex justify-center">
          <span className="text-sm font-medium animate-pulse text-gray-600 dark:text-gray-300">
            Loading categories...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-0 w-full z-50">
    <div className="w-full bg-gray-100 dark:bg-gray-900 py-1 overflow-hidden relative">
      <div className={`flex whitespace-nowrap ${styles.marquee}`}>
        {[...displayItems, ...displayItems].map((item, index) => {
          const slug = item.slug || createSlug(item.name)
          
          return (
            <div key={`${item.$id}-${index}`} className="flex items-center mx-6 shrink-0">
              <Link 
                href={`/category/${slug}`}
                className="group"
              >
                <span className="text-sm capitalize font-medium font-mono text-blue-900 dark:text-green-400 hover:text-blue-200 transition-colors duration-200">
                  {item.name}
                </span>
              </Link>
              <span className="ml-6 text-blue-300 dark:text-gray-400 opacity-70">
                
              </span>
            </div>
          )
        })}
      </div>
    </div>
    </div>
  )
}

export default NavbarTop