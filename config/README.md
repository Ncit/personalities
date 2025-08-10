# Configuration Files

This directory contains configuration files for the MBTI Personality Quiz application.

## 📁 Configuration Structure

```
config/
├── README.md                           # This file
└── (no configuration files currently)
```

## 🔧 Configuration Files

Currently, there are no configuration files in this directory. Configuration is handled through:

- **Firebase Configuration**: Located in `src/config/firebase.js`
- **VK Configuration**: Located in `src/modules/vk/config/VKConfig.js`
- **Build Configuration**: Located in `vite.config.js`

## 🚀 Deployment

The application is configured for modern static hosting platforms:

- **Vite Build System**: Handles asset optimization and bundling
- **Firebase Integration**: Analytics and error tracking
- **VK Platform Integration**: Native VK Mini Apps support

## 📝 Configuration Examples

### Build Configuration
Located in `vite.config.js`:
```javascript
export default defineConfig({
  base: './',
  plugins: [legacy({ targets: ['defaults', 'not IE 11'] })],
  build: { outDir: 'dist', assetsDir: 'assets' }
});
```

### Firebase Configuration
Located in `src/config/firebase.js`:
```javascript
const firebaseConfig = {
  // Firebase configuration
};
```

## 🔍 Configuration Details

### Static Hosting
The application is designed for static hosting platforms like:
- **GitHub Pages**: Direct deployment from repository
- **Netlify**: Automatic builds and deployments
- **Vercel**: Optimized for frontend applications
- **Firebase Hosting**: Integrated with Firebase services

### Security Considerations
- **Static Files Only**: No server-side configuration needed
- **Development**: Use permissive settings only when necessary
- **Testing**: Use permissive settings for comprehensive testing

## 🛠️ Customization

### Modifying CORS Settings
1. Edit the appropriate configuration file
2. Update the `Access-Control-Allow-Origin` header
3. Adjust other CORS headers as needed
4. Test the configuration
5. Deploy to your environment

### Adding New Configurations
1. Create a new configuration file
2. Follow the existing naming convention
3. Document the purpose and use case
4. Update this README
5. Test the configuration

## 📊 Configuration Validation

### Testing Configuration
1. Deploy the configuration to a test environment
2. Test cross-origin requests
3. Verify CORS headers are applied correctly
4. Check for any security issues
5. Validate with different browsers

### Monitoring
- Monitor CORS errors in application logs
- Track cross-origin request patterns
- Review security headers regularly
- Update configurations as needed

## 🆘 Troubleshooting

### Common Issues
1. **CORS Errors**: Check configuration file paths and syntax
2. **Header Issues**: Verify header values and formatting
3. **Security Problems**: Review CORS settings for production
4. **Performance**: Monitor configuration impact on performance

### Support
- Check the [deployment documentation](../docs/deployment/)
- Review CORS-related guides
- Open an issue for configuration problems
- Consult platform-specific documentation for advanced configuration 