# AI-Assisted Learning Task & Progress Manager

A comprehensive EdTech platform that combines task management with AI-powered insights to enhance learning experiences for students and educators.

## 🎯 Project Overview

This platform enables educators to create and manage learning tasks while providing students with AI-powered insights, progress tracking, and personalized study recommendations. Built with modern web technologies and integrated with Google's Gemini AI for intelligent features.

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (MySQL)       │
│   - Dashboard   │    │   - Auth        │    │   - Users       │
│   - Task Mgmt   │    │   - Tasks       │    │   - Tasks       │
│   - AI Features │    │   - AI Service  │    │   - Progress    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   AI Service    │
                    │   (Gemini API)  │
                    │   - Breakdown   │
                    │   - Summaries   │
                    │   - Suggestions │
                    └─────────────────┘
```

### Data Flow
1. **Authentication**: JWT-based auth with HTTP-only cookies
2. **Task Management**: CRUD operations with role-based access
3. **Progress Tracking**: Real-time updates with audit trails
4. **AI Integration**: Rate-limited API calls with structured prompts
5. **Insights Storage**: Persistent AI-generated content with metadata

## 🛠️ Tech Stack

### Core Technologies
- **Frontend**: Next.js 16 (App Router), TypeScript, React Server/Client Components
- **Styling**: Tailwind CSS with custom utility classes
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MySQL with mysql2 driver (direct connection, no ORM)
- **Authentication**: Custom JWT implementation with bcryptjs
- **AI Integration**: Google Gemini API via @google/generative-ai

### Key Libraries
- **Validation**: Zod for schema validation
- **Security**: bcryptjs, rate limiting, input sanitization
- **UI Components**: Custom components with Tailwind CSS
- **Date Handling**: Native JavaScript Date API

## 🤖 AI Features Implementation

### 1. Task Breakdown Generator
**Endpoint**: `POST /api/ai/task-breakdown`
**Purpose**: Converts high-level tasks into structured subtasks

**Features**:
- Intelligent task decomposition
- Time estimation for subtasks
- Learning objective mapping
- Resource recommendations
- Success criteria definition

### 2. Weekly Progress Summary
**Endpoint**: `POST /api/ai/progress-summary`
**Purpose**: Analyzes learning patterns and provides constructive feedback

**Data Analysis**:
- Task completion rates
- Time spent vs. estimated
- Progress trends over time
- Learning pattern identification

**Output**:
- Overall progress score
- Strengths and improvement areas
- Personalized recommendations
- Motivational feedback
- Next steps guidance

## 🔒 Security Implementation

### Authentication & Authorization
- JWT-based authentication with HTTP-only cookies
- Role-based access control (Student/Educator/Admin)
- Secure password hashing with bcryptjs
- Protected routes with middleware

### Input Validation & Security
- Zod schemas for all API endpoints
- Parameterized queries with mysql2
- Rate limiting on AI endpoints
- Input sanitization and XSS prevention

## 📊 Database Schema

### Core Entities

#### Users
- Authentication and profile management
- Role-based access control
- Audit fields with soft deletes

#### Learning Tasks
- Comprehensive task management
- Priority and difficulty levels
- Hierarchical task structure
- Progress tracking integration

#### Progress Logs
- Detailed progress tracking
- Time spent monitoring
- Evidence collection
- Historical analysis

#### AI Insights
- Structured AI-generated content
- Metadata and confidence scores
- Type-based categorization
- User-specific insights

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ server running
- Google Gemini API key

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd ai-learning-platform
npm install
```

2. **Database setup**:
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE ai_learning_platform;"

# Run schema
mysql -u root -p < database/create-tables.sql
```

3. **Environment configuration**:
```bash
cp .env.example .env
```

Update `.env` with your credentials:
```env
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="your-mysql-password"
DB_NAME="ai_learning_platform"
JWT_SECRET="your-super-secret-jwt-key"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
```

4. **Start development server**:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### First Steps
1. Register as an Educator to create tasks
2. Register as a Student to receive task assignments
3. Use AI features to generate task breakdowns
4. Track progress and generate AI summaries

## 📱 Features & Usage

### For Educators
- **Task Creation**: Create detailed learning tasks with priorities, due dates, and difficulty levels
- **Student Management**: Assign tasks to students and monitor their progress
- **AI Insights**: Generate intelligent task breakdowns and analyze student performance
- **Progress Monitoring**: View real-time progress updates and completion statistics

### For Students
- **Task Dashboard**: View assigned tasks with clear priorities and deadlines
- **Progress Tracking**: Update task progress with notes and evidence
- **AI Assistance**: Get personalized study suggestions and task breakdowns
- **Performance Analytics**: Receive AI-generated progress summaries and recommendations

### AI-Powered Features
1. **Task Breakdown Generator**
   - Input: High-level learning task
   - Output: Structured subtasks with time estimates and resources

2. **Progress Summary Generator**
   - Input: Historical progress data
   - Output: Comprehensive analysis with recommendations

3. **Smart Study Suggestions**
   - Input: User profile and current tasks
   - Output: Personalized learning strategies

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Task Management
- `GET /api/tasks` - Fetch user tasks (with filtering)
- `POST /api/tasks` - Create new task (educators only)
- `POST /api/tasks/[id]/progress` - Update task progress
- `GET /api/tasks/[id]/progress` - Get progress history

### AI Features
- `POST /api/ai/task-breakdown` - Generate task breakdown
- `POST /api/ai/progress-summary` - Generate progress summary
- `POST /api/ai/study-suggestions` - Get study recommendations

## 🎨 UI/UX Features

### Design System
- **Clean, Modern Interface**: Tailwind CSS with custom utility classes
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and fallbacks

### Component Architecture
- **Reusable Components**: TaskCard, CreateTaskModal, SignOutButton
- **Server Components**: Optimized for performance where possible
- **Client Components**: Interactive features with state management
- **Form Validation**: Real-time validation with Zod schemas

## ⚡ Performance & Optimization

### Frontend Optimization
- **Server Components**: Reduced client-side JavaScript
- **Code Splitting**: Dynamic imports for large components
- **CSS Optimization**: Tailwind CSS with purging unused styles

### Backend Optimization
- **Database Indexing**: Strategic indexes for query performance
- **Connection Pooling**: Efficient MySQL connection management
- **Rate Limiting**: AI endpoint protection with user-based limits

### AI Integration Optimization
- **Prompt Engineering**: Optimized prompts for consistent responses
- **Response Caching**: Store AI insights to reduce API calls
- **Error Handling**: Graceful fallbacks for AI service failures

## 🛡️ Security Considerations

### Data Protection
- **Password Security**: bcryptjs with salt rounds of 12
- **JWT Security**: HTTP-only cookies with secure flags
- **Input Validation**: Comprehensive Zod schema validation
- **SQL Injection Prevention**: Parameterized queries only

### API Security
- **Rate Limiting**: Per-user limits on AI endpoints
- **CORS Configuration**: Restricted cross-origin requests
- **Environment Variables**: Secure credential management
- **Error Handling**: No sensitive data in error responses

## 📈 Scalability Considerations

### Database Scalability
- **Indexing Strategy**: Optimized for common query patterns
- **Soft Deletes**: Data retention with archived_at timestamps
- **Pagination**: Efficient data loading with offset/limit
- **Connection Pooling**: Configurable pool size for load handling

### Application Scalability
- **Stateless Design**: JWT-based authentication for horizontal scaling
- **API Design**: RESTful endpoints with consistent patterns
- **Caching Strategy**: Ready for Redis integration
- **Monitoring**: Structured logging for performance analysis

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables (Production)
```env
DB_HOST="your-production-db-host"
DB_USER="your-production-db-user"
DB_PASSWORD="your-production-db-password"
DB_NAME="ai_learning_platform"
JWT_SECRET="your-production-jwt-secret"
GOOGLE_GENERATIVE_AI_API_KEY="your-production-gemini-key"
NODE_ENV="production"
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Farhan Usman Shaikh**
- GitHub: [@FarhanUsmanShaikh](https://github.com/FarhanUsmanShaikh)
- LinkedIn: [Farhan Usman Shaikh](https://linkedin.com/in/farhan-usman-shaikh)

---

Built with ❤️ using Next.js, TypeScript, MySQL, and Google Gemini AI