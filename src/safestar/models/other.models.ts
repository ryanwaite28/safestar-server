import { DataTypes, Model } from "sequelize";
import { common_model_options } from "../../_def.model";



export class NewsDataCache extends Model {}
NewsDataCache.init({
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  key:                 { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  json_data:           { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  uuid:                { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_news_data_cache',
  modelName: 'newsDataCache',
});