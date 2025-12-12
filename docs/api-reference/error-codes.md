# Error Codes

Common HTTP error codes and solutions.

## 400 Bad Request
**Cause**: Invalid input data
**Examples**:
- Missing required field
- Invalid email format
- Username too short

**Solution**: Check request body matches API schema

## 401 Unauthorized
**Cause**: Missing or invalid JWT token
**Solution**: Login to get valid token, include in Authorization header

## 404 Not Found
**Cause**: Resource doesn't exist
**Solution**: Verify resource ID is correct

## 500 Server Error
**Cause**: Backend error
**Solution**: Check server logs, retry request
