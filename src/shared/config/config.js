require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || null,
    database: process.env.DATABASE_NAME || "postgres",
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    dialect: "postgres"
  },
  test: {
    username: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || null,
    database: process.env.DATABASE_NAME + "_test" || "postgres_test",
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    dialect: "postgres"
  },
  production: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};