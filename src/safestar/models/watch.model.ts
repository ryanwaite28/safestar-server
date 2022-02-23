import { common_model_options } from '../../_def.model';
import { Model, DataTypes } from 'sequelize';
import { Users } from './user.model';



export class Watches extends Model {}
Watches.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  is_public:           { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  title:               { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  icon_link:           { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  icon_id:             { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  swlat:               { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  swlng:               { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  nelat:               { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  nelng:               { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
}, {
  ...common_model_options,
  tableName: 'safestar_watches',
  modelName: 'watch',
});

export class WatchMembers extends Model {}
WatchMembers.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  watch_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Watches, key: 'id' } },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_watch_members',
  modelName: 'watchMember',
});

export class WatchMemberRequests extends Model {}
WatchMemberRequests.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  watch_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Watches, key: 'id' } },
  status:              { type: DataTypes.INTEGER, allowNull: true, defaultValue: null }, // null = pending, 1 = accepted, 0 = rejected
    uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_watch_member_requests',
  modelName: 'watchMemberRequest',
});

export class WatchMessages extends Model {}
WatchMessages.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  watch_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: WatchMembers, key: 'id' } },
  parent_message_id:  { type: DataTypes.INTEGER, allowNull: true, references: { model: WatchMessages, key: 'id' } },
  owner_id:           { type: DataTypes.INTEGER, allowNull: true, references: { model: Users, key: 'id' } },
  body:               { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_watch_messages',
  modelName: 'watchMessage',
});

export class WatchLastOpeneds extends Model {}
WatchLastOpeneds.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  watch_id:     { type: DataTypes.INTEGER, allowNull: false, references: { model: Watches, key: 'id' } },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  last_opened:         { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_watch_last_openeds',
  modelName: 'watchLastOpened',
});

export class WatchMessageSeens extends Model {}
WatchMessageSeens.init({
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  watch_id:    { type: DataTypes.INTEGER, allowNull: false, references: { model: Watches, key: 'id' } },
  message_id:         { type: DataTypes.INTEGER, allowNull: false, references: { model: WatchMessages, key: 'id' } },
  user_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  seen:               { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  uuid:               { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_watch_message_seens',
  modelName: 'watchMessageSeen',
});



Users.hasMany(Watches, { as: 'owned_conversatins', foreignKey: 'owner_id', sourceKey: 'id' });
Watches.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(WatchLastOpeneds, { as: 'watches_opened', foreignKey: 'user_id', sourceKey: 'id' });
WatchLastOpeneds.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Watches.hasMany(WatchLastOpeneds, { as: 'watches_opened', foreignKey: 'watch_id', sourceKey: 'id' });
WatchLastOpeneds.belongsTo(Watches, { as: 'watch', foreignKey: 'watch_id', targetKey: 'id' });

Users.hasMany(WatchMembers, { as: 'watches', foreignKey: 'user_id', sourceKey: 'id' });
WatchMembers.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
Watches.hasMany(WatchMembers, { as: 'members', foreignKey: 'watch_id', sourceKey: 'id' });
WatchMembers.belongsTo(Watches, { as: 'watch', foreignKey: 'watch_id', targetKey: 'id' });

Users.hasMany(WatchMessages, { as: 'watch_messages', foreignKey: 'owner_id', sourceKey: 'id' });
WatchMessages.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Watches.hasMany(WatchMessages, { as: 'messages', foreignKey: 'watch_id', sourceKey: 'id' });
WatchMessages.belongsTo(Watches, { as: 'watch', foreignKey: 'watch_id', targetKey: 'id' });

Users.hasMany(WatchMessageSeens, { as: 'watch_messages_seen', foreignKey: 'user_id', sourceKey: 'id' });
WatchMessageSeens.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });
WatchMessages.hasMany(WatchMessageSeens, { as: 'viewers', foreignKey: 'message_id', sourceKey: 'id' });
WatchMessageSeens.belongsTo(WatchMessages, { as: 'message', foreignKey: 'message_id', targetKey: 'id' });
