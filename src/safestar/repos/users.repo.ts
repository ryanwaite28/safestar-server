import {
  fn,
  Op,
  where,
  col,
  literal,
  WhereOptions
} from 'sequelize';
import { Model } from 'sequelize/types';
import { Fn } from 'sequelize/types/lib/utils';
import { IUser, IApiKey, IUserLocationUpdate } from '../interfaces/safestar.interface';
import { UserLocationUpdates, Users } from '../models/user.model';
import { convertModels, user_attrs_slim, convertModel } from '../safestar.chamber';



export async function get_user_by_where(
  whereClause: WhereOptions
) {
  const user_model = await Users.findOne({
    where: whereClause,
    attributes: user_attrs_slim
  })
  .then((user) => {
    return convertModel<IUser>(<Model> user);
  });
  return user_model;
}

export async function create_user(
  params: {
    firstname: string;
    middlename: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
  }
) {
  const new_user_model = await Users.create(<any> params);
  const user = await get_user_by_id(<number> new_user_model.get('id'));
  return user!;
}

export async function get_random_users(
  limit: number
) {
  const users = await Users.findAll({
    limit,
    order: [fn( 'RANDOM' )],
    attributes: [
      'id',
      'firstname',
      'lastname',
      'username',
      'icon_link',
      'uuid',
      'created_at',
      'updated_at',
      'deleted_at',
    ]
  })
  .then((users) => {
    return convertModels<IUser>(<Model[]> users);
  });
  return users;
}

export async function get_user_by_email(
  email: string
) {
  try {
    const userModel = await Users.findOne({
      where: { email },
      attributes: user_attrs_slim
    })
    .then((user) => {
      return convertModel<IUser>(<Model> user);
    });
    return userModel;
  } catch (e) {
    console.log(`get_user_by_email error - `, e);
    return null;
  }
}

export async function get_user_by_paypal(
  paypal: string
) {
  try {
    const userModel = await Users.findOne({
      where: { paypal },
      attributes: user_attrs_slim
    })
    .then((user) => {
      return convertModel<IUser>(<Model> user);
    });
    return userModel;
  } catch (e) {
    console.log(`get_user_by_paypal error - `, e);
    return null;
  }
}

export function get_recent_users(you_id: number) {
  return Users.findAll({
    where: { id: {[Op.ne]: (you_id || -1)} },
    order: [['id', 'DESC']],
    limit: 20,
    attributes: user_attrs_slim
  })
  .then((users) => {
    return convertModels<IUser>(<Model[]> users);
  });
}

export async function get_user_by_phone(
  phone: string
) {
  try {
    const usePhone = phone.length === 11 && phone.startsWith('1')
      ? phone.substring(1)
      : phone;
    const userModel = await Users.findOne({
      where: { phone: usePhone },
      attributes: user_attrs_slim
    })
    .then((user) => {
      return convertModel<IUser>(<Model> user);
    });
    return userModel;
  } catch (e) {
    console.log(`get_user_by_phone error - `, e);
    return null;
  }
}



export async function get_user_by_id(id: number, excludes?: string[]) {
  const user_model = await Users.findOne({
    where: { id },
    include: [],
    attributes: {
      exclude: excludes || ['password']
    }
  })
  .then((user) => {
    return convertModel<IUser>(<Model> user);
  });
  return user_model;
}

export async function get_user_by_username(
  username: string
) {
  const user_model = await Users.findOne({
    where: { username },
  })
  .then((user) => {
    return convertModel<IUser>(<Model> user);
  });
  return user_model;
}

export async function get_user_by_uuid(
  uuid: string
) {
  try {
    const user_model = await Users.findOne({
      where: { uuid },
    })
    .then((user) => {
      return convertModel<IUser>(<Model> user);
    });
    return user_model;
  } catch (e) {
    console.log({
      errorMessage: `get_user_by_uuid error - `,
      e,
      uuid
    });
    return null;
  }
}

