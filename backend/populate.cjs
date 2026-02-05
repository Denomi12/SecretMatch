require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function populateDB() {
  try {
    const client = await pool.connect();
    console.log("Connected to the database.");

    await client.query(`DROP TABLE IF EXISTS participants;`);
    await client.query(`DROP TABLE IF EXISTS matches;`);
    await client.query(`DROP TABLE IF EXISTS users;`);
    await client.query(`DROP TYPE IF EXISTS weekdays;`);

    await client.query(`
      CREATE TYPE weekdays AS ENUM (
        'Sunday', 'Monday', 'Tuesday', 
        'Wednesday', 'Thursday', 'Friday','Saturday'
      );
      `);

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(45) NOT NULL,
        password VARCHAR(150) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        preferred_day weekdays
      );
    `);

    await client.query(`
      CREATE TABLE matches (
          id SERIAL PRIMARY KEY,
          scheduled_at TIMESTAMP 
      );
    `);

    await client.query(`
      CREATE TABLE participants (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        match_id INTEGER REFERENCES matches(id) ON DELETE SET NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await addAdmin(client);

    await createUserAndJoin(client);

    client.release();
    pool.end();
    console.log("DB is populated");
  } catch (err) {
    console.error("Error populating database:", err);
    pool.end();
  }
}

const addAdmin = async (client) => {
  const adminData = {
    name: "Admin Nik",
    email: "admin@secretmatch.com",
    password: "zelovarnogeslo",
  };

  const salt = await require("bcrypt").genSalt(10);
  const hashedPassword = await require("bcrypt").hash(adminData.password, salt);

  await client.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
    [adminData.name, adminData.email, hashedPassword, "admin"],
  );
  console.log("Admin created successfully.");
};

const createUserAndJoin = async (client) => {
  const salt = await require("bcrypt").genSalt(10);
  const hashedPassword = await require("bcrypt").hash("12345678", salt);

  for (let i = 0; i < 10; i++) {
    const userId = await client.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id`,
      ["nik", `nik${i}.mori@hotmail.com`, hashedPassword],
    );

    await client.query(`INSERT INTO participants(user_id) VALUES ($1)`, [
      userId.rows[0].id,
    ]);
  }
};

populateDB();
