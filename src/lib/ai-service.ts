import { GoogleGenAI } from '@google/genai'
import { checkRateLimit, createAIInsight, type LearningTask, type ProgressLog } from './db'

// Initialize Gemini AI
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

// AI Service Functions
export class AIService {
  async generateTaskBreakdown(
    task: LearningTask, 
    userId: string
  ): Promise<any> {
    try {
      console.log('🔄 Generating task breakdown for:', task.title)
      
      // Always use fallback for now since API has quota issues
      console.log('Using fallback task breakdown due to API limitations')
      const breakdown = this.getFallbackTaskBreakdown(task)

      // Save AI insight
      try {
        await createAIInsight({
          userId,
          taskId: task.id,
          insightType: 'TASK_BREAKDOWN',
          title: `Task Breakdown: ${task.title}`,
          content: breakdown,
          metadata: {
            model: 'fallback',
            promptVersion: '1.0',
            generatedAt: new Date().toISOString()
          },
          confidenceScore: 0.85
        })
        console.log('✅ AI insight saved successfully')
      } catch (error) {
        console.warn('Failed to save AI insight:', error instanceof Error ? error.message : String(error))
      }

      console.log('✅ Task breakdown generated successfully')
      return breakdown
    } catch (error) {
      console.error('Error in generateTaskBreakdown:', error instanceof Error ? error.message : String(error))
      // Return a basic fallback even if everything fails
      return this.getFallbackTaskBreakdown(task)
    }
  }

  private getFallbackTaskBreakdown(task: LearningTask) {
    const baseTime = task.estimatedTime || 60
    return {
      subtasks: [
        {
          title: "Research and Planning",
          description: `Gather information and create a study plan for: ${task.title}`,
          estimatedTime: Math.max(15, Math.floor(baseTime * 0.25)),
          learningObjectives: ["Understand requirements", "Create timeline", "Identify resources"],
          resources: ["Online articles", "Course materials", "Documentation"],
          successCriteria: "Complete research notes and timeline"
        },
        {
          title: "Core Learning Phase",
          description: `Study the main concepts and theory for: ${task.title}`,
          estimatedTime: Math.max(30, Math.floor(baseTime * 0.5)),
          learningObjectives: ["Master core concepts", "Understand theory", "Take detailed notes"],
          resources: ["Textbooks", "Video tutorials", "Online courses"],
          successCriteria: "Can explain key concepts clearly"
        },
        {
          title: "Practice and Application",
          description: `Apply knowledge through exercises and practice for: ${task.title}`,
          estimatedTime: Math.max(15, Math.floor(baseTime * 0.25)),
          learningObjectives: ["Apply concepts", "Practice skills", "Build confidence"],
          resources: ["Practice exercises", "Projects", "Quizzes"],
          successCriteria: "Complete all practice exercises successfully"
        }
      ],
      totalEstimatedTime: baseTime,
      studyTips: [
        "Take regular breaks every 25-30 minutes",
        "Practice active learning techniques",
        "Review progress regularly",
        "Ask questions when stuck",
        "Connect new knowledge to existing understanding"
      ],
      prerequisites: ["Basic understanding of the topic", "Access to learning materials"]
    }
  }

  async generateProgressSummary(
    userId: string,
    recentTasks: LearningTask[],
    progressLogs: ProgressLog[]
  ): Promise<any> {
    try {
      console.log('🔄 Generating progress summary for user:', userId)
      
      // Prepare progress data
      const progressData = {
        totalTasks: recentTasks.length,
        completedTasks: recentTasks.filter(t => t.status === 'DONE').length,
        inProgressTasks: recentTasks.filter(t => t.status === 'IN_PROGRESS').length,
        averageProgress: progressLogs.reduce((sum, log) => sum + log.progressPercentage, 0) / progressLogs.length || 0,
        totalTimeSpent: progressLogs.reduce((sum, log) => sum + (log.timeSpent || 0), 0),
        recentActivity: progressLogs.slice(0, 5)
      }

      // Always use fallback for now since API has quota issues
      console.log('Using fallback progress summary due to API limitations')
      const summary = this.getFallbackProgressSummary(progressData)

      // Save AI insight
      try {
        await createAIInsight({
          userId,
          insightType: 'PROGRESS_SUMMARY',
          title: 'Weekly Progress Summary',
          content: summary,
          metadata: {
            model: 'fallback',
            promptVersion: '1.0',
            generatedAt: new Date().toISOString(),
            dataPoints: progressLogs.length
          },
          confidenceScore: 0.90
        })
        console.log('✅ Progress summary insight saved successfully')
      } catch (error) {
        console.warn('Failed to save AI insight:', error instanceof Error ? error.message : String(error))
      }

      console.log('✅ Progress summary generated successfully')
      return summary
    } catch (error) {
      console.error('Error in generateProgressSummary:', error instanceof Error ? error.message : String(error))
      // Return a basic fallback even if everything fails
      const basicProgressData = {
        totalTasks: recentTasks?.length || 0,
        completedTasks: recentTasks?.filter(t => t.status === 'DONE').length || 0,
        averageProgress: 0
      }
      return this.getFallbackProgressSummary(basicProgressData)
    }
  }

  private getFallbackProgressSummary(progressData: any) {
    const completionRate = progressData.totalTasks > 0 ? (progressData.completedTasks / progressData.totalTasks) * 100 : 0
    const overallScore = Math.min(95, Math.max(50, Math.round((completionRate + progressData.averageProgress) / 2)))
    
    return {
      overallScore,
      progressTrend: completionRate > 70 ? "improving" : completionRate > 40 ? "stable" : "needs attention",
      strengths: [
        progressData.completedTasks > 0 ? "Task completion" : "Getting started",
        progressData.totalTimeSpent > 0 ? "Time tracking" : "Learning engagement",
        "Consistent effort"
      ],
      areasForImprovement: [
        completionRate < 50 ? "Task completion rate" : "Study efficiency",
        "Time management",
        "Goal setting"
      ],
      recommendations: [
        {
          category: "Study Habits",
          suggestion: completionRate < 50 
            ? "Focus on completing smaller tasks to build momentum" 
            : "Continue with current learning pace and set more challenging goals",
          priority: "high"
        },
        {
          category: "Time Management",
          suggestion: "Use the Pomodoro technique for better focus and productivity",
          priority: "medium"
        }
      ],
      motivationalMessage: overallScore > 75 
        ? "Excellent progress! You're doing great and staying on track." 
        : overallScore > 50 
        ? "Good effort! Keep pushing forward and you'll see great results."
        : "Every expert was once a beginner. Keep learning and improving!",
      nextSteps: [
        "Review completed tasks and celebrate achievements",
        "Set specific goals for the upcoming week",
        "Identify areas that need more focus"
      ]
    }
  }

  async generateStudySuggestions(
    userId: string,
    userRole: string,
    currentTasks: LearningTask[]
  ): Promise<any> {
    try {
      console.log('🔄 Generating study suggestions for user:', userId, 'role:', userRole)
      
      // Always use fallback for now since API has quota issues
      console.log('Using fallback study suggestions due to API limitations')
      const suggestions = this.getFallbackStudySuggestions(userRole, currentTasks)

      // Save AI insight
      try {
        await createAIInsight({
          userId,
          insightType: 'STUDY_SUGGESTION',
          title: 'Personalized Study Suggestions',
          content: suggestions,
          metadata: {
            model: 'fallback',
            promptVersion: '1.0',
            generatedAt: new Date().toISOString()
          },
          confidenceScore: 0.80
        })
        console.log('✅ Study suggestions insight saved successfully')
      } catch (error) {
        console.warn('Failed to save AI insight:', error instanceof Error ? error.message : String(error))
      }

      console.log('✅ Study suggestions generated successfully')
      return suggestions
    } catch (error) {
      console.error('Error in generateStudySuggestions:', error instanceof Error ? error.message : String(error))
      // Return a basic fallback even if everything fails
      return this.getFallbackStudySuggestions(userRole || 'STUDENT', currentTasks || [])
    }
  }

  private getFallbackStudySuggestions(userRole: string, currentTasks: LearningTask[]) {
    const activeTasks = currentTasks.filter(t => t.status !== 'DONE').length
    const hasAdvancedTasks = currentTasks.some(t => t.difficultyLevel === 'ADVANCED')
    
    return {
      studySchedule: {
        recommendedDailyHours: activeTasks > 5 ? 3 : activeTasks > 2 ? 2 : 1.5,
        bestStudyTimes: userRole === 'STUDENT' ? ["morning", "afternoon"] : ["evening", "weekend"],
        breakIntervals: hasAdvancedTasks ? 30 : 25
      },
      techniques: [
        {
          name: "Active Learning",
          description: "Engage with material through practice, discussion, and application",
          bestFor: "Skill development and deep understanding"
        },
        {
          name: "Spaced Repetition",
          description: "Review material at increasing intervals to improve retention",
          bestFor: "Memory retention and long-term learning"
        },
        {
          name: "Pomodoro Technique",
          description: "Work in focused 25-minute intervals with 5-minute breaks",
          bestFor: "Time management and maintaining focus"
        },
        ...(hasAdvancedTasks ? [{
          name: "Feynman Technique",
          description: "Explain concepts in simple terms as if teaching someone else",
          bestFor: "Complex topics and deep understanding"
        }] : [])
      ],
      resources: [
        {
          type: "article",
          title: "Effective Study Techniques for Better Learning",
          url: "",
          relevance: "Provides evidence-based study methods"
        },
        {
          type: "video",
          title: "Learning How to Learn - Coursera Course",
          url: "",
          relevance: "Understanding how your brain learns and retains information"
        },
        {
          type: "book",
          title: "Make It Stick: The Science of Successful Learning",
          url: "",
          relevance: "Research-backed strategies for effective learning"
        }
      ],
      timeManagementTips: [
        "Use the Pomodoro Technique for focused study sessions",
        "Set specific, measurable learning goals for each session",
        "Track your progress regularly to stay motivated",
        "Take regular breaks to maintain focus and prevent burnout",
        "Create a dedicated, distraction-free study environment",
        "Plan your most challenging tasks for when you have the most energy",
        "Use a calendar to schedule study sessions and stick to them"
      ]
    }
  }
}

export const aiService = new AIService()