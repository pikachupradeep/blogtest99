// components/about/MissionVisionIntro.tsx
'use client'

import { useState, useEffect } from 'react'
import { FiFeather, FiEye, FiHeart, FiBook, FiUsers, FiAward, FiStar, FiTarget } from 'react-icons/fi'

export function MissionVisionIntro() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden font-mono">
      {/* Enhanced Background Elements */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-100/30 dark:bg-purple-900/10 rounded-full blur-3xl opacity-40 animate-pulse-slow delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-100/20 dark:bg-cyan-900/5 rounded-full blur-3xl opacity-30 animate-pulse-slow delay-500"></div>
      
      {/* Floating Particles */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-float-slow"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full opacity-60 animate-float-medium"></div>
      <div className="absolute bottom-32 left-32 w-3 h-3 bg-cyan-400 rounded-full opacity-30 animate-float-fast"></div>
      <div className="absolute bottom-20 right-20 w-1 h-1 bg-indigo-400 rounded-full opacity-50 animate-float-slow"></div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Enhanced Introduction Section */}
        <div className="text-center max-w-5xl mx-auto mb-20">
          <div className={`inline-flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl px-5 py-3 mb-8 transition-all duration-700 group hover:scale-105 hover:shadow-lg ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="relative">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
              OUR STORY & PURPOSE
            </span>
            <FiStar className="w-4 h-4 text-yellow-500 animate-spin-slow" />
          </div>

          <h2 className={`text-3xl md:text-4xl font-black mb-8 leading-tight transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
              More Than Just
            </span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Words On A Screen
            </span>
          </h2>

          <p className={`text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10 max-w-3xl mx-auto transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            Founr8 started as a simple idea: create a space where curiosity meets clarity. 
            We believe every reader deserves content that not only informs but inspires, 
            and every writer deserves an audience that truly listens.
          </p>

          {/* Stats Bar */}
          <div className={`flex flex-wrap justify-center gap-8 mt-12 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {[
              { number: '2023', label: 'Founded', icon: FiAward },
              { number: '99%', label: 'Satisfaction', icon: FiHeart },
              { number: '24/7', label: 'Support', icon: FiUsers },
              { number: '1M+', label: 'Words Published', icon: FiBook }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">{stat.number}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Mission & Vision Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
          {/* Mission Card */}
          <div className={`group transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="relative bg-gradient-to-br from-blue-50/80 to-indigo-100/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-3xl p-10 h-full border border-blue-200/60 dark:border-blue-700/30 hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              
              <div className="relative flex items-start space-x-6 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiFeather className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Our Mission</h3>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">Why we write and create</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg relative z-10">
                To create a welcoming space where diverse voices can share their stories, 
                insights, and expertise. We're committed to publishing content that matters— 
                articles that educate, entertain, and empower our readers to see the world 
                through new perspectives.
              </p>
              
              {/* Decorative Element */}
              <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <FiTarget className="w-12 h-12 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className={`group transition-all duration-700 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="relative bg-gradient-to-br from-purple-50/80 to-pink-100/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-3xl p-10 h-full border border-purple-200/60 dark:border-purple-700/30 hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              
              <div className="relative flex items-start space-x-6 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FiEye className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Our Vision</h3>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold">Where we're headed together</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg relative z-10">
                To become the go-to destination for readers seeking authentic, 
                well-researched content that makes a difference. We envision a community 
                where knowledge flows freely, conversations spark change, and every article 
                contributes to someone's personal growth journey.
              </p>
              
              {/* Decorative Element */}
              <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <FiStar className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced What Makes Us Different Section */}
        <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-10 border border-gray-200/60 dark:border-gray-700/30 transition-all duration-700 delay-700 overflow-hidden ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="relative text-center mb-12">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">What Makes Founr8 Different</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              We focus on what really matters to readers and creators alike
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              {
                icon: FiBook,
                title: "Quality Over Quantity",
                description: "Every article is carefully curated and thoroughly researched before it reaches you",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: FiUsers,
                title: "Reader-First Approach",
                description: "We write for you, not algorithms. Content that actually helps and inspires",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: FiHeart,
                title: "Authentic Voices",
                description: "Real stories from real people. No AI-generated content, just genuine perspectives",
                color: "from-purple-500 to-pink-500"
              }
            ].map((item, index) => (
              <div key={item.title} className="group text-center p-8 rounded-3xl hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-500 hover:scale-105 hover:shadow-xl border border-transparent hover:border-gray-200/40 dark:hover:border-gray-600/40">
                <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-4">{item.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Call to Action */}
        <div className={`text-center mt-16 transition-all duration-700 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-xl font-medium">
            Ready to explore what we have to offer?
          </p>
          <button className="group relative bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 text-white px-10 py-4 rounded-2xl font-bold text-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">Start Reading Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}