import { common_model_options } from '../../_def.model';
import { Model, DataTypes } from 'sequelize';
import { Users } from './user.model';



export class Trackings extends Model {}
Trackings.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  tracking_id:         { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_trackings',
  modelName: 'tracking',
});

export class TrackingRequests extends Model {}
TrackingRequests.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  tracking_id:         { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  status:              { type: DataTypes.INTEGER, allowNull: true, defaultValue: null }, // null = pending, 2 = canceled, 1 = accepted, 0 = rejected
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_tracking_requests',
  modelName: 'trackingRequest',
});



Users.hasMany(Trackings, { as: 'trackers', foreignKey: 'tracking_id', sourceKey: 'id' });
Trackings.belongsTo(Users, { as: 'track_user', foreignKey: 'tracking_id', targetKey: 'id' });
Users.hasMany(Trackings, { as: 'trackings', foreignKey: 'user_id', sourceKey: 'id' });
Trackings.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Users.hasMany(TrackingRequests, { as: 'tracker_requests', foreignKey: 'tracking_id', sourceKey: 'id' });
TrackingRequests.belongsTo(Users, { as: 'tracking', foreignKey: 'tracking_id', targetKey: 'id' });
Users.hasMany(TrackingRequests, { as: 'tracking_requests', foreignKey: 'user_id', sourceKey: 'id' });
TrackingRequests.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });