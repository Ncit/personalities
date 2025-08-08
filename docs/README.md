# MBTI 16 Personalities Quiz - Enhanced Platform

A modern, modular web application for discovering your Myers-Briggs Type Indicator (MBTI) personality type. This comprehensive platform features a 60-question assessment with advanced analytics, VK platform integration, and multiple specialized quizzes.

## 🌟 Enhanced Features

- **60 Comprehensive Questions**: Carefully crafted questions covering all four MBTI dimensions
- **Modular Architecture**: Clean, scalable codebase with ES6 modules and separation of concerns
- **VK Platform Integration**: Native VK Mini Apps support with payment processing
- **Multiple Quiz Types**: 15+ specialized assessments for premium users
- **Advanced Analytics**: Interactive charts and detailed personality insights
- **Internationalization**: Full Russian and English language support
- **Firebase Integration**: Comprehensive analytics and error tracking
- **Premium Features**: Subscription-based access to specialized content
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **No Data Storage**: All processing happens locally - your privacy is protected

## 📁 Project Structure

```
personalities/
├── src/                          # Source code
│   ├── modules/                  # Core application modules
│   │   ├── core/                # State management and app logic
│   │   ├── quiz/                # Quiz engine and scoring
│   │   ├── ui/                  # DOM manipulation and UI updates
│   │   ├── analytics/           # Data visualization and charts
│   │   └── vk/                  # VK platform integration
│   ├── data/                    # Quiz questions and personality data
│   ├── config/                  # Firebase and external service configs
│   ├── locales/                 # Internationalization files
│   └── debug/                   # Debug utilities and configurations
├── docs/                        # Documentation
│   ├── api/                     # API documentation
│   ├── architecture/            # Architecture and design docs
│   ├── deployment/              # Deployment and configuration guides
│   └── guides/                  # Development and troubleshooting guides
├── tests/                       # Test files and test utilities
├── config/                      # Configuration files (nginx, etc.)
├── scripts/                     # Build and utility scripts
├── dist/                        # Build output
└── node_modules/                # Dependencies
```

## 🏗️ Architecture Overview

The application follows a modern modular architecture:

```
src/
├── modules/
│   ├── core/           # State management and app logic
│   ├── quiz/           # Quiz engine and scoring
│   ├── ui/             # DOM manipulation and UI updates
│   ├── analytics/      # Data visualization and charts
│   └── vk/             # VK platform integration
├── data/               # Quiz questions and personality data
├── config/             # Firebase and external service configs
└── locales/            # Internationalization files
```

## 🎯 MBTI Dimensions

The quiz evaluates your preferences across four key dimensions:

### 1. Extraversion (E) vs Introversion (I)
- **Extraversion**: How you direct and receive energy from the outer world
- **Introversion**: How you direct and receive energy from your inner world

### 2. Sensing (S) vs Intuition (N)
- **Sensing**: How you take in information through concrete facts and details
- **Intuition**: How you take in information through patterns and possibilities

### 3. Thinking (T) vs Feeling (F)
- **Thinking**: How you make decisions based on logic and objective analysis
- **Feeling**: How you make decisions based on values and how they affect people

### 4. Judging (J) vs Perceiving (P)
- **Judging**: How you approach the outer world with structure and planning
- **Perceiving**: How you approach the outer world with flexibility and spontaneity

## 🚀 Getting Started

### Prerequisites
- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation
1. Clone this repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open `http://localhost:5173` in your browser

### Build for Production
```bash
npm run build
npm run preview
```

## 📱 How to Use

1. **Welcome Screen**: Read about the MBTI dimensions and choose your quiz type
2. **Answer Questions**: Select the option that best describes you for each question
3. **Navigate**: Use "Previous" and "Next" buttons to review or change answers
4. **View Results**: See your personality type, description, and detailed analytics
5. **Premium Features**: Unlock specialized quizzes and advanced insights
6. **Share**: Share your results with friends or take the quiz again

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradient backgrounds
- **Smooth Animations**: Fade-in effects and hover animations
- **Responsive Layout**: Adapts to any screen size
- **Accessibility**: High contrast colors and clear typography
- **Interactive Elements**: Hover effects and visual feedback
- **Dark/Light Themes**: Automatic theme switching based on system preference

## 📊 Advanced Analytics

The platform includes comprehensive analytics features:

- **Radar Charts**: Visual representation of personality dimensions
- **Bar Charts**: Score comparison across dimensions
- **Balance Charts**: Preference balance visualization
- **Pie Charts**: Score distribution analysis
- **Timeline Charts**: Progress tracking

## 📚 Documentation

- **[Architecture](./docs/architecture/)** - System design and architecture decisions
- **[API Documentation](./docs/api/)** - VK integration and payment APIs
- **[Deployment Guides](./docs/deployment/)** - Configuration and deployment instructions
- **[Development Guides](./docs/guides/)** - Development and troubleshooting guides

## 🧪 Testing

Test files are located in the `tests/` directory. Run tests with:
```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](./docs/)
- Review [troubleshooting guides](./docs/guides/)
- Open an issue on GitHub 