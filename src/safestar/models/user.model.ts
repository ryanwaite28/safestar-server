import { common_model_options } from '../../_def.model';
import { Model, DataTypes } from 'sequelize';


export class Users extends Model {}
Users.init({
  id:                                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gender:                              { type: DataTypes.INTEGER, allowNull: true }, // Unknown/Other or 0, Male or 1, Female or 2
  
  firstname:                           { type: DataTypes.STRING, allowNull: false },
  middlename:                          { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  lastname:                            { type: DataTypes.STRING, allowNull: false },

  username:                            { type: DataTypes.STRING, allowNull: false },
  email:                               { type: DataTypes.STRING, allowNull: false },
  password:                            { type: DataTypes.STRING, allowNull: false },

  phone:                               { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  bio:                                 { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  icon_link:                           { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  icon_id:                             { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  photo_id_link:                       { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  photo_id_id:                         { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  wallpaper_link:                      { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  wallpaper_id:                        { type: DataTypes.STRING, allowNull: true, defaultValue: '' },

  latest_lat:                          { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
  latest_lng:                          { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
  latlng_last_updated:                 { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

  is_public:                           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  
  person_verified:                     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  email_verified:                      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  phone_verified:                      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  allow_messaging:                     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  allow_conversations:                 { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  allow_watches:                       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  allow_text_pulse_updates:            { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  notifications_last_opened:           { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  pulses_last_opened:                  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  checkpoints_last_opened:             { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  uuid:                                { type: DataTypes.STRING, unique: true, defaultValue: DataTypes.UUIDV1 },
  push_notification_token:             { type: DataTypes.STRING, allowNull: true, defaultValue: null }
}, {
  ...common_model_options,
  tableName: 'safestar_users',
  modelName: 'user',
  indexes: [{ unique: true, fields: ['email', 'uuid']} ],
});

export class UserLocationUpdates extends Model {}
UserLocationUpdates.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:              { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  automated:            { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  device:               { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  ip_addr:              { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  user_agent:           { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  lat:                  { type: DataTypes.FLOAT, allowNull: false, },
  lng:                  { type: DataTypes.FLOAT, allowNull: false },
  uuid:                 { type: DataTypes.STRING, unique: true, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_user_location_updates',
  modelName: 'userLocationUpdate',
});

export class UserDevices extends Model {}
UserDevices.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:              { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  token:                { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  device_info:          { type: DataTypes.JSON, allowNull: true, defaultValue: null },
  device_id:            { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  device_type:          { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  device_platform:      { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_user_devices',
  modelName: 'userDevice',
});


export class UserFields extends Model {}
UserFields.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:              { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  fieldname:            { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  fieldtype:            { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  fieldvalue:           { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_user_fields',
  modelName: 'userField',
});



export class EmailVerifications extends Model {}
EmailVerifications.init({
  id:                      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:                 { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  email:                   { type: DataTypes.STRING, allowNull: false },
  verification_code:       { type: DataTypes.STRING, unique: true, defaultValue: DataTypes.UUIDV4 },
  verified:                { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  uuid:                    { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_email_verifications',
  modelName: 'emailVerification',
});



export class PhoneVerifications extends Model {}
PhoneVerifications.init({
  id:                      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:                 { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  request_id:              { type: DataTypes.STRING, unique: true, allowNull: true },
  phone:                   { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  verification_code:       { type: DataTypes.STRING, allowNull: false },
  uuid:                    { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_phone_verifications',
  modelName: 'phoneVerification',
});



export class UserRatings extends Model {}
UserRatings.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  writer_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  rating:              { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_user_ratings',
  modelName: 'userRating',
});



export class ResetPasswordRequests extends Model {}
ResetPasswordRequests.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  completed:           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  unique_value:        { type: DataTypes.STRING, unique: true, defaultValue: DataTypes.UUIDV4 },
  uuid:                { type: DataTypes.STRING, unique: true, defaultValue: DataTypes.UUIDV1 },
  }, {
  ...common_model_options,
  tableName: 'safestar_reset_password_requests',
  modelName: 'resetPasswordRequest',
});



export class Notifications extends Model {}
Notifications.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  from_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  to_id:               { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  event:               { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  micro_app:           { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  target_type:         { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  target_id:           { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  read:                { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  image_link:          { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  image_id:            { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_notifications',
  modelName: 'notification',
});



export class Blockings extends Model {}
Blockings.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  blocks_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  uuid:                { type: DataTypes.STRING, unique: true, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_blockings',
  modelName: 'blocking',
});



export class ReportedAccounts extends Model {}
ReportedAccounts.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reporting_id:        { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  issue_type:          { type: DataTypes.STRING(250), allowNull: false },
  details:             { type: DataTypes.TEXT, allowNull: false },
  uuid:                { type: DataTypes.STRING, unique: true, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_reported_accounts',
  modelName: 'reportedAccount',
});



export class AppFeedbacks extends Model {}
AppFeedbacks.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  rating:              { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  title:               { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  summary:             { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_app_feedbacks',
  modelName: 'appFeedback',
});



Users.hasMany(UserLocationUpdates, { as: 'location_updates', foreignKey: 'user_id', sourceKey: 'id' });
UserLocationUpdates.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(UserDevices, { as: 'devices', foreignKey: 'user_id', sourceKey: 'id' });
UserDevices.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });