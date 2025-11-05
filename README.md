# Polish Flashcards

A modern, interactive flashcard application for learning Polish language, built with React and Vite. This app helps learners practice Polish vocabulary and grammar at different proficiency levels.

## Features

- **Multiple Proficiency Levels**: Practice content aligned with CEFR levels (A1, A2, B1)
- **Categorized Learning**: A1 level includes organized categories:
  - Basics (greetings, common words)
  - Numbers
  - Colors
  - Food
  - Animals
  - Body Parts
  - Family
  - Time
  - Places
  - Weather
- **Dual Learning Modes**:
  - **Vocabulary Mode**: Learn individual Polish words with English translations
  - **Grammar Mode**: Practice complete sentences and phrases
- **Interactive Flashcards**:
  - Flip cards to reveal translations
  - Navigate through cards with intuitive controls
  - Progress tracking with card counter
- **Audio Support**: Text-to-speech pronunciation for Polish words and phrases
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Shuffle Feature**: Randomize card order for varied practice sessions

## Technology Stack

- **React 19**: Modern UI framework
- **Vite**: Fast build tool and development server
- **CSS3**: Custom styling with modern CSS features
- **Web Speech API**: Text-to-speech functionality for Polish pronunciation

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

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

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
3. **Select Mode**: Choose between Vocabulary or Grammar practice
4. **Practice**:
   - Click cards to flip and reveal translations
   - Use navigation buttons to move between cards
   - Toggle audio pronunciation on/off in settings
   - Shuffle cards for random practice
   - Track your progress with the card counter

## Project Structure

```
polish-flashcards/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable components
│   │   │   ├── Breadcrumb.jsx
│   │   │   ├── CategoryCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LevelCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ModeCard.jsx
│   │   │   └── SettingsMenu.jsx
│   │   ├── screens/          # Main application screens
│   │   │   ├── CategorySelectionScreen.jsx
│   │   │   ├── LevelSelectionScreen.jsx
│   │   │   ├── ModeSelectionScreen.jsx
│   │   │   └── PracticeScreen.jsx
│   │   ├── Flashcard.jsx     # Flashcard display component
│   │   └── FlashcardControls.jsx
│   ├── data/
│   │   └── vocabulary.js     # Polish vocabulary and grammar data
│   ├── utils/
│   │   └── speechSynthesis.js # Text-to-speech utilities
│   ├── App.jsx               # Main application component
│   ├── App.css               # Application styles
│   └── main.jsx              # Application entry point
├── public/                   # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
└── vite.config.js           # Vite configuration
```

## Development

### Adding New Vocabulary

To add new vocabulary or grammar content, edit `src/data/vocabulary.js`. The structure follows this format:

```javascript
export const vocabulary = {
  A1: {
    CategoryName: {
      vocabulary: [
        { polish: 'Polish word', english: 'English translation' }
      ],
      grammar: [
        { polish: 'Polish sentence', english: 'English translation' }
      ]
    }
  }
};
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Browser Compatibility

This application works best in modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Web Speech API (for audio pronunciation)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with [Vite](https://vite.dev/)
- Powered by [React](https://react.dev/)
- Uses [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for pronunciation
