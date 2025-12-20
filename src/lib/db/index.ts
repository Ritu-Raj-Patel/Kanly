import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const db = postgres(process.env.DATABASE_URL, {
  onnotice: () => {},
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
})

export default db
