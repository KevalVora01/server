import { Sequelize } from 'sequelize';
import { env } from './env';
import { runDatabaseSeeders } from "../../../database/seeders/mainSeeder";

// Initialize the Sequelize instance using your existing environment variables
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  
  logging: env.NODE_ENV === 'development' ? console.log : false,
  
  define: {
    underscored: true,      // Automatically maps camelCase fields to snake_case in your DB tables
    timestamps: true,       // Tells Sequelize to handle created_at and updated_at automatically
    freezeTableName: true,  // Keeps your table names exactly as defined (e.g., 'users' instead of changing to 'userss')
  },
  pool: {
    max: 20,                // Kept your max connection limit from your old pool config
    idle: 30000,            // Kept your idle timeout (30000ms)
    acquire: 30000,         // Maximum time (ms) that a pool will try to get a connection before throwing an error
  }
});

// Function to test the database connection during application startup
export const connectDB = async (): Promise<void> => {
  try {
    // 1. Test the connection credentials
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully via Sequelize');
    
    // 2. Synchronize models with the database tables
    await sequelize.sync({ alter: true }); 
    console.log('🔄 All database tables synchronized successfully.');

    await runDatabaseSeeders();

  } catch (error) {
    console.error('❌ PostgreSQL connection failed via Sequelize', error);
    process.exit(1);
  }
};