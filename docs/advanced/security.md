# Security

Security features in GreenCop.

## Authentication

**Method**: JWT tokens
**Algorithm**: HS256
**Expiration**: 30 minutes

## Password Storage

**Method**: bcrypt hashing
**Iterations**: Default (auto)
**Salt**: Automatic

## API Security

- CORS restricted to frontend origins
- JWT validation on all protected endpoints
- No sensitive data in responses

## Network Security

- Gateway on local network only
- Cloud services use IAM
- HTTPS for all cloud communication

## Best Practices

- Change SECRET_KEY in production
- Use strong passwords
- Rotate tokens regularly
- Monitor access logs
