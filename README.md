# Polish Flashcards

A modern, interactive flashcard application for learning Polish language, built with React and Firebase. Flashy Polish helps learners practice at different proficiency levels with an intuitive interface and admin management system for content curation.

**Live Demo**: [https://flashy-polish.netlify.app](https://flashy-polish.netlify.app)

## Features

### Learning Interface
- **Multiple Proficiency Levels**: Practice content aligned with CEFR levels (A1, A2, B1)
- **Categorized Learning**: A1 level includes organized vocabulary categories
- **Dual Learning Modes**:
  - **Vocabulary Mode**: Learn individual Polish words with English translations
  - **Sentences Mode**: Practice complete sentences and phrases
- **Interactive Flashcards**:
  - Flip cards to reveal translations
  - Navigate with intuitive controls and keyboard shortcuts
  - Progress tracking with card counter
  - Shuffle feature for varied practice sessions
- **Audio Support**: Text-to-speech pronunciation for Polish words
- **Responsive Design**: Fully responsive on desktop and mobile devices
- **Offline Support**: Progressive Web App (PWA) with offline capability

### Admin Features
- **Admin Dashboard**: Manage vocabulary and sentence content
- **Role-based Access Control**: Secure authentication system
- **Content Management**: Add, edit, and organize learning materials
- **Firebase Integration**: Real-time data synchronization

## Technology Stack

- **React 19**: Modern UI framework with hooks and context
- **Firebase**: Real-time database (Firestore) and authentication
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Web Speech API**: Text-to-speech functionality
- **Workbox**: Service worker for PWA capabilities

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hmdshfq/polish-flashcards.git
cd polish-flashcards
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Fill in your Firebase credentials in `.env.local`

4. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open your browser and navigate to `http://localhost:5173`
   - Access the admin panel at `http://localhost:5173/admin/login` (requires authentication)

### Building for Production

```bash
npm run build
# or
pnpm build
```

The production-ready files will be generated in the `dist` directory.

### Preview Production Build

```bash
npm run preview
# or
pnpm preview
```

## How to Use

1. **Select Level**: Choose your proficiency level (A1, A2, or B1)
2. **Choose Category** (A1 only): Pick a category you want to practice
3. **Select Mode**: Choose between Vocabulary or Sentences practice
4. **Practice**:
   - Click cards to flip and reveal translations
   - Use navigation buttons to move between cards
   - Toggle audio pronunciation on/off in settings
   - Shuffle cards for random practice
   - Track your progress with the card counter

### Keyboard Shortcuts

Speed up your practice with these keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| <kbd>Space</kbd> | Flip the current card |
| <kbd>←</kbd> Left Arrow | Go to previous card |
| <kbd>→</kbd> Right Arrow | Go to next card |
| <kbd>↑</kbd> / <kbd>↓</kbd> Up/Down Arrows | Shuffle cards |
| <kbd>/</kbd> (Slash) | Toggle language direction (PL → EN / EN → PL) |
| <kbd>S</kbd> | Speak current side of the card |
| <kbd>M</kbd> | Toggle audio mute (mute/unmute) |
| <kbd>Esc</kbd> | Go back to previous screen |

**Note:** Keyboard shortcuts are only active when practicing flashcards. They won't interfere with typing in input fields or using modals.

## Project Structure

```
polish-flashcards/
├── src/
│   ├── components/
│   │   ├── admin/             # Admin dashboard components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── auth/              # Authentication components
│   │   │   ├── LoginScreen.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── common/            # Reusable UI components
│   │   │   ├── Footer.jsx
│   │   │   ├── StatusIndicator.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ...
│   │   ├── screens/           # Main learning screens
│   │   │   ├── LevelSelectionScreen.jsx
│   │   │   ├── CategorySelectionScreen.jsx
│   │   │   ├── ModeSelectionScreen.jsx
│   │   │   └── PracticeScreen.jsx
│   │   └── ...
│   ├── context/               # React context for state management
│   │   └── AuthContext.jsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useLevels.js
│   │   ├── useCategories.js
│   │   ├── useFlashcards.js
│   │   └── ...
│   ├── services/              # Firebase and API services
│   │   └── ...
│   ├── utils/                 # Utility functions
│   │   └── speechSynthesis.js
│   ├── data/                  # Static data
│   │   └── ...
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
├── public/                    # Static assets and service worker
│   ├── favicon.svg
│   ├── sw.js                  # Service worker
│   └── _redirects             # Netlify routing configuration
├── firebase.json              # Firebase configuration
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Firestore indexes
├── vite.config.js             # Vite configuration
└── package.json               # Dependencies and scripts
```

## Development

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Create a Firestore database
3. Set up authentication (Email/Password)
4. Add your Firebase config to `.env.local`

### Managing Content

Content is managed through the admin dashboard at `/admin`. The data structure in Firestore includes:
- **Levels**: CEFR proficiency levels (A1, A2, B1)
- **Categories**: Vocabulary categories for A1 level
- **Flashcards**: Individual vocabulary items and sentences with Polish and English translations

Access the admin panel with authorized credentials to manage learning content.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run export` - Export vocabulary data from Firestore
- `npm run import` - Import vocabulary data to Firestore
- `npm run sync` - Sync data (export then import)

## Deployment

The application is deployed on **Netlify** with automatic deployments from the main branch.

### Deployment Configuration
- **Hosting**: Netlify
- **Build Command**: `npm run build`
- **Build Directory**: `dist`
- **Routing**: Configured with `public/_redirects` for SPA routing support

Visit the live app at: [https://flashy-polish.netlify.app](https://flashy-polish.netlify.app)

## Browser Compatibility

This application works best in modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Web Speech API (for audio pronunciation)
- Service Workers (PWA features)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with [Vite](https://vite.dev/) and [React 19](https://react.dev/)
- Backend powered by [Firebase](https://firebase.google.com/) (Firestore + Authentication)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Uses [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for pronunciation
- PWA capabilities with [Workbox](https://developers.google.com/web/tools/workbox)
