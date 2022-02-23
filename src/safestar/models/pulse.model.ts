import { common_model_options } from '../../_def.model';
import { Model, DataTypes } from 'sequelize';
import { Users } from './user.model';



export class Pulses extends Model {}
Pulses.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  code:                 { type: DataTypes.STRING, allowNull: false },
  lat:                  { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  lng:                  { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  sent_in_error:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_pulses',
  modelName: 'pulse',
});

export class PulseLocationWatches extends Model {}
PulseLocationWatches.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  lat:                  { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  lng:                  { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  radius:               { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_pulse_location_watches',
  modelName: 'pulseLocationWatch',
});

export class PulseMessages extends Model {}
PulseMessages.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pulse_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Pulses, key: 'id' } },
  owner_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  body:                 { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  opened:               { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_pulse_messages',
  modelName: 'pulseMessage',
});



export class PhotoPulses extends Model {}
PhotoPulses.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  code:                 { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  photo_link:           { type: DataTypes.STRING, allowNull: false },
  photo_id:             { type: DataTypes.STRING, allowNull: false },
  lat:                  { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  lng:                  { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_photo_pulses',
  modelName: 'photoPulse',
});

export class PhotoPulseMessages extends Model {}
PhotoPulseMessages.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  photo_pulse_id:       { type: DataTypes.INTEGER, allowNull: false, references: { model: PhotoPulses, key: 'id' } },
  owner_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  body:                 { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  opened:               { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_photo_pulse_messages',
  modelName: 'photoPulseMessage',
});

export class AudioPulses extends Model {}
AudioPulses.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  code:                 { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  lat:                  { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  lng:                  { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_audio_pulses',
  modelName: 'audioPulse',
});

export class VideoPulses extends Model {}
VideoPulses.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  code:                 { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
  s3object_bucket:      { type: DataTypes.STRING, allowNull: false },
  s3object_key:         { type: DataTypes.STRING, allowNull: false },
  lat:                  { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  lng:                  { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_video_pulses',
  modelName: 'videoPulse',
});




Users.hasMany(Pulses, { as: 'pulses', foreignKey: 'owner_id', sourceKey: 'id' });
Pulses.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(PulseLocationWatches, { as: 'pulse_location_watches', foreignKey: 'owner_id', sourceKey: 'id' });
PulseLocationWatches.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(PulseMessages, { as: 'pulse_messagess', foreignKey: 'owner_id', sourceKey: 'id' });
PulseMessages.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
Pulses.hasMany(PulseMessages, { as: 'messages', foreignKey: 'pulse_id', sourceKey: 'id' });
PulseMessages.belongsTo(Pulses, { as: 'pulse', foreignKey: 'pulse_id', targetKey: 'id' });

Users.hasMany(PhotoPulseMessages, { as: 'photo_pulse_messagess', foreignKey: 'owner_id', sourceKey: 'id' });
PhotoPulseMessages.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });
PhotoPulses.hasMany(PhotoPulseMessages, { as: 'messages', foreignKey: 'photo_pulse_id', sourceKey: 'id' });
PhotoPulseMessages.belongsTo(PhotoPulses, { as: 'photo_pulse', foreignKey: 'photo_pulse_id', targetKey: 'id' });

Users.hasMany(PhotoPulses, { as: 'photo_pulses', foreignKey: 'owner_id', sourceKey: 'id' });
PhotoPulses.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(AudioPulses, { as: 'audio_pulses', foreignKey: 'owner_id', sourceKey: 'id' });
AudioPulses.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });

Users.hasMany(VideoPulses, { as: 'video_pulses', foreignKey: 'owner_id', sourceKey: 'id' });
VideoPulses.belongsTo(Users, { as: 'owner', foreignKey: 'owner_id', targetKey: 'id' });