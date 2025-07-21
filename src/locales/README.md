# Localization System

This directory contains the localization system for the MBTI Personality Quiz application.

## Structure

```
src/locales/
├── README.md                 # This documentation
├── LocalizationManager.js    # Main localization manager
├── en.js                     # English localization
└── es.js                     # Spanish localization
```

## Usage

### Basic Usage

```javascript
import localizationManager from './locales/LocalizationManager.js';

// Get a localized string
const errorMessage = localizationManager.get('errors.initFailed');
// Returns: "Failed to initialize application. Please refresh the page."

// With parameters
const message = localizationManager.get('warnings.unsavedChanges', { count: 3 });
// Returns: "You have 3 unsaved changes. Are you sure you want to leave?"
```

### Changing Language

```javascript
// Set language via URL parameter
// ?locale=es

// Or programmatically
localizationManager.setLocale('es');
```

### Adding New Languages

1. Create a new locale file (e.g., `fr.js`):

```javascript
export const fr = {
    errors: {
        initFailed: 'Échec de l\'initialisation de l\'application. Veuillez actualiser la page.',
        // ... other error messages
    },
    success: {
        premiumUnlocked: 'Fonctionnalités premium débloquées !',
        // ... other success messages
    },
    // ... other categories
};
```

2. Import and add to LocalizationManager:

```javascript
import { fr } from './fr.js';

// In LocalizationManager constructor
this.locales = {
    en: en,
    es: es,
    fr: fr
};
```

## String Categories

### Errors (`errors`)
- Application initialization errors
- Quiz-related errors
- Premium-related errors
- Results-related errors
- Development tools errors
- Generic errors

### Success (`success`)
- User action confirmations
- Operation completions

### Info (`info`)
- Loading states
- Processing messages

### Warnings (`warnings`)
- User confirmations
- Data loss warnings
- Premium requirements

### Console (`console`)
- Debug messages for developers
- Error logging prefixes

## Key Features

- **Fallback System**: If a string is not found in the current locale, it falls back to English
- **URL Parameter Support**: Language can be set via `?locale=es` URL parameter
- **Browser Language Detection**: Automatically detects user's browser language
- **Parameter Interpolation**: Supports `{parameter}` syntax for dynamic content
- **Nested Key Access**: Use dot notation like `errors.initFailed`

## Best Practices

1. **Always use the localization system** for user-facing strings
2. **Keep keys descriptive** and organized by category
3. **Use parameters** for dynamic content instead of string concatenation
4. **Test all locales** when adding new strings
5. **Maintain consistency** in tone and style across languages

## Example

```javascript
// ❌ Don't do this
this.showError('Failed to start quiz. Please try again.');

// ✅ Do this
this.showError(localizationManager.get('errors.startQuizFailed'));
```

## URL Parameter Support

The application supports changing language via URL parameter:

- English: `?locale=en`
- Spanish: `?locale=es`
- French: `?locale=fr` (when added)

The language preference is automatically saved and restored on subsequent visits. 