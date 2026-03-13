const mariadb = require('mariadb');
const dotenv = require('dotenv');
dotenv.config();

async function fix() {
    let conn;
    try {
        console.log("Connecting to MariaDB...");
        conn = await mariadb.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'Mansi.19',
            database: process.env.DB_NAME || 'Mom_db',
            port: Number(process.env.DB_PORT) || 3306
        });

        console.log("Connected. Adding columns...");
        
        try {
            await conn.query("ALTER TABLE staff ADD COLUMN profilePic TEXT");
            console.log("Added profilePic to staff.");
        } catch (e) {
            console.log("Could not add profilePic to staff (it might already exist):", e.message);
        }

        try {
            await conn.query("ALTER TABLE users ADD COLUMN profilePic TEXT");
            console.log("Added profilePic to users.");
        } catch (e) {
            console.log("Could not add profilePic to users (it might already exist):", e.message);
        }

        console.log("Done.");
    } catch (err) {
        console.error("Connection failed:", err);
    } finally {
        if (conn) conn.end();
        process.exit(0);
    }
}

fix();
