# User Registration

Create your GreenCop account to start monitoring environmental conditions.

## Registration Process

### Step 1: Access Registration Page

1. Open GreenCop in your web browser
2. If not logged in, you'll see the login page
3. Click **"Don't have an account? Register"** link below the login form

### Step 2: Fill Registration Form

Required fields:

**Email Address**:
- Valid email format required
- Used for login and account recovery (future)
- Example: `yourname@example.com`

**Username**:
- 6-12 characters
- Letters and numbers allowed
- Must be unique
- Example: `admin123`

**Password**:
- Minimum 8 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Example: `MySecurePass123`

### Step 3: Submit Registration

1. Review your information
2. Click **Register** button
3. Wait for confirmation (1-2 seconds)
4. Automatically redirected to login page

### Step 4: Login

1. Enter your email and password
2. Click **Login**
3. Receive JWT token (stored automatically)
4. Redirected to dashboard

## Validation Rules

### Username Validation

- ✅ Valid: `admin123`, `user01`, `sensor_admin`
- ❌ Invalid: `abc` (too short), `verylongusername` (too long), `user!@#` (special chars)

### Password Validation

- ✅ Valid: `Password123`, `MySecure1`, `Admin2024`
- ❌ Invalid: `password` (no number), `PASSWORD123` (no lowercase), `Pass1` (too short)

### Email Validation

- ✅ Valid: `user@example.com`, `admin.user@company.org`
- ❌ Invalid: `notanemail`, `@example.com`, `user@`

## After Registration

### First Steps

1. **Create Server Rooms**: Organize your monitoring locations
2. **Register Sensors**: Add ESP32 sensors to rooms
3. **Configure Alerts**: Set temperature/humidity thresholds
4. **Explore Dashboard**: View real-time data

### Account Details

Your account includes:
- Unique customer ID (auto-generated)
- Secure password hash (bcrypt)
- JWT authentication tokens
- Unlimited rooms and sensors

## Security

### Password Storage

- Passwords hashed with bcrypt
- Salt automatically added
- Never stored in plain text
- Cannot be retrieved (only reset)

### JWT Tokens

- 30-minute expiration
- HS256 algorithm
- Stored in browser localStorage
- Automatically included in API requests

## Troubleshooting

### "Email already exists"

**Cause**: Email is already registered

**Solution**:
- Use different email address
- Or login with existing account
- Password reset (future feature)

### "Username already exists"

**Cause**: Username is taken

**Solution**: Choose a different username

### Validation Errors

**Symptoms**: Red error messages

**Solutions**:
- Check username length (6-12 chars)
- Ensure password meets requirements
- Verify email format
- Review all error messages

### Registration Button Disabled

**Cause**: Form validation failing

**Solution**: Ensure all fields are filled and valid

## API Details

**Endpoint**: `POST /api/v1/customers/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "admin123",
  "password": "MySecurePass123"
}
```

**Response (Success)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "admin123"
}
```

**Response (Error)**:
```json
{
  "detail": "Email already registered"
}
```

## Next Steps

- [Login to Your Account](../features/dashboard.md)
- [Create Server Rooms](managing-rooms.md)
- [Add Sensors](managing-sensors.md)
- [Configure Alerts](configuring-alerts.md)
