// Simple i18n helper for NS8 modules
// In a full implementation, this would be replaced with a proper i18n library

const translations = {
  en: {
    'Qdrant Vector Database': 'Qdrant Vector Database',
    'High-performance vector database for AI applications and similarity search': 'High-performance vector database for AI applications and similarity search',
    'Configuration': 'Configuration',
    'Host (FQDN) *': 'Host (FQDN) *',
    'The public domain name for accessing Qdrant': 'The public domain name for accessing Qdrant (e.g., qdrant.yourdomain.com)',
    'Path Prefix': 'Path Prefix',
    'Optional URL path to serve Qdrant from': 'Optional URL path to serve Qdrant from (e.g., /qdrant)',
    'Port': 'Port',
    'Port number for Qdrant service': 'Port number for Qdrant service (default: 6333)',
    'API Key': 'API Key',
    'Optional API key for authentication': 'Optional API key for authenticating requests to Qdrant',
    'Collection Size Limit': 'Collection Size Limit',
    'Maximum number of points allowed per collection': 'Maximum number of points allowed per collection',
    'Enable CORS': 'Enable CORS',
    'Allow cross-origin requests from web browsers': 'Allow cross-origin requests from web browsers',
    'Enable HTTPS (Let\'s Encrypt)': 'Enable HTTPS (Let\'s Encrypt)',
    'Automatically obtain and renew a Let\'s Encrypt SSL certificate': 'Automatically obtain and renew a Let\'s Encrypt SSL certificate',
    'Force HTTPS Redirect': 'Force HTTPS Redirect',
    'Redirect all HTTP traffic to HTTPS': 'Redirect all HTTP traffic to HTTPS',
    'Test Connection': 'Test Connection',
    'Save Configuration': 'Save Configuration',
    'Access Information': 'Access Information',
    'Dashboard URL': 'Dashboard URL',
    'API URL': 'API URL',
    'Qdrant Information': 'Qdrant Information',
    'Version': 'Version',
    'Collections': 'Collections',
    'Total Points': 'Total Points',
    'Uptime': 'Uptime'
  }
}

let currentLocale = 'en'

export function setLocale(locale: string) {
  currentLocale = locale
}

export function t(key: string, fallback?: string): string {
  const localeData = translations[currentLocale as keyof typeof translations] || translations.en
  return localeData[key as keyof typeof localeData] || fallback || key
}

export function getCurrentLocale(): string {
  return currentLocale
}
