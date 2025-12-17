'use client'

import { useEffect, useState } from 'react'

interface LoaderProps {
  onComplete: () => void
}

export default function Loader({ onComplete }: LoaderProps) {
  const [currentWord, setCurrentWord] = useState(0)
  const words = ['Welcome', 'to', 'LearnFlow']

  useEffect(() => {
    const wordTimers = [
      setTimeout(() => setCurrentWord(1), 500),   // Show "to"
      setTimeout(() => setCurrentWord(2), 1000),  // Show "LearnFlow"
    ]

    const completeTimer = setTimeout(onComplete, 3000)

    return () => {
      wordTimers.forEach(clearTimeout)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-3 text-4xl font-bold">
            {words.map((word, index) => (
              <span
                key={index}
                className={`transition-all duration-700 ${
                  index <= currentWord 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                } ${
                  word === 'LearnFlow' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                    : 'text-gray-800'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
        
        <div className={`transition-all duration-500 ${currentWord >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading your experience...</p>
        </div>
      </div>
    </div>
  )
}