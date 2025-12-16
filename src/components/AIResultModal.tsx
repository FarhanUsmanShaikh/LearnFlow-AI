"use client"

interface AIResultModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: any
  type: 'task-breakdown' | 'progress-summary' | 'general'
}

export default function AIResultModal({ isOpen, onClose, title, content, type }: AIResultModalProps) {

  if (!isOpen) return null

  const getModalIcon = () => {
    switch (type) {
      case 'task-breakdown':
        return {
          icon: '🧠',
          gradient: 'from-purple-600 to-indigo-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-800'
        }
      case 'progress-summary':
        return {
          icon: '📊',
          gradient: 'from-green-600 to-blue-600',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800'
        }
      default:
        return {
          icon: '🤖',
          gradient: 'from-blue-600 to-purple-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800'
        }
    }
  }

  const modalStyle = getModalIcon()

  const renderContent = () => {
    if (typeof content === 'string') {
      return <p className="text-gray-900 leading-relaxed whitespace-pre-wrap font-medium">{content}</p>
    }

    if (content && typeof content === 'object') {
      // Handle task breakdown structure
      if (content.subtasks && Array.isArray(content.subtasks)) {
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-lg flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Learning Breakdown:
              </h4>
              {content.subtasks.map((subtask: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-900 mb-2 text-base">{subtask.title}</h5>
                      <p className="text-sm text-gray-800 mb-3 font-medium">{subtask.description}</p>
                      
                      {subtask.estimatedTime && (
                        <div className="flex items-center text-xs text-indigo-600 mb-2">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {subtask.estimatedTime} minutes
                        </div>
                      )}
                      
                      {subtask.learningObjectives && subtask.learningObjectives.length > 0 && (
                        <div className="mb-2">
                          <h6 className="text-sm font-bold text-gray-900 mb-1">Learning Objectives:</h6>
                          <ul className="text-sm text-gray-800 space-y-1">
                            {subtask.learningObjectives.map((obj: string, objIndex: number) => (
                              <li key={objIndex} className="flex items-start">
                                <span className="mr-2 text-gray-900">•</span>
                                <span className="font-medium">{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {subtask.successCriteria && (
                        <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                          ✓ {subtask.successCriteria}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {content.studyTips && content.studyTips.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-bold text-gray-900 text-lg mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Study Tips:
                </h5>
                <ul className="text-base text-gray-800 space-y-2">
                  {content.studyTips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-3 text-yellow-600 font-bold">•</span>
                      <span className="font-medium">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {content.totalEstimatedTime && (
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-base text-gray-900 font-bold">
                  Total Estimated Time: {content.totalEstimatedTime} minutes
                </div>
              </div>
            )}
          </div>
        )
      }
      
      // Handle progress summary structure
      if (content.overallScore !== undefined) {
        return (
          <div className="space-y-6">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
              <div className="text-4xl font-bold text-gray-900 mb-1">{content.overallScore}%</div>
              <div className="text-base font-semibold text-gray-800">Overall Progress Score</div>
            </div>
            
            {content.strengths && content.strengths.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-bold text-gray-900 text-lg mb-3 flex items-center">
                  <span className="mr-2">💪</span>
                  Your Strengths:
                </h5>
                <ul className="text-base text-gray-800 space-y-2">
                  {content.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-3 text-green-600 font-bold">✓</span>
                      <span className="font-medium">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {content.areasForImprovement && content.areasForImprovement.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h5 className="font-bold text-gray-900 text-lg mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  Areas for Improvement:
                </h5>
                <ul className="text-base text-gray-800 space-y-2">
                  {content.areasForImprovement.map((area: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-3 text-orange-600 font-bold">•</span>
                      <span className="flex-1 font-medium">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {content.motivationalMessage && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <p className="text-gray-900 font-bold text-base">{content.motivationalMessage}</p>
              </div>
            )}
            
            {content.nextSteps && content.nextSteps.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-bold text-gray-900 text-lg mb-3 flex items-center">
                  <span className="mr-2">🚀</span>
                  Next Steps:
                </h5>
                <ul className="text-base text-gray-800 space-y-2">
                  {content.nextSteps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-3 font-bold text-blue-600">{index + 1}.</span>
                      <span className="font-medium">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      }
      
      // Handle structured content for other types (legacy support)
      if (content.steps && Array.isArray(content.steps)) {
        return (
          <div className="space-y-4">
            {content.description && (
              <p className="text-gray-700 leading-relaxed mb-4">{content.description}</p>
            )}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Learning Steps:
              </h4>
              {content.steps.map((step: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{step.title || step.name || `Step ${index + 1}`}</h5>
                    <p className="text-sm text-gray-600">{step.description || step.content || step}</p>
                    {step.estimatedTime && (
                      <p className="text-xs text-indigo-600 mt-1">⏱️ {step.estimatedTime}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {content.tips && content.tips.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2">💡 Pro Tips:</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {content.tips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      }

      // Handle other structured content
      return (
        <div className="space-y-3">
          {Object.entries(content).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</h5>
              <p className="text-sm text-gray-600">{String(value)}</p>
            </div>
          ))}
        </div>
      )
    }

    return <p className="text-gray-500 italic">No content available</p>
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-slide-up flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-6 text-white ai-modal-header" style={{ backgroundColor: '#111827' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{modalStyle.icon}</div>
              <div>
                <h2 className="text-xl font-bold text-white drop-shadow-lg">{title}</h2>
                <p className="text-sm text-gray-200 font-medium">AI-Generated Insights</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-gray-200 hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 overflow-y-auto ai-modal-content" style={{ maxHeight: 'calc(85vh - 200px)' }}>
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Generated by AI</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2))
                // You could add a toast notification here
              }}
              className="btn btn-secondary hover-lift text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            <button
              onClick={onClose}
              className="btn btn-primary hover-lift"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}