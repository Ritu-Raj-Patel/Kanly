const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
        if (dbUrlLine) {
            const dbUrl = dbUrlLine.split('=')[1].trim();

            const sql = postgres(dbUrl);

            sql`SELECT 1`.then(() => {
                console.log('Connection successful!');
                return sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
            }).then(tables => {
                console.log('Tables found:', tables.map(t => t.table_name));
                if (tables.length === 0) {
                    console.log('No tables found in public schema. Did you run the schema.sql?');
                }
                process.exit(0);
            }).catch(err => {
                console.error('Database Error:', err);
                process.exit(1);
            });

        } else {
            console.error('DATABASE_URL not found in .env.local');
        }
    } else {
        console.error('.env.local not found');
    }
} catch (e) {
    console.error(e);
}
