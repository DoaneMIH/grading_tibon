import { neon } from '@neondatabase/serverless';

// Create a reusable SQL client connected to your Neon database
const sql = neon(process.env.DATABASE_URL);

export default sql;