export async function update_user(
  newState: Partial<{
    email: string;
    paypal: string;
    username: string;
    phone: string | null;
    bio: string;
    location: string;
    password: string;
    icon_link: string;
    icon_id: string;
    wallpaper_link: string;
    wallpaper_id: string;
    email_verified: boolean;
    phone_verified: boolean;
    stripe_account_verified: boolean;
    stripe_account_id: string;
    latest_lat: number,
    latest_lng: number,
    latlng_last_updated: Date | Fn,
  }>,
  whereClause: WhereOptions
) {
  try {
    const user_model_update = await Users.update(
      newState as any,
      { where: whereClause }
    );
    return user_model_update;
  } catch (e) {
    console.log({
      errorMessage: `update_user error - `,
      e,
      newState,
      whereClause
    });
    return null;
  }
}

export function create_user_location_update(opts: {
  user_id: number,
  lat: number,
  lng: number,
  automated: boolean,
  device: string,
  ip_addr: string,
  user_agent: string,
}) {
  const { user_id, lat, lng } = opts;
  return UserLocationUpdates.create(opts)
    .then((model) => {
      return convertModel<IUserLocationUpdate>(model)!;
    });
}

export function find_users_by_name(query_term: string) {
  const useQueryTerm = (<string> query_term || '').trim().toLowerCase();

  return Users.findAll({
    where: {
      // id: { [Op.notIn]: user_ids as number[] },
      [Op.or]: [
        {
          firstname: where(fn('LOWER', col('firstname')), 'LIKE', '%' + useQueryTerm + '%'),
        },
        {
          middlename: where(fn('LOWER', col('middlename')), 'LIKE', '%' + useQueryTerm + '%'),
        },
        {
          lastname: where(fn('LOWER', col('lastname')), 'LIKE', '%' + useQueryTerm + '%'),
        },
      ]
    },
    attributes: user_attrs_slim,
    limit: 20
  });
}

export function find_users_by_username(query_term: string) {
  const useQueryTerm = (<string> query_term || '').trim().toLowerCase();

  return Users.findAll({
    where: {
      // id: { [Op.notIn]: user_ids as number[] },
      [Op.or]: [
        {
          username: where(fn('LOWER', col('username')), 'LIKE', '%' + useQueryTerm + '%'),
        },
      ]
    },
    attributes: user_attrs_slim,
    limit: 20
  });
}

export function find_users_by_name_or_username(query_term: string) {
  const useQueryTerm = (<string> query_term || '').trim().toLowerCase();

  return Users.findAll({
    where: {
      // id: { [Op.notIn]: user_ids as number[] },
      [Op.or]: [
        {
          firstname: where(fn('LOWER', col('firstname')), 'LIKE', '%' + useQueryTerm + '%'),
        },
        {
          middlename: where(fn('LOWER', col('middlename')), 'LIKE', '%' + useQueryTerm + '%'),
        },
        {
          lastname: where(fn('LOWER', col('lastname')), 'LIKE', '%' + useQueryTerm + '%'),
        },
        {
          username: where(fn('LOWER', col('username')), 'LIKE', '%' + useQueryTerm + '%'),
        },
      ]
    },
    attributes: user_attrs_slim,
    limit: 20
  });
}

export function find_users_within_radius_of_point(lat: number, lng: number, you_id?: number) {
  // https://stackoverflow.com/questions/44012932/sequelize-geospatial-query-find-n-closest-points-to-a-location
  
  return Users.findAll({
    where: {
      id: { [Op.ne]: you_id || -1 },
      // '$distance$': { [Op.lte]: 5 },
    },
    attributes: {
      include: [
        [literal("3958 * acos(cos(radians("+lat+")) * cos(radians(latest_lat)) * cos(radians("+lng+") - radians(latest_lng)) + sin(radians("+lat+")) * sin(radians(latest_lat)))"), 'distance']
      ],
      exclude: [
        'password'
      ],
    },
  })
  .then((models) => {
    return convertModels<IUser>(models);
  });
}