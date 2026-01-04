# API Keys 🔑

## Status

📅 **Planned Feature** - Not yet implemented

## Overview

API keys will provide a more convenient authentication method for service-to-service integrations, removing the need to manage JWT token expiration in automated workflows.

## Motivation

**Current Limitation**: JWT tokens expire after 30 minutes, requiring periodic re-authentication in long-running services, cron jobs, and integrations.

**API Keys Solution**: Never-expiring tokens specifically designed for machine-to-machine communication.

## Planned Features

### Key Generation

Users will be able to generate API keys directly from the dashboard settings page:

```
Dashboard → Settings → API Keys → Generate New Key
```

**Key Properties**:
- Never expire (until manually revoked)
- Scoped to specific permissions (read-only, read-write, admin)
- Associated with specific customer account
- Can be named for easy identification
- Revocable at any time

### Permission Scopes

API keys will support granular permission scoping:

| Scope | Access Level | Use Case |
|-------|--------------|----------|
| `read` | Read-only access to all resources | Monitoring dashboards, reporting |
| `write` | Read + write access to data/sensors | Data ingestion, sensor registration |
| `admin` | Full access including account settings | Service account management |

### Usage Example

Once implemented, API keys will work like this:

```bash
# Using API key instead of JWT token
curl -X GET https://api.greencop.com/api/v1/sensors \
  -H "X-API-Key: sk_live_abc123..."
```

```javascript
// JavaScript example
const api = axios.create({
  baseURL: 'https://api.greencop.com',
  headers: {
    'X-API-Key': process.env.GREENCOP_API_KEY
  }
});

// No token refresh needed!
const sensors = await api.get('/api/v1/sensors');
```

## Benefits

✅ **No expiration** - Set it and forget it for automated workflows

✅ **Scoped permissions** - Limit blast radius of compromised keys

✅ **Easy rotation** - Generate new key, update config, revoke old key

✅ **Better audit trails** - Track which key made which API call

✅ **Service accounts** - Perfect for CI/CD, monitoring tools, integrations

## Security Considerations

When implemented, API keys will include:

- **Prefix identification**: Keys start with `sk_live_` (production) or `sk_test_` (development)
- **Hashed storage**: Only hash stored in database (bcrypt)
- **One-time display**: Key shown only once at creation
- **Audit logging**: All API key usage logged
- **Rate limiting**: Per-key rate limits to prevent abuse
- **Automatic revocation**: Option to auto-revoke on suspicious activity

## Timeline

🚧 **Priority**: Medium

**Estimated Timeline**: Q2 2026

**Dependencies**:
- Dashboard settings UI enhancement
- API key storage schema
- Authentication middleware updates
- Permission scoping system

## Workaround (Current)

Until API keys are available, use JWT tokens with automatic refresh:

```javascript
// Auto-refresh JWT tokens
async function getToken() {
  if (tokenExpired()) {
    const { data } = await axios.post('/api/v1/customers/login', credentials);
    return data.access_token;
  }
  return currentToken;
}

// Use in requests
const token = await getToken();
const response = await api.get('/api/v1/sensors', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Related Features

- [Authentication API](../api-reference/authentication.md) - Current JWT authentication
- [Settings](../user-guide/settings.md) - Dashboard settings page (future home of API key management)

## Feedback

Interested in API keys? Let us know your use case:
- **Email**: feedback@greencop.com
- **GitHub**: [Open a feature request](https://github.com/ahmedennaifer/greencop/issues)

---

**💡 Note**: While this feature is planned, development priorities may shift based on user demand and technical requirements.
