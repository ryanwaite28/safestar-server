import {
  fn,
  Op,
  WhereOptions,
  FindOptions,
  Includeable,
  Model,
  FindAttributeOptions,
  GroupOption,
  Order
} from 'sequelize';
import { MyModelStatic } from '../types/safestar.types';
import { IMyModel, PlainObject } from '../interfaces/safestar.interface';
import { convertModel, convertModels } from '../safestar.chamber';



export async function paginateTable(
  model: MyModelStatic,
  user_id_field: string,
  user_id?: number,
  min_id?: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
  orderBy?: Order
)  {
  const useWhereClause: WhereOptions = <PlainObject> (!min_id
    ? { [user_id_field]: user_id }
    : { [user_id_field]: user_id, id: { [Op.lt]: min_id } }
  );
  if (whereClause) {
    Object.assign(useWhereClause, whereClause);
  }

  const models = await model.findAll({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
    limit: 5,
    order: orderBy || [['id', 'DESC']]
  });

  return models;
}

export async function paginateTableConverted<T = any>(
  model: MyModelStatic,
  user_id_field: string,
  user_id?: number,
  min_id?: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
  orderBy?: Order
)  {
  const useWhereClause: WhereOptions = <PlainObject> (!min_id
    ? { [user_id_field]: user_id }
    : { [user_id_field]: user_id, id: { [Op.lt]: min_id } }
  );
  if (whereClause) {
    Object.assign(useWhereClause, whereClause);
  }

  const models = await model.findAll({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
    limit: 5,
    order: orderBy || [['id', 'DESC']]
  })
  .then((models: Model[]) => {
    return convertModels<T>(models);
  });

  return models;
}

export async function getAll<T = IMyModel>(
  model: MyModelStatic,
  user_id_field: string,
  user_id: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
  orderBy?: Order
)  {
  // const models = await model.findAll<Model<T>>({
  const useWhereClause = whereClause
    ? { ...whereClause, [user_id_field]: user_id }
    : { [user_id_field]: user_id };

  const models = await model.findAll({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
    order: orderBy || [['id', 'DESC']]
  });

  return models;
}

export async function getCount<T = IMyModel>(
  model: MyModelStatic,
  user_id_field: string,
  user_id: number,
  group?: GroupOption,
  whereClause?: WhereOptions,
)  {
  // const models = await model.findAll<Model<T>>({
  const useWhereClause = whereClause
    ? { ...whereClause, [user_id_field]: user_id }
    : { [user_id_field]: user_id };

  const models = await model.count({
    group,
    where: useWhereClause,
  });

  return models;
}

export async function getById<T = any>(
  model: MyModelStatic,
  id: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
)  {
  // const result = await model.findOne<Model<T>>({
  const useWhereClause = whereClause
    ? { ...whereClause, id }
    : { id };

  const result = await model.findOne({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
  })
  .then((model: Model | null) => {
    return convertModel<T>(model);
  });

  return result;
}

export async function getRandomModels<T = any>(
  model: MyModelStatic,
  limit: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
) {
  try {
    const results = await (<any> model).findAll({
      limit,
      order: [fn( 'RANDOM' )],
      attributes,
      group,
      include,
    })
    .then((models: IMyModel[]) => {
      return convertModels<T>(models);
    });

    return results;
  } 
  catch (e) {
    console.log(`get_random_models error - `, e);
    return null;
  }
}

export function get_recent_models<T = any>(
  model: MyModelStatic,
  whereClause: WhereOptions = {},
) {
  return model.findAll({
    where: whereClause,
    order: [['id', 'DESC']],
    limit: 20,
  })
  .then((models) => {
    return convertModels<T>(<Model[]> models);
  });
}
