"use client"

import { useEffect } from 'react'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  userRole: 'STUDENT' | 'EDUCATOR' | 'ADMIN'
}

export default function WelcomeModal({ isOpen, onClose, userName, userRole }: WelcomeModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  const getRoleMessage = () => {
    switch (userRole) {
      case 'EDUCATOR':
        return 'Welcome back! Ready to create learning experiences for your students.'
      case 'ADMIN':
        return 'Welcome back! Manage and oversee the platform from here.'
      default:
        return 'Welcome back! Continue your learning journey with AI-powered insights.'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-8 text-center shadow-2xl border border-gray-200">
        <div className="text-4xl mb-4">👋</div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Welcome, {userName}!
        </h2>
        <p className="text-gray-700 text-base mb-6 leading-relaxed">
          {getRoleMessage()}
        </p>
        <button
          onClick={onClose}
          className="btn btn-primary w-full py-3 text-base font-semibold"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}