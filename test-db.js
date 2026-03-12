
const mariadb = require('mariadb');

async function testConnection() {
    let conn;
    try {
        console.log("Connecting to: localhost:3306, user: root, db: Mom_db");
        conn = await mariadb.createConnection({
            host: "localhost",
            user: "root",
            password: "Mansi.19",
            port: 3306,
            database: "Mom_db"
        });
        console.log("Joined connection successfully!");
        const rows = await conn.query("SELECT 1 as val");
        console.log("Query result:", rows);
    } catch (err) {
        console.error("Connection failed:", err);
    } finally {
        if (conn) conn.end();
    }
}

testConnection();
