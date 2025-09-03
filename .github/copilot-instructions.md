# Copilot Instructions for FraudSentry

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is FraudSentry, an AI-powered real-time fraud detection system built with Next.js, TypeScript, and Firebase. The system uses an agentic architecture where AI agents investigate transactions using specialized tools.

## Key Technologies
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with Shadcn/UI components
- **AI/ML**: Google Genkit with Gemini models for agent-based fraud investigation
- **Database**: Firebase Firestore for transaction data
- **Visualization**: ReactFlow for network diagrams, Recharts for analytics
- **Authentication**: Role-based access (Admin, Analyst)

## Architecture Patterns
- **Agentic AI**: Use `ai.definePrompt` with tools for dynamic investigation
- **Server Actions**: All AI flows are server-side for security
- **Component Structure**: Modular React components with proper TypeScript typing
- **Real-time Updates**: Firebase listeners for live transaction monitoring

## Code Style Guidelines
- Use functional components with hooks
- Implement proper error handling and loading states
- Follow accessibility best practices
- Use semantic HTML and ARIA labels
- Implement responsive design patterns
- Use proper TypeScript interfaces and types

## Firebase Integration
- Use Firestore for storing transactions, users, and merchants
- Implement real-time listeners with `onSnapshot`
- Handle timestamp conversion properly between Firestore and JavaScript

## AI Agent Development
- Tools should be pure functions that return structured data
- Agent prompts should be goal-oriented and specific
- Always handle AI response validation and error cases
- Use proper schema validation with Zod

## UI/UX Patterns
- Use consistent color coding for risk levels (green=safe, yellow=suspicious, red=fraud)
- Implement proper loading skeletons
- Use toast notifications for user feedback
- Follow Shadcn/UI component patterns
- Implement proper form validation

## Security Considerations
- Never expose API keys on client-side
- Use server actions for all AI operations
- Implement proper input validation
- Use role-based access control
