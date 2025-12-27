export function extractErrorMessage(err: any): string {
  const detail = err.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg).join(', ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  return 'An error occurred';
}
