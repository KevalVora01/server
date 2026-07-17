import { sequelize } from './sequelize';
export { sequelize }; 


import "../../modules/auth/infrastructure/models/UserModel";
import "../../modules/residents/infrastructure/models/ResidentModel";
import "../../modules/auth/infrastructure/models/PasswordResetTokenModel";
import "../../modules/apartments/infrastructure/models/ApartmentModel";
import "../../modules/family-members/infrastructure/models/FamilyMemberModel";
import "../../modules/vehicles/infrastructure/models/VehicleModel";
import "../../modules/notices/infrastructure/models/NoticeModel";
import "../../modules/complaints/infrastructure/models/ComplaintModel";
import "../../modules/complaints/infrastructure/models/ComplaintCommentModel";
import "../../modules/complaints/infrastructure/models/ComplaintImageModel";
import "../../modules/notifications/infrastructure/models/NotificationModel";
import "../../modules/maintenance/infrastructure/models/MaintenanceSettingModel";
import "../../modules/maintenance/infrastructure/models/InvoiceModel";

import { runDatabaseSeeders } from '../../../database/seeder/seeder';

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully via Sequelize');
    
    await sequelize.sync({ alter: true }); 
    console.log('🔄 All database tables synchronized successfully.');

    // Remove the obsolete unique index that blocked an admin from recording
    // votes on behalf of multiple committee members (and from casting their
    // own direct vote after doing so). Uniqueness is now enforced per
    // committee member (uniq_vote_per_member_per_request) and per
    // admin-direct vote at the application level.
    await sequelize.query('DROP INDEX IF EXISTS "uniq_vote_per_admin_per_request";');
    console.log('🗑️  Dropped obsolete uniq_vote_per_admin_per_request index (if present).');

    await runDatabaseSeeders();

  } catch (error) {
    console.error('❌ PostgreSQL connection failed via Sequelize', error);
    process.exit(1);
  }
};