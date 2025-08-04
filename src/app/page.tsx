'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'
import AIChatbot from '@/components/AIChatbot'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-blue-400/20 w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-4 lg:px-12">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🧠</span>
          </div>
          <span className="text-xl lg:text-2xl font-bold glow-text">MindBridge</span>
          <span className="text-xs lg:text-sm text-blue-300 bg-blue-900/30 px-2 py-1 rounded-full">Nigeria</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/about" className="hover:text-blue-300 transition-colors">About</Link>
          <Link href="/therapists" className="hover:text-blue-300 transition-colors">Find Therapists</Link>
          <Link href="/support" className="hover:text-blue-300 transition-colors">Support Groups</Link>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
          <div className="flex flex-col space-y-4 p-6">
            <Link
              href="/about"
              className="hover:text-blue-300 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/therapists"
              className="hover:text-blue-300 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Therapists
            </Link>
            <Link
              href="/support"
              className="hover:text-blue-300 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Support Groups
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 pt-8 lg:pt-20 pb-16 lg:pb-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 lg:mb-8 leading-tight">
            <span className="glow-text">Mental Health</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Made Accessible
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 lg:mb-12 max-w-3xl mx-auto px-4">
            Connect with licensed therapists across Nigeria. Get the support you need,
            when you need it, wherever you are.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl text-base lg:text-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto glass-effect text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl text-base lg:text-lg font-semibold transition-all hover:bg-white/20 text-center"
            >
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-16 lg:mt-24 px-4">
          {[
            {
              icon: "📍",
              title: "Local Matching",
              description: "Find therapists in your Nigerian state or city"
            },
            {
              icon: "📹",
              title: "Video Sessions",
              description: "Secure, HD video calls with end-to-end encryption"
            },
            {
              icon: "💬",
              title: "24/7 Chat Support",
              description: "AI-powered initial screening and crisis support"
            },
            {
              icon: "👥",
              title: "Support Groups",
              description: "Anonymous group sessions and peer support"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="glass-effect p-4 lg:p-6 rounded-xl hover:bg-white/20 transition-all cursor-pointer"
            >
              <div className="text-3xl lg:text-4xl mb-3 lg:mb-4">{feature.icon}</div>
              <h3 className="text-lg lg:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm lg:text-base">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 mt-16 lg:mt-24 px-4">
          {[
            { number: "500+", label: "Licensed Therapists" },
            { number: "10,000+", label: "Lives Touched" },
            { number: "36", label: "States Covered" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-400 mb-2 glow-text">
                {stat.number}
              </div>
              <div className="text-base lg:text-lg text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-3">
        {/* Emergency Contact */}
        <Link
          href="/emergency"
          className="bg-red-600 hover:bg-red-700 text-white p-3 lg:p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 animate-pulse"
          aria-label="Emergency Support"
        >
          <Phone size={20} className="lg:w-6 lg:h-6" />
        </Link>
      </div>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  )
}
