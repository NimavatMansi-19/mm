const mariadb = require('mariadb');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT)
        });
        const res = await conn.query("SELECT VERSION()");
        console.log("MariaDB Version:", res);
        
        await conn.query("ALTER TABLE staff ADD COLUMN IF NOT EXISTS profilePic TEXT");
        await conn.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS profilePic TEXT");
        console.log("Columns added or already existed.");
    } catch (err) {
        console.error("FAILED:", err.message);
    } finally {
        if (conn) conn.end();
        process.exit(0);
    }
}
check();
