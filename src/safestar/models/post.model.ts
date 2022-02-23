import { common_model_options } from '../../_def.model';
import { Model, DataTypes } from 'sequelize';
import { Users } from './user.model';



// posts

export class Posts extends Model {}
Posts.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  title:               { type: DataTypes.STRING(250), allowNull: false, defaultValue: '' },
  body:                { type: DataTypes.TEXT, allowNull: false },
  tags:                { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  is_explicit:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  is_private:          { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  visibility:          { type: DataTypes.STRING(75), allowNull: false, defaultValue: '' },
  last_edited:         { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_posts',
  modelName: 'post',
});

export class PostReactions extends Model {}
PostReactions.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  post_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Posts, key: 'id' } },
  reaction_id:         { type: DataTypes.INTEGER, allowNull: true },
  reaction:            { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_post_reactions',
  modelName: 'postReaction',
});

export class PostPhotos extends Model {}
PostPhotos.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  post_id:              { type: DataTypes.INTEGER, allowNull: false, references: { model: Posts, key: 'id' } },
  photo_id:             { type: DataTypes.STRING, allowNull: false },
  photo_link:           { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_post_photos',
  modelName: 'postPhoto',
});

export class PostVideos extends Model {}
PostVideos.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  post_id:              { type: DataTypes.INTEGER, allowNull: false, references: { model: Posts, key: 'id' } },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_post_videos',
  modelName: 'postVideo',
});

export class PostAudios extends Model {}
PostAudios.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  post_id:              { type: DataTypes.INTEGER, allowNull: false, references: { model: Posts, key: 'id' } },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_post_audios',
  modelName: 'postAudio',
});



// comments

export class Comments extends Model {}
Comments.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  post_id:             { type: DataTypes.INTEGER, allowNull: true, references: { model: Posts, key: 'id' } },
  body:                { type: DataTypes.TEXT, allowNull: false },
  last_edited:         { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_comments',
  modelName: 'comment',
});

export class CommentReactions extends Model {}
CommentReactions.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: Comments, key: 'id' } },
  reaction_id:         { type: DataTypes.INTEGER, allowNull: true },
  reaction:            { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_comment_reactions',
  modelName: 'commentReaction',
});

export class CommentPhotos extends Model {}
CommentPhotos.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Comments, key: 'id' } },
  photo_id:             { type: DataTypes.STRING, allowNull: false },
  photo_link:           { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_comment_photos',
  modelName: 'commentPhoto',
});

export class CommentVideos extends Model {}
CommentVideos.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Comments, key: 'id' } },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_comment_videos',
  modelName: 'commentVideo',
});

export class CommentAudios extends Model {}
CommentAudios.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id:           { type: DataTypes.INTEGER, allowNull: false, references: { model: Comments, key: 'id' } },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_comment_audios',
  modelName: 'commentAudio',
});



// replies

export class Replies extends Model {}
Replies.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  comment_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: Comments, key: 'id' } },
  body:                { type: DataTypes.TEXT, allowNull: false },
  last_edited:         { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_replies',
  modelName: 'reply',
});

export class ReplyReactions extends Model {}
ReplyReactions.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  reply_id:            { type: DataTypes.INTEGER, allowNull: false, references: { model: Replies, key: 'id' } },
  reaction_id:         { type: DataTypes.INTEGER, allowNull: true },
  reaction:            { type: DataTypes.STRING, allowNull: false },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 }
}, {
  ...common_model_options,
  tableName: 'safestar_reply_reactions',
  modelName: 'replyReaction',
});

export class ReplyPhotos extends Model {}
ReplyPhotos.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Replies, key: 'id' } },
  photo_id:             { type: DataTypes.STRING, allowNull: false },
  photo_link:           { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_reply_photos',
  modelName: 'replyPhoto',
});

export class ReplyVideos extends Model {}
ReplyVideos.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Replies, key: 'id' } },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_reply_videos',
  modelName: 'replyVideo',
});

export class ReplyAudios extends Model {}
ReplyAudios.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reply_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Replies, key: 'id' } },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_reply_audios',
  modelName: 'replyAudio',
});



Users.hasMany(Posts, { as: 'posts', foreignKey: 'owner_id', sourceKey: 'id' });
Posts.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(Comments, { as: 'comments', foreignKey: 'owner_id', sourceKey: 'id' });
Comments.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(Replies, { as: 'user_replies', foreignKey: 'owner_id', sourceKey: 'id' });
Replies.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(PostReactions, { as: 'post_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
PostReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(CommentReactions, { as: 'user_comment_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
CommentReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Users.hasMany(ReplyReactions, { as: 'reply_reactions', foreignKey: 'owner_id', sourceKey: 'id' });
ReplyReactions.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Posts.hasMany(Comments, { as: 'comments', foreignKey: 'post_id', sourceKey: 'id' });
Comments.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Posts.hasMany(PostReactions, { as: 'reactions', foreignKey: 'post_id', sourceKey: 'id' });
PostReactions.belongsTo(Posts, { as: 'comment_post', foreignKey: 'post_id', targetKey: 'id' });
Posts.hasMany(PostPhotos, { as: 'photos', foreignKey: 'post_id', sourceKey: 'id' });
PostPhotos.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Posts.hasMany(PostVideos, { as: 'post_videos', foreignKey: 'post_id', sourceKey: 'id' });
PostVideos.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });
Posts.hasMany(PostAudios, { as: 'post_audios', foreignKey: 'post_id', sourceKey: 'id' });
PostAudios.belongsTo(Posts, { as: 'post', foreignKey: 'post_id', targetKey: 'id' });

Comments.hasMany(Replies, { as: 'replies', foreignKey: 'comment_id', sourceKey: 'id' });
Replies.belongsTo(Comments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Comments.hasMany(CommentReactions, { as: 'comment_reactions', foreignKey: 'comment_id', sourceKey: 'id' });
CommentReactions.belongsTo(Comments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Comments.hasMany(CommentPhotos, { as: 'comment_photos', foreignKey: 'comment_id', sourceKey: 'id' });
CommentPhotos.belongsTo(Comments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Comments.hasMany(CommentVideos, { as: 'comment_videos', foreignKey: 'comment_id', sourceKey: 'id' });
CommentVideos.belongsTo(Comments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });
Comments.hasMany(CommentAudios, { as: 'comment_audios', foreignKey: 'comment_id', sourceKey: 'id' });
CommentAudios.belongsTo(Comments, { as: 'comment', foreignKey: 'comment_id', targetKey: 'id' });

Replies.hasMany(ReplyReactions, { as: 'reactions', foreignKey: 'reply_id', sourceKey: 'id' });
ReplyReactions.belongsTo(Replies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Replies.hasMany(ReplyPhotos, { as: 'reply_photos', foreignKey: 'reply_id', sourceKey: 'id' });
ReplyPhotos.belongsTo(Replies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Replies.hasMany(ReplyVideos, { as: 'reply_videos', foreignKey: 'reply_id', sourceKey: 'id' });
ReplyVideos.belongsTo(Replies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
Replies.hasMany(ReplyAudios, { as: 'reply_audios', foreignKey: 'reply_id', sourceKey: 'id' });
ReplyAudios.belongsTo(Replies, { as: 'reply', foreignKey: 'reply_id', targetKey: 'id' });
