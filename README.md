# GrokDoc - Your AI Doctor

GrokDoc is an AI-powered healthcare assistant that combines conversational intelligence with personalized treatment planning. Built with Next.js and powered by Grok-2.

## Quick Start
1. `npm install`
2. Create `.env.local`:
   ```
   OPENAI_API_KEY=your_key_here
   XAI_API_KEY=your_key_here
   ```
3. Run `npm run dev` (runs on http://localhost:3006)

## Core Features

### 1. Intelligent Symptom Analysis
- Natural conversation with medical context awareness
- Structured triage questions while maintaining free-form chat
- Support for medical document analysis:
  - Image uploads (symptoms, conditions)
  - Lab results
  - Medical records
- Powered by Grok-2 for medical reasoning

### 2. Dynamic Treatment Planning
- Generates personalized 7-day treatment plans
- Interactive task tracking with progress bar
- In-plan chat functionality for updates and questions
- Adapts recommendations based on user feedback

### 3. Urgent Care Locator
- Automatic detection of urgent symptoms
- Real-time location-based facility finder
- Interactive map view of nearby urgent care centers
- Facility details including:
  - Distance
  - Wait times
  - Contact information
  - Directions

## Project Structure
- **components/**: UI components organized by feature
  - common/: Shared layout components
  - symptomChecker/: Symptom analysis UI
  - treatmentPlans/: Treatment plan components
  - healthInsights/: Health monitoring dashboard
  - locationFinder/: Urgent care facility locator
- **pages/**: Application routes and API endpoints
- **public/**: Static assets
- **styles/**: Global styling

## Tech Stack
- Next.js
- React
- X.AI API (Grok-2)
- OpenAI API (Reasoning)
- Maps Integration (Facility Location)
