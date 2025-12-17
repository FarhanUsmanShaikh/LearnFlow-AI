'use client';

import Link from "next/link";
import { useState } from "react";

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      title: "Welcome to AI Learning Platform",
      description: "Experience how our AI-powered platform transforms your learning journey",
      action: "Start Demo",
      content: (
        <div className="text-center animate-fade-in">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl hover-lift">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed">Click "Start Demo" to begin your interactive tour</p>
        </div>
      )
    },
    {
      title: "Create Learning Tasks",
      description: "See how easy it is to create and organize your learning goals",
      action: "Create Task",
      content: (
        <div className="card hover-lift animate-fade-in max-w-lg mx-auto">
          <div className="card-body">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Learning Task
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Learn React Hooks"
                  readOnly
                />
              </div>
              <div>
                <label className="form-label">Difficulty</label>
                <select className="form-input" disabled>
                  <option>Intermediate</option>
                </select>
              </div>
              <div>
                <label className="form-label">Priority</label>
                <select className="form-input" disabled>
                  <option>High</option>
                </select>
              </div>
              <div className="pt-4">
                <button className="btn btn-primary w-full" disabled>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI Task Breakdown",
      description: "Watch our AI break down complex tasks into manageable steps",
      action: "Generate Breakdown",
      content: (
        <div className="card hover-lift animate-fade-in max-w-2xl mx-auto">
          <div className="card-body">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              AI-Generated Learning Steps
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100 hover-lift transition-all duration-200">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">1</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Understand React Hooks Basics</p>
                  <p className="text-gray-600">Learn useState and useEffect fundamentals</p>
                  <div className="mt-2">
                    <span className="badge badge-primary">Beginner</span>
                    <span className="badge badge-secondary ml-2">2-3 hours</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100 hover-lift transition-all duration-200">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">2</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Practice with Simple Examples</p>
                  <p className="text-gray-600">Build counter and toggle components</p>
                  <div className="mt-2">
                    <span className="badge badge-warning">Intermediate</span>
                    <span className="badge badge-secondary ml-2">4-5 hours</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-100 hover-lift transition-all duration-200">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">3</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Advanced Hooks Exploration</p>
                  <p className="text-gray-600">Explore useContext, useReducer, and custom hooks</p>
                  <div className="mt-2">
                    <span className="badge badge-danger">Advanced</span>
                    <span className="badge badge-secondary ml-2">6-8 hours</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800">
                  <strong>AI Insight:</strong> This breakdown is optimized for your intermediate skill level. Total estimated time: 12-16 hours over 2-3 weeks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Progress Tracking",
      description: "Monitor your learning progress with AI-powered insights",
      action: "View Progress",
      content: (
        <div className="card hover-lift animate-fade-in max-w-2xl mx-auto">
          <div className="card-body">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Learning Progress Dashboard
            </h3>
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="font-semibold text-gray-900">React Hooks Mastery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-800">75%</span>
                    <span className="badge badge-primary">In Progress</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-blue-600" style={{ width: '75%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">12 of 16 lessons completed</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="font-semibold text-gray-900">JavaScript ES6+</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-800">90%</span>
                    <span className="badge badge-success">Almost Done</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-green-600" style={{ width: '90%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">18 of 20 lessons completed</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-100 rounded-xl border border-yellow-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                    <span className="font-semibold text-gray-900">Node.js Basics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-yellow-800">45%</span>
                    <span className="badge badge-warning">Getting Started</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-yellow-600" style={{ width: '45%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">9 of 20 lessons completed</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-purple-900 mb-1">AI Recommendation</p>
                  <p className="text-sm text-purple-800">
                    You're making excellent progress! Consider focusing on Node.js to balance your full-stack skills. 
                    Based on your learning pattern, you could complete it in 2 weeks with 1 hour daily practice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Start Learning?",
      description: "Join thousands of learners already using our AI-powered platform",
      action: "Get Started",
      content: (
        <div className="text-center animate-fade-in">
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl hover-lift">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-xl text-gray-600 mb-4 leading-relaxed">
              🎉 Congratulations! You've experienced how our AI-powered platform can transform your learning journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600">Active Learners</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">AI Support</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signin" className="btn btn-primary btn-lg hover-lift hover-glow">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Learning Now
            </Link>
            <Link href="/" className="btn btn-secondary btn-lg hover-lift">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startAutoPlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= demoSteps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="relative z-10 bg-white/90 backdrop-blur-lg border-b border-white/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3 hover-lift transition-all duration-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Learning Platform
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  🎮 Interactive Demo
                </span>
              </div>
              <Link href="/" className="btn btn-secondary hover-lift">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Demo Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="card">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">Demo Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Step {currentStep + 1} of {demoSteps.length}</span>
                  <span className="badge badge-primary">{Math.round(((currentStep + 1) / demoSteps.length) * 100)}%</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500" 
                  style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Step */}
        <div className="text-center mb-6">
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {demoSteps[currentStep].title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {demoSteps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8 h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="w-full max-h-full overflow-y-auto">
            {demoSteps[currentStep].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="btn btn-secondary hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {currentStep === 0 && !isPlaying && (
                <button 
                  onClick={startAutoPlay}
                  className="btn btn-success hover-lift hover-glow"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Auto Play Demo
                </button>
              )}

              {isPlaying && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Auto-playing...</span>
                </div>
              )}

              {currentStep < demoSteps.length - 1 ? (
                <button 
                  onClick={nextStep}
                  className="btn btn-primary hover-lift hover-glow"
                >
                  {demoSteps[currentStep].action}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <Link href="/auth/signin" className="btn btn-primary btn-lg hover-lift hover-glow">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get Started Now
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
            {demoSteps.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`group relative transition-all duration-200 ${
                  index === currentStep 
                    ? 'w-4 h-4' 
                    : 'w-3 h-3 hover:w-4 hover:h-4'
                }`}
                title={step.title}
              >
                <div className={`w-full h-full rounded-full transition-all duration-200 ${
                  index === currentStep 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' 
                    : index < currentStep 
                      ? 'bg-blue-400 hover:bg-blue-500' 
                      : 'bg-gray-300 hover:bg-gray-400'
                }`}></div>
                {index === currentStep && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {step.title}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}