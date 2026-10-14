export const redactUrl = (url: string) =>
  url
    .replace(/(\/invitations\/)[^/?]+/, '$1[redacted]')
    .replace(/(\/reset-password\/)[^/?]+/, '$1[redacted]')
    .replace(/([?&]token=)[^&]+/, '$1[redacted]');
