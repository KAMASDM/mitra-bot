# Gazra Mitra - Community Support Chatbot

A Progressive Web Application (PWA) designed to connect LGBTQAI+ community members and women with essential services including healthcare, employment, mental health support, and community resources.

## Features

- **Multilingual Support**: English, Gujarati, Hindi, and Marathi
- **Progressive Web App**: Installable, offline support, push notifications
- **Real-time Messaging**: Connect with healthcare providers and community members
- **Service Discovery**: Find doctors, counselors, job opportunities, and more
- **LGBTQAI+ Friendly**: Specialized support for community needs
- **Mobile-First Design**: Optimized for mobile devices
- **Real-time Weather**: Location-based weather updates with dynamic UI themes

## Services Supported

1. **Employment/Job Search** - Connect with placement agencies and job opportunities
2. **General Doctors** - For consultations and routine healthcare
3. **Surgical Specialists** - For surgery-related needs
4. **Mental Health Counselors** - For emotional and psychological support
5. **Clinical Psychologists** - For therapy and mental health treatment
6. **Placement Agencies** - For employment services
7. **Pathology Labs** - For diagnostic tests
8. **Pharmacies** - For discounted medications

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Realtime Database, Cloud Messaging)
- **PWA**: Vite PWA Plugin
- **UI Components**: Headless UI, Heroicons
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Realtime Database enabled

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Realtime Database
   - Enable Cloud Messaging
   - Copy your Firebase config to `src/services/firebase.js`

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 to view the app

### Building for Production

```bash
npm run build
```

## Firebase Configuration

Update `src/services/firebase.js` with your Firebase project configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## PWA Features

- Installable on mobile devices and desktop
- Offline functionality with service worker
- Push notifications for appointments and messages
- App-like experience with custom splash screen

## Support

For support, contact the development team or create an issue in the repository.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
