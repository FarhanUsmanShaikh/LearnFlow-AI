import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample users
  const educator = await prisma.user.upsert({
    where: { email: 'educator@example.com' },
    update: {},
    create: {
      email: 'educator@example.com',
      name: 'Dr. Sarah Johnson',
      role: 'EDUCATOR',
    },
  })

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      email: 'student1@example.com',
      name: 'Alex Chen',
      role: 'STUDENT',
    },
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      email: 'student2@example.com',
      name: 'Maria Rodriguez',
      role: 'STUDENT',
    },
  })

  console.log('✅ Users created')

  // Create sample learning tasks
  const task1 = await prisma.learningTask.create({
    data: {
      title: 'Learn React Fundamentals',
      description: 'Master the basics of React including components, props, state, and hooks',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      estimatedTime: 480, // 8 hours
      tags: ['react', 'javascript', 'frontend'],
      creatorId: educator.id,
      assigneeId: student1.id,
    },
  })

  const task2 = await prisma.learningTask.create({
    data: {
      title: 'Database Design Principles',
      description: 'Learn about normalization, relationships, and best practices in database design',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      estimatedTime: 360, // 6 hours
      tags: ['database', 'sql', 'design'],
      creatorId: educator.id,
      assigneeId: student2.id,
    },
  })

  const task3 = await prisma.learningTask.create({
    data: {
      title: 'API Development with Node.js',
      description: 'Build RESTful APIs using Node.js and Express',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      estimatedTime: 600, // 10 hours
      tags: ['nodejs', 'api', 'backend'],
      creatorId: educator.id,
      assigneeId: student1.id,
    },
  })

  console.log('✅ Learning tasks created')

  // Create sample progress logs
  await prisma.progressLog.create({
    data: {
      taskId: task2.id,
      userId: student2.id,
      progress: 60,
      notes: 'Completed the normalization section. Working on relationships now.',
      timeSpent: 180, // 3 hours
    },
  })

  await prisma.progressLog.create({
    data: {
      taskId: task2.id,
      userId: student2.id,
      progress: 40,
      notes: 'Started with basic database concepts. Need to review ER diagrams.',
      timeSpent: 120, // 2 hours
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  })

  console.log('✅ Progress logs created')

  // Create sample AI insights
  await prisma.aIInsight.create({
    data: {
      userId: student1.id,
      type: 'PROGRESS_SUMMARY',
      content: {
        overallScore: 75,
        strengths: ['Consistent study schedule', 'Good understanding of concepts'],
        areasForImprovement: ['Time management', 'Practical application'],
        recommendations: [
          'Practice more coding exercises',
          'Join study groups for collaborative learning',
        ],
        motivationalMessage: 'Great progress! Keep up the consistent effort.',
        nextSteps: ['Complete React hooks tutorial', 'Build a small project'],
      },
      metadata: {
        model: 'gpt-4-turbo',
        tokensUsed: 450,
        generatedAt: new Date().toISOString(),
      },
    },
  })

  console.log('✅ AI insights created')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })