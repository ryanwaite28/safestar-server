import { common_model_options } from '../../_def.model';
import { Model, DataTypes } from 'sequelize';
import { Users } from './user.model';



export class Messagings extends Model {}
Messagings.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  sender_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_messagings',
  modelName: 'messaging',
});



export class MessagingRequests extends Model {}
MessagingRequests.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  sender_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  status:             { type: DataTypes.INTEGER, allowNull: true }, // null = pending, 1 = accepted, 0 = rejected
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_messaging_requests',
  modelName: 'messagingRequest',
});



export class Messages extends Model {}
Messages.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  from_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  to_id:              { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  body:               { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  lat:                { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  lng:                { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  opened:             { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_messages',
  modelName: 'message',
});



export class MessagePhotos extends Model {}
MessagePhotos.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: Messages, key: 'id' } },
  photo_id:            { type: DataTypes.STRING, allowNull: false },
  photo_link:          { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_message_photos',
  modelName: 'messagePhoto',
});



export class MessageVideos extends Model {}
MessageVideos.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Messages, key: 'id' } },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_message_videos',
  modelName: 'messageVideo',
});



export class MessageAudios extends Model {}
MessageAudios.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Messages, key: 'id' } },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_message_audios',
  modelName: 'messageAudio',
});



Users.hasMany(Messagings, { as: 'message_sendings', foreignKey: 'sender_id', sourceKey: 'id' });
Messagings.belongsTo(Users, { as: 'sender', foreignKey: 'sender_id', targetKey: 'id' });
Users.hasMany(Messagings, { as: 'message_receivings', foreignKey: 'user_id', sourceKey: 'id' });
Messagings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(Messages, { as: 'messages_sent', foreignKey: 'from_id', sourceKey: 'id' });
Messages.belongsTo(Users, { as: 'from', foreignKey: 'from_id', targetKey: 'id' });
Users.hasMany(Messages, { as: 'messages_received', foreignKey: 'to_id', sourceKey: 'id' });
Messages.belongsTo(Users, { as: 'to', foreignKey: 'to_id', targetKey: 'id' });