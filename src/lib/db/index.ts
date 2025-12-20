import postgres from 'postgres'

const db = postgres(process.env.DATABASE_URL!, {
  onnotice: () => {},
})

export default db
