import {
  fn,
  col,
  Op,
  WhereOptions,
  FindOptions,
  Includeable,
  FindAttributeOptions,
  GroupOption,
  Order,
  Model as sModel
} from 'sequelize';
import { Model } from 'sequelize/types';
import { MyModelStatic } from '../types/safestar.types';
import { IModelRating, IMyModel } from '../interfaces/safestar.interface';
import { convertModel, convertModels } from '../safestar.chamber';



export async function get_rating_by_id_via_model(ratingsModel: MyModelStatic, id: number): Promise<IModelRating> {
  const results = await ratingsModel.findOne({
    where: { id }
  })
  .then((model: Model | null) => {
    return convertModel<IModelRating>(model)!;
  });

  return results;
}

export async function get_user_ratings_via_model(ratingsModel: MyModelStatic, id: number): Promise<IModelRating[]> {
  const results = await ratingsModel.findAll({
    where: { user_id: id },
    limit: 10,
    order: [['id', 'DESC']]
  })
  .then((models) => {
    return convertModels<IModelRating>(models);
  });

  return results;
}

export async function get_writer_ratings_via_model(ratingsModel: MyModelStatic, id: number): Promise<IModelRating[]> {
  const results = await ratingsModel.findAll({
    where: { writer_id: id },
    limit: 10,
    order: [['id', 'DESC']]
  })
  .then((models) => {
    return convertModels<IModelRating>(models);
  });

  return results;
}

export async function create_rating_via_model(ratingsModel: MyModelStatic, data: any): Promise<IModelRating> {
  const results = await ratingsModel.create(data)
    .then((model: Model) => {
      return convertModel<IModelRating>(model)!;
    });

  return results;
}

export async function get_user_ratings_stats_via_model(ratingsModel: MyModelStatic, id: number): Promise<{
  user_ratings_info: IModelRating | null,
  writer_ratings_info: IModelRating | null,
}> {
  const user_ratings_info = await ratingsModel.findOne({
    where: { user_id: id },
    attributes: [
      [fn('AVG', col('rating')), 'ratingsAvg'],
      [fn('COUNT', col('rating')), 'ratingsCount'],
    ],
    group: ['user_id'],
  })
  .then((model: Model | null) => {
    return convertModel<IModelRating>(model);
  });

  const writer_ratings_info = await ratingsModel.findOne({
    where: { writer_id: id },
    attributes: [
      [fn('AVG', col('rating')), 'ratingsAvg'],
      [fn('COUNT', col('rating')), 'ratingsCount'],
    ],
    group: ['writer_id'],
  })
  .then((model: Model | null) => {
    return convertModel<IModelRating>(model)!;
  });

  return {
    user_ratings_info,
    writer_ratings_info,
  }
}