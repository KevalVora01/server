import { sequelize } from './sequelize';
export { sequelize }; 


import "../../modules/auth/infrastructure/models/UserModel";
import "../../modules/residents/infrastructure/models/ResidentModel";
import "../../modules/auth/infrastructure/models/PasswordResetTokenModel";
import "../../modules/apartments/infrastructure/models/ApartmentModel";
import "../../modules/family-members/infrastructure/models/FamilyMemberModel";
import "../../modules/vehicles/infrastructure/models/VehicleModel";

import { runDatabaseSeeders } from '../../../database/seeder/seeder';

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully via Sequelize');
    
    await sequelize.sync({ alter: true }); 
    console.log('🔄 All database tables synchronized successfully.');

    await runDatabaseSeeders();

  } catch (error) {
    console.error('❌ PostgreSQL connection failed via Sequelize', error);
    process.exit(1);
  }
};