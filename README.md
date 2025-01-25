# GrokDoc - Your AI Doctor

GrokDoc is an innovative AI-powered healthcare assistant built with Next.js. It leverages advanced language models to provide intelligent symptom analysis, personalized treatment recommendations, and ongoing health insights.

## Quick Start
1. Run `npm install` to install dependencies
2. Create `.env.local` and add your OpenAI API key:   ```
   OPENAI_API_KEY=your_key_here   ```
3. Run `npm run dev` to start development server at http://localhost:3005

## Core Features
- **Symptom Checker**: AI-powered symptom analysis and initial diagnosis
- **Treatment Plans**: Personalized treatment recommendations
- **Health Insights**: Ongoing health monitoring and early warnings

## Project Structure
- **components/**: UI components organized by feature
  - common/: Shared layout components
  - symptomChecker/: Symptom analysis UI
  - treatmentPlans/: Treatment plan components
  - healthInsights/: Health monitoring dashboard
- **pages/**: Application routes and API endpoints
- **public/**: Static assets
- **styles/**: Global styling

## Tech Stack
- Next.js 13+
- React 19
- Tailwind CSS
- OpenAI API
