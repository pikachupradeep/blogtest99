// components/layout/Footer.tsx
'use client'

import Link from 'next/link'
import { 
  FiHome, 
  FiBook, 
  FiFolder, 
  FiUser, 
  FiMail, 
  FiGithub, 
  FiTwitter, 
  FiLinkedin,
  FiHeart,
  FiArrowUp
} from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { getCategoriesAction } from '@/actions/category-actions'

interface Category {
  $id: string
  name: string
  image?: string
}

// Type guard to check if the data matches Category interface
function isCategory(data: any): data is Category {
  return data && typeof data.$id === 'string' && typeof data.name === 'string'
}

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategoriesAction()
        
        // Transform the data to match Category interface
        const transformedCategories: Category[] = categoriesData.map((item: any) => ({
          $id: item.$id,
          name: item.name || 'Unnamed Category',
          image: item.image || undefined
        }))
        
        setCategories(transformedCategories)
      } catch (error) {
        console.error('Error fetching categories for footer:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const mainLinks = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Blog', href: '/blog', icon: FiBook },
    { name: 'Categories', href: '/categories', icon: FiFolder },
    { name: 'About', href: '/about', icon: FiUser },
    { name: 'Contact', href: '/contact', icon: FiMail }
  ]

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' }
  ]

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: FiGithub },
    { name: 'Twitter', href: 'https://twitter.com', icon: FiTwitter },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: FiLinkedin }
  ]

  return (
    <footer className="bg-gray-950 text-white font-mono">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-black text-sm">F8</span>
              </div>
              <span className="text-xl font-black">FOUNR8</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Discover curated content, explore inspiring stories, and transform your perspective through thoughtful articles and tutorials.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-300 group"
                >
                  <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">QUICK LINKS</h3>
            <ul className="space-y-3">
              {mainLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 text-sm group"
                  >
                    <link.icon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories - Dynamically Fetched */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">CATEGORIES</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-20"></div>
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <ul className="space-y-3">
                {categories.slice(0, 6).map((category) => (
                  <li key={category.$id}>
                    <Link
                      href={`/category/${category.name.toLowerCase()}`}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm block py-1 group"
                    >
                      <span className="group-hover:underline">{category.name}</span>
                    </Link>
                  </li>
                ))}
                {categories.length > 6 && (
                  <li>
                    <Link
                      href="/categories"
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-300 text-sm font-medium"
                    >
                      VIEW_ALL_CATEGORIES →
                    </Link>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No categories available</p>
            )}
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">STAY UPDATED</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest articles and updates delivered to your inbox.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="ENTER_YOUR_EMAIL"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600 focus:bg-gray-750 transition-all duration-300 font-mono"
              />
              <button
                type="submit"
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg font-bold text-sm hover:bg-gray-100 transition-all duration-300 hover:scale-105 border border-white"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright and Legal */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <span>© {currentYear} FOUNR8 BLOG.</span>
                <span className="flex items-center space-x-1">
                  <span>MADE WITH</span>
                  <FiHeart className="w-3 h-3 text-red-500" />
                  <span>FOR READERS</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {legalLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-xs"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all duration-300 group"
            >
              <span className="text-gray-400 group-hover:text-white text-xs font-mono">BACK_TO_TOP</span>
              <FiArrowUp className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-6 text-gray-500 text-xs">
              <div className="flex items-center space-x-1">
                <FiBook className="w-3 h-3" />
                <span>1.2K ARTICLES</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiUser className="w-3 h-3" />
                <span>50K READERS</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiFolder className="w-3 h-3" />
                <span>{categories.length} CATEGORIES</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer