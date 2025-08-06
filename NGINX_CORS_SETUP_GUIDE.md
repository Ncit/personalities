# Nginx CORS Setup Guide

## Problem
You're getting CORS/network errors when trying to access `https://nikmobdev.ru/goodsshop/api/check-purchase` from your VK Mini App. The client-side CORS handling has been removed, and now the server (nginx) needs to be properly configured to handle CORS requests.

## Solution Overview
1. ✅ **Client-side CORS removed** - No more `mode: 'cors'` or `credentials: 'omit'` in fetch requests
2. 🔧 **Server-side CORS configuration** - nginx needs to be configured to handle CORS properly
3. 🧪 **Testing** - Verify the configuration works

## Step 1: Client-Side Changes (Already Done)

The following changes have been made to remove CORS handling from the client:

### Files Modified:
- `src/modules/vk/services/VKUserService.js`
  - Removed `mode: 'cors'` from fetch requests
  - Removed `credentials: 'omit'` from fetch requests
  - Simplified fetch configuration

### What was removed:
```javascript
// OLD (with CORS handling)
const response = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody),
    signal: controller.signal,
    mode: 'cors', // ❌ REMOVED
    credentials: 'omit' // ❌ REMOVED
});

// NEW (without CORS handling)
const response = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody),
    signal: controller.signal
});
```

## Step 2: Server-Side Nginx Configuration

### Option A: Complete Server Block Configuration

Replace your existing nginx server block with the configuration from `nginx-cors-config.conf`:

```bash
# Backup your current configuration
sudo cp /etc/nginx/sites-available/nikmobdev.ru /etc/nginx/sites-available/nikmobdev.ru.backup

# Replace with new configuration
sudo cp nginx-cors-config.conf /etc/nginx/sites-available/nikmobdev.ru

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Option B: Add CORS to Existing Configuration

If you want to keep your existing configuration, add these location blocks to your server block:

```nginx
# Add this to your existing server block
location /goodsshop/api/ {
    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Accept' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    
    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Accept' always;
        add_header 'Access-Control-Max-Age' 1728000 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }
    
    # Your existing proxy_pass or fastcgi_pass configuration here
    proxy_pass http://127.0.0.1:8000;  # Adjust port as needed
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /goodsshop/admin/api/ {
    # Same CORS configuration as above
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Accept' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Accept' always;
        add_header 'Access-Control-Max-Age' 1728000 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }
    
    proxy_pass http://127.0.0.1:8000;  # Adjust port as needed
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Step 3: Verify Configuration

### 1. Test nginx configuration:
```bash
sudo nginx -t
```

### 2. Reload nginx:
```bash
sudo systemctl reload nginx
```

### 3. Check nginx status:
```bash
sudo systemctl status nginx
```

### 4. Test with curl:
```bash
# Test OPTIONS preflight request
curl -X OPTIONS -H "Origin: https://vk.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v https://nikmobdev.ru/goodsshop/api/check-purchase

# Test actual POST request
curl -X POST -H "Content-Type: application/json" \
  -H "Origin: https://vk.com" \
  -d '{"user_id":12345,"app_id":"53942833","item_id":"mbti_premium"}' \
  -v https://nikmobdev.ru/goodsshop/api/check-purchase
```

## Step 4: Testing

### Use the test file:
1. Open `test_cors_removal.html` in your browser
2. Click "Test Direct API Call" to verify the nginx configuration works
3. Check the browser's Network tab to see the request/response headers

### Expected Results:
- ✅ No CORS errors in browser console
- ✅ Successful API responses
- ✅ Proper CORS headers in response

## Troubleshooting

### Common Issues:

1. **nginx configuration test fails**
   ```bash
   sudo nginx -t
   # Fix any syntax errors before reloading
   ```

2. **nginx reload fails**
   ```bash
   sudo systemctl status nginx
   sudo journalctl -u nginx -f
   ```

3. **CORS still not working**
   - Check if your backend application is running on the correct port
   - Verify the `proxy_pass` URL in nginx configuration
   - Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

4. **Backend application not responding**
   - Ensure your backend server is running
   - Check if the port in `proxy_pass` matches your backend server
   - Test backend directly: `curl http://127.0.0.1:8000/goodsshop/api/check-purchase`

### Debug Commands:
```bash
# Check nginx configuration
sudo nginx -T | grep -A 20 "location /goodsshop/api/"

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Test backend directly
curl -X POST -H "Content-Type: application/json" \
  -d '{"user_id":12345,"app_id":"53942833","item_id":"mbti_premium"}' \
  http://127.0.0.1:8000/goodsshop/api/check-purchase
```

## Security Considerations

### For Production:
1. **Restrict CORS origins** instead of using `*`:
   ```nginx
   add_header 'Access-Control-Allow-Origin' 'https://vk.com' always;
   add_header 'Access-Control-Allow-Origin' 'https://ncit.github.io' always;
   ```

2. **Use HTTPS** for all API endpoints

3. **Implement rate limiting** for API endpoints

4. **Add authentication** if needed

### Current Configuration:
- Uses `*` for `Access-Control-Allow-Origin` (allows all origins)
- Allows common HTTP methods
- Handles preflight OPTIONS requests
- Includes security headers

## Files Created/Modified

### New Files:
- `nginx-cors-config.conf` - Complete nginx configuration
- `test_cors_removal.html` - Test file to verify CORS removal
- `NGINX_CORS_SETUP_GUIDE.md` - This guide

### Modified Files:
- `src/modules/vk/services/VKUserService.js` - Removed CORS handling

## Next Steps

1. Apply the nginx configuration to your server
2. Test the API endpoints
3. Verify the VK Mini App works without CORS errors
4. Monitor logs for any issues
5. Consider implementing more restrictive CORS policies for production 