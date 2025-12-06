// components/about/AboutHero.tsx
'use client'

import { useState, useEffect } from 'react'
import { FiUsers, FiBook, FiAward, FiGlobe, FiArrowRight, FiFeather, FiStar } from 'react-icons/fi'

export function AboutHero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const stats = [
    { number: '1.2K+', label: 'Articles Published', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
    { number: '50K+', label: 'Monthly Readers', icon: FiUsers, color: 'from-purple-500 to-pink-500' },
    { number: '24+', label: 'Categories', icon: FiAward, color: 'from-orange-500 to-red-500' },
    { number: '15+', label: 'Countries Reached', icon: FiGlobe, color: 'from-green-500 to-emerald-500' }
  ]

  return (
    <div className="relative min-h-[90vh] pt-16 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/10 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/5 overflow-hidden font-mono">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute inset-0 animate-float-slow" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #000 1px, transparent 1px), radial-gradient(circle at 75% 75%, #000 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Animated Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-float-medium"></div>
      <div className="absolute top-1/3 right-20 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-25 animate-float-slow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-30 animate-float-fast"></div>
      <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-20 animate-float-medium"></div>
      <div className="absolute bottom-20 right-16 w-4 h-4 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full opacity-25 animate-float-slow"></div>

      {/* Gradient Orbs */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 relative">
              {/* Animated Badge */}
              <div className={`inline-flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md transition-all duration-700 delay-100 group hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
                  WELCOME TO FOUNR8
                </span>
                <FiStar className="w-4 h-4 text-yellow-500 animate-spin-slow" />
              </div>

              {/* Main Heading with Gradient Text */}
              <div className="space-y-6">
                <h1 className={`text-3xl md:text-4xl lg:text-5xl font-black leading-tight transition-all duration-700 delay-200 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}>
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                    WHERE IDEAS
                  </span>
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    FIND THEIR
                  </span>
                  <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                    FOUNTAIN
                  </span>
                </h1>
                
                <p className={`text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl transition-all duration-700 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}>
                  Founr8 is your digital oasis for curated content, insightful stories, and transformative ideas. 
                  We believe every great thought deserves a platform to flourish and inspire change.
                </p>
              </div>

              {/* CTA Buttons with Enhanced Design */}
              <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}>
                <button className="group relative flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">EXPLORE CONTENT</span>
                  <FiArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </button>

                <button className="group relative flex items-center justify-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-8 py-4 rounded-2xl font-semibold text-sm border border-gray-300/60 dark:border-gray-600/60 hover:border-gray-400/80 dark:hover:border-gray-500/80 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">MEET OUR WRITERS</span>
                  <FiUsers className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Right Content - Enhanced Stats Grid */}
            <div className={`grid grid-cols-2 gap-6 transition-all duration-700 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="group relative"
                  style={{
                    transitionDelay: `${700 + (index * 100)}ms`
                  }}
                >
                  {/* Card Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  
                  {/* Main Card */}
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 overflow-hidden">
                    {/* Animated Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                    
                    <div className="relative flex items-center space-x-5">
                      {/* Icon Container with Gradient */}
                      <div className={`relative w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <stat.icon className="w-7 h-7 text-white" />
                        {/* Icon Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:scale-105 transition-transform duration-300">
                          {stat.number}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-tight">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                    
                    {/* Subtle Pattern Overlay */}
                    <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                      <div className="w-full h-full" style={{
                        backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                        backgroundSize: '10px 10px'
                      }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Scroll Indicator */}
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-700 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="w-6 h-10 border-2 border-gray-400/60 dark:border-gray-500/60 rounded-full flex justify-center group-hover:border-gray-600/80 dark:group-hover:border-gray-400/80 transition-all duration-300 group-hover:scale-110">
                  <div className="w-1 h-3 bg-gradient-to-b from-gray-600 to-gray-400 dark:from-gray-400 dark:to-gray-600 rounded-full mt-2 animate-bounce"></div>
                </div>
                {/* Pulse Effect */}
                <div className="absolute inset-0 w-6 h-10 border-2 border-gray-400/30 rounded-full animate-ping"></div>
              </div>
              <span className="text-gray-500/80 dark:text-gray-400/80 text-xs font-medium tracking-widest group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 font-mono">
                DISCOVER MORE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white/80 dark:from-gray-900/80 to-transparent"></div>
    </div>
  )
}