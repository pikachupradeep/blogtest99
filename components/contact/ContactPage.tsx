// components/contact/ContactPage.tsx
'use client'

import { useState } from 'react'
import { FiMail, FiPhone, FiMapPin, FiSend, FiUser, FiMessageSquare, FiClock, FiHeart } from 'react-icons/fi'

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactInfo = [
    {
      icon: FiMail,
      title: 'EMAIL US',
      details: 'hello@founr8.com',
      description: 'Send us an email anytime',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FiPhone,
      title: 'CALL US',
      details: '+1 (555) 123-4567',
      description: 'Mon to Fri, 9am to 6pm',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FiMapPin,
      title: 'VISIT US',
      details: 'Digital Space',
      description: 'Available online worldwide',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-mono">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/20 py-24 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0 animate-float-slow" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #000 1px, transparent 1px), radial-gradient(circle at 75% 75%, #000 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-20 animate-float-medium"></div>
        <div className="absolute top-1/2 right-16 w-5 h-5 bg-purple-400 rounded-full opacity-25 animate-float-slow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-green-400 rounded-full opacity-30 animate-float-fast"></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-cyan-400 rounded-full opacity-20 animate-float-medium"></div>

        {/* Gradient Orbs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-2xl px-6 py-3 mb-8 group hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
                GET IN TOUCH
              </span>
              <FiHeart className="w-4 h-4 text-red-500 animate-pulse" />
            </div>

            {/* Enhanced Main Heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                LET'S CONNECT
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                AND CREATE
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                TOGETHER
              </span>
            </h1>

            {/* Enhanced Subtitle */}
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10">
              Have questions, ideas, or just want to say hello? We'd love to hear from you. 
              Reach out and let's start a conversation that could lead to something amazing.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Contact Section */}
      <div className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Enhanced Contact Information */}
            <div className="lg:col-span-1 space-y-10">
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6">CONTACT INFORMATION</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  Choose the most convenient way to reach out. We're here to help and 
                  always excited to connect with our readers and contributors.
                </p>
              </div>

              {/* Enhanced Contact Methods */}
              <div className="space-y-8">
                {contactInfo.map((item, index) => (
                  <div key={index} className="group relative">
                    {/* Card Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                    
                    {/* Main Card */}
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1 overflow-hidden">
                      {/* Animated Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                      
                      <div className="relative flex items-start space-x-5">
                        <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{item.title}</h3>
                          <p className="text-gray-900 dark:text-white font-semibold mb-2 text-base">{item.details}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Additional Info */}
              <div className="group relative">
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                
                <div className="relative bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/30 hover:shadow-xl transition-all duration-500 group-hover:scale-105 overflow-hidden">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                      <FiClock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">RESPONSE TIME</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 leading-relaxed">
                    We typically respond within 24 hours during business days.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    For urgent matters, please mention "URGENT" in your subject line.
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Contact Form */}
            <div className="lg:col-span-2">
              <div className="group relative">
                {/* Form Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                
                {/* Main Form Container */}
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-10 border border-gray-200/60 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">SEND US A MESSAGE</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          FULL NAME *
                        </label>
                        <div className="relative group">
                          <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-blue-500" />
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl pl-12 pr-6 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 font-mono shadow-sm hover:shadow-md focus:shadow-lg"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          EMAIL ADDRESS *
                        </label>
                        <div className="relative group">
                          <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-blue-500" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl pl-12 pr-6 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 font-mono shadow-sm hover:shadow-md focus:shadow-lg"
                            placeholder="Enter your email address"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-3">
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        SUBJECT *
                      </label>
                      <div className="relative group">
                        <FiMessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-colors duration-300 group-focus-within:text-blue-500" />
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl pl-12 pr-6 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 font-mono shadow-sm hover:shadow-md focus:shadow-lg"
                          placeholder="What is this regarding?"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-3">
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        MESSAGE *
                      </label>
                      <div className="relative group">
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl px-6 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 font-mono shadow-sm hover:shadow-md focus:shadow-lg resize-none"
                          placeholder="Tell us more about your inquiry, project, or how we can help you..."
                        />
                      </div>
                    </div>

                    {/* Enhanced Submit Button */}
                    <button
                      type="submit"
                      className="w-full group relative bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 text-white px-8 py-5 rounded-2xl font-bold text-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <span className="relative z-10 flex items-center justify-center space-x-3">
                        <span className="text-base">SEND MESSAGE</span>
                        <FiSend className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </span>
                    </button>

                    {/* Enhanced Form Note */}
                    <p className="text-gray-500 dark:text-gray-400 text-xs text-center">
                      By submitting this form, you agree to our privacy policy and terms of service.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced FAQ Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">FREQUENTLY ASKED QUESTIONS</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Quick answers to common questions. Can't find what you're looking for? Just ask!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "How long does it take to get a response?",
                answer: "We typically respond within 24 hours during business days. Urgent queries are prioritized."
              },
              {
                question: "Do you accept guest posts?",
                answer: "Yes! We're always looking for quality content. Email us with your pitch and writing samples."
              },
              {
                question: "Can I suggest a topic?",
                answer: "Absolutely! We love hearing what our readers want to learn about. Your suggestions help shape our content."
              },
              {
                question: "Do you offer advertising?",
                answer: "We have limited advertising opportunities. Contact us to discuss potential partnerships."
              }
            ].map((faq, index) => (
              <div key={index} className="group relative">
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                
                {/* Main Card */}
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              Still have questions? We're here to help!
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Contact Support Team
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}