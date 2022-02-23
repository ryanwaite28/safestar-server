import { common_model_options } from '../../_def.model';
import { Model, DataTypes } from 'sequelize';
import { Users } from './user.model';



export class Checkpoints extends Model {}
Checkpoints.init({
  id:                        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:                   { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  check_id:                  { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  date_check_responded:      { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  date_expires:              { type: DataTypes.DATE, allowNull: false },
  uuid:                      { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_checkpoints',
  modelName: 'check',
});



Users.hasMany(Checkpoints, { as: 'checkpoints', foreignKey: 'check_id', sourceKey: 'id' });
Checkpoints.belongsTo(Users, { as: 'check_user', foreignKey: 'check_id', targetKey: 'id' });
Users.hasMany(Checkpoints, { as: 'checkings', foreignKey: 'user_id', sourceKey: 'id' });
Checkpoints.belongsTo(Users, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });