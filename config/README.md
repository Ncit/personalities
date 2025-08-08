# Configuration Files

This directory contains configuration files for the MBTI Personality Quiz application.

## 📁 Configuration Structure

```
config/
├── README.md                           # This file
├── nginx-cors-config.conf             # Standard CORS configuration
└── nginx-cors-config-permissive.conf  # Permissive CORS configuration
```

## 🔧 Configuration Files

### 🌐 Nginx CORS Configuration

#### `nginx-cors-config.conf`
Standard CORS configuration for production environments.
- **Purpose**: Secure CORS settings for production deployment
- **Use Case**: When you need controlled cross-origin access
- **Security Level**: High

#### `nginx-cors-config-permissive.conf`
Permissive CORS configuration for development and testing.
- **Purpose**: Allows broader cross-origin access for development
- **Use Case**: Development environments and testing scenarios
- **Security Level**: Low (development only)

## 🚀 Deployment

### Production Deployment
1. Copy `nginx-cors-config.conf` to your Nginx configuration directory
2. Include the configuration in your Nginx server block
3. Restart Nginx service

### Development Deployment
1. Copy `nginx-cors-config-permissive.conf` to your Nginx configuration directory
2. Include the configuration in your Nginx server block
3. Restart Nginx service

## 📝 Configuration Examples

### Standard CORS Configuration
```nginx
# Include in your Nginx server block
include /path/to/config/nginx-cors-config.conf;
```

### Permissive CORS Configuration
```nginx
# Include in your Nginx server block (development only)
include /path/to/config/nginx-cors-config-permissive.conf;
```

## 🔍 Configuration Details

### CORS Headers
- **Access-Control-Allow-Origin**: Controls which origins can access resources
- **Access-Control-Allow-Methods**: Specifies allowed HTTP methods
- **Access-Control-Allow-Headers**: Defines allowed request headers
- **Access-Control-Allow-Credentials**: Controls credential inclusion

### Security Considerations
- **Production**: Use restrictive CORS settings
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
- Consult Nginx documentation for advanced configuration 