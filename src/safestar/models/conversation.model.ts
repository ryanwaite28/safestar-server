import { common_model_options } from '../../_def.model';
import { Model, DataTypes } from 'sequelize';
import { Users } from './user.model';



export class Conversations extends Model {}
Conversations.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  is_public:           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  title:               { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  icon_link:           { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  icon_id:             { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_conversations',
  modelName: 'conversation',
});

export class ConversationMembers extends Model {}
ConversationMembers.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:     { type: DataTypes.INTEGER, allowNull: false, references: { model: Conversations, key: 'id' } },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  role:                { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_conversation_members',
  modelName: 'conversationMember',
});

export class ConversationMemberRequests extends Model {}
ConversationMemberRequests.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:     { type: DataTypes.INTEGER, allowNull: false, references: { model: Conversations, key: 'id' } },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  status:              { type: DataTypes.INTEGER, allowNull: true, defaultValue: null }, // null = pending, 1 = accepted, 0 = rejected
  role:                { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_conversation_member_requests',
  modelName: 'conversationMemberRequest',
});

export class ConversationLastOpeneds extends Model {}
ConversationLastOpeneds.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:     { type: DataTypes.INTEGER, allowNull: false, references: { model: Conversations, key: 'id' } },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  last_opened:         { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_conversation_last_openeds',
  modelName: 'conversationLastOpened',
});

export class ConversationMessages extends Model {}
ConversationMessages.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:    { type: DataTypes.INTEGER, allowNull: false, references: { model: Conversations, key: 'id' } },
  parent_message_id:  { type: DataTypes.INTEGER, allowNull: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  body:               { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_conversation_messages',
  modelName: 'conversationMessage',
});

export class ConversationMessageSeens extends Model {}
ConversationMessageSeens.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id:    { type: DataTypes.INTEGER, allowNull: false, references: { model: Conversations, key: 'id' } },
  message_id:         { type: DataTypes.INTEGER, allowNull: false, references: { model: ConversationMessages, key: 'id' } },
  user_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  seen:               { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_conversation_message_seens',
  modelName: 'conversationMessageSeen',
});

export class ConversationMessagePhotos extends Model {}
ConversationMessagePhotos.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: ConversationMessages, key: 'id' } },
  photo_id:            { type: DataTypes.STRING, allowNull: false },
  photo_link:          { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_conversation_message_photos',
  modelName: 'conversationMessagePhoto',
});

export class ConversationMessageVideos extends Model {}
ConversationMessageVideos.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: ConversationMessages, key: 'id' } },
  s3object_bucket:     { type: DataTypes.STRING, allowNull: false },
  s3object_key:        { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_conversation_message_videos',
  modelName: 'conversationMessageVideo',
});

export class ConversationMessageAudios extends Model {}
ConversationMessageAudios.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: ConversationMessages, key: 'id' } },
  s3object_bucket:     { type: DataTypes.STRING, allowNull: false },
  s3object_key:        { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_conversation_message_audios',
  modelName: 'conversationMessageAudio',
});




Users.hasMany(Conversations, { as: 'owned_conversations', foreignKey: 'owner_id', sourceKey: 'id' });
Conversations.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(ConversationLastOpeneds, { as: 'conversations_opened', foreignKey: 'user_id', sourceKey: 'id' });
ConversationLastOpeneds.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Conversations.hasMany(ConversationLastOpeneds, { as: 'conversations_opened', foreignKey: 'conversation_id', sourceKey: 'id' });
ConversationLastOpeneds.belongsTo(Conversations, { as: 'conversation', foreignKey: 'conversation_id', targetKey: 'id' });

Users.hasMany(ConversationMembers, { as: 'conversations', foreignKey: 'user_id', sourceKey: 'id' });
ConversationMembers.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Conversations.hasMany(ConversationMembers, { as: 'members', foreignKey: 'conversation_id', sourceKey: 'id' });
ConversationMembers.belongsTo(Conversations, { as: 'conversation', foreignKey: 'conversation_id', targetKey: 'id' });

Users.hasMany(ConversationMessages, { as: 'conversation_messages', foreignKey: 'owner_id', sourceKey: 'id' });
ConversationMessages.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Conversations.hasMany(ConversationMessages, { as: 'messages', foreignKey: 'conversation_id', sourceKey: 'id' });
ConversationMessages.belongsTo(Conversations, { as: 'conversation', foreignKey: 'conversation_id', targetKey: 'id' });

Users.hasMany(ConversationMessageSeens, { as: 'conversation_messages_seen', foreignKey: 'user_id', sourceKey: 'id' });
ConversationMessageSeens.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
ConversationMessages.hasMany(ConversationMessageSeens, { as: 'viewers', foreignKey: 'message_id', sourceKey: 'id' });
ConversationMessageSeens.belongsTo(ConversationMessages, { as: 'message', foreignKey: 'message_id', targetKey: 'id' });
