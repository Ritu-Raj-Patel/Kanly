import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Parse SSL configuration - support various deployment platforms
const getSSLConfig = () => {
  // If explicitly disabled
  if (process.env.DATABASE_SSL === 'false') {
    return false
  }
  
  // For production, enable SSL with rejectUnauthorized based on env
  if (process.env.NODE_ENV === 'production') {
    // Some platforms (like Railway, Render) need rejectUnauthorized: false
    return {
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false'
    }
  }
  
  return false
}

const db = postgres(process.env.DATABASE_URL, {
  onnotice: () => {},
  ssl: getSSLConfig(),
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
})

export default db
