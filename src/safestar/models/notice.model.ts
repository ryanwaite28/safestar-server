import { common_model_options } from '../../_def.model';
import { Model, DataTypes } from 'sequelize';
import { Users } from './user.model';



export class Notices extends Model {}
Notices.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },

  parent_id:           { type: DataTypes.INTEGER, allowNull: true }, // if this notice is a reply to another
  quoting_id:          { type: DataTypes.INTEGER, allowNull: true }, // if this notice is quoting another
  share_id:            { type: DataTypes.INTEGER, allowNull: true }, // if this notice is a share of another

  body:                { type: DataTypes.STRING(250), allowNull: false },
  tags:                { type: DataTypes.STRING, allowNull: false, defaultValue: '' },

  is_explicit:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  is_private:          { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  visibility:          { type: DataTypes.STRING(75), allowNull: false, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_notices',
  modelName: 'notice',
});

export class NoticeReactions extends Model {}
NoticeReactions.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  notice_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Notices, key: 'id' } },
  reaction_id:         { type: DataTypes.INTEGER, allowNull: true },
  reaction:            { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_notice_reactions',
  modelName: 'noticeReaction',
});

export class NoticePhotos extends Model {}
NoticePhotos.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  notice_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Notices, key: 'id' } },
  photo_id:            { type: DataTypes.STRING, allowNull: false },
  photo_link:          { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_notice_photos',
  modelName: 'noticePhoto',
});

export class NoticeVideos extends Model {}
NoticeVideos.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  notice_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Notices, key: 'id' } },
  s3object_bucket:     { type: DataTypes.STRING, allowNull: false },
  s3object_key:        { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_notice_videos',
  modelName: 'noticeVideo',
});

export class NoticeAudios extends Model {}
NoticeAudios.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  notice_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Notices, key: 'id' } },
  s3object_bucket:     { type: DataTypes.STRING, allowNull: false },
  s3object_key:        { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_notice_audios',
  modelName: 'noticeAudio',
});


Users.hasMany(Notices, { as: 'user_notices', foreignKey: 'owner_id', sourceKey: 'id' });
Notices.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Notices.hasMany(NoticeReactions, { as: 'notice_reactions', foreignKey: 'notice_id', sourceKey: 'id' });
NoticeReactions.belongsTo(Notices, { as: 'notice', foreignKey: 'notice_id', targetKey: 'id' });

Notices.hasMany(NoticePhotos, { as: 'notice_photos', foreignKey: 'notice_id', sourceKey: 'id' });
NoticePhotos.belongsTo(Notices, { as: 'notice', foreignKey: 'notice_id', targetKey: 'id' });

Notices.hasMany(NoticeVideos, { as: 'notice_videos', foreignKey: 'notice_id', sourceKey: 'id' });
NoticeVideos.belongsTo(Notices, { as: 'notice', foreignKey: 'notice_id', targetKey: 'id' });

Notices.hasMany(NoticeAudios, { as: 'notice_audios', foreignKey: 'notice_id', sourceKey: 'id' });
NoticeAudios.belongsTo(Notices, { as: 'notice', foreignKey: 'notice_id', targetKey: 'id' });
