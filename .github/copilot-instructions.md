<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Gazra Mitra - Community Support Chatbot

## Project Overview
This is a Progressive Web Application (PWA) chatbot system designed to connect LGBTQAI+ community members and women with essential services including healthcare, employment, mental health support, and community resources.

## Tech Stack
- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Realtime Database, Cloud Messaging)
- **PWA**: Vite PWA Plugin with service worker
- **UI Components**: Headless UI, Heroicons
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Notifications**: React Hot Toast

## Key Features
- Multilingual support (English, Gujarati, Hindi, Marathi)
- Mobile-first responsive design (max-width: 428px)
- Real-time messaging and chat system
- Service discovery and booking system
- PWA capabilities (offline support, push notifications)
- LGBTQAI+ friendly service filtering

## Development Guidelines

### Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript patterns where beneficial
- Follow mobile-first responsive design principles
- Maintain accessibility standards (WCAG 2.1)

### Component Structure
- Place shared components in `src/components/`
- Use context providers for global state
- Implement proper loading and error states
- Follow the established folder structure

### Firebase Integration
- All Firebase config is in `src/services/firebase.js`
- Use proper authentication flows
- Implement real-time listeners correctly
- Handle offline scenarios gracefully

### PWA Requirements
- Maintain service worker functionality
- Ensure offline capabilities
- Support push notifications
- Follow PWA best practices for performance

### Styling
- Use Tailwind CSS utility classes
- Follow the established color scheme (primary: #6366f1, secondary: #ec4899)
- Maintain mobile-first breakpoints
- Use CSS custom properties for theme colors

### Internationalization
- All text must use the translation system
- Support RTL languages if needed
- Maintain cultural sensitivity in content

## Current Status
✅ Project scaffolded and configured
✅ Core components implemented
✅ Authentication system set up
✅ Basic chat interface created
✅ Service discovery components built
✅ PWA configuration completed
✅ Development server running

## Next Steps
- Configure Firebase project with actual credentials
- Implement real-time messaging backend
- Add booking system functionality
- Implement push notifications
- Add offline data caching
- Create proper app icons (replace placeholders)
- Set up deployment pipeline