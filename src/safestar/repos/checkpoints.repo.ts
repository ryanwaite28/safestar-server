import {
  fn,
  Op,
  WhereOptions
} from 'sequelize';
import { Model } from 'sequelize/types';
import { ICheckpoint } from '../interfaces/checkpoint.interface';
import { Checkpoints } from '../models/checkpoint.model';
import { Users } from '../models/user.model';
import { convertModels, user_attrs_slim, convertModel } from '../safestar.chamber';
import { getAll, getCount, paginateTable } from './_common.repo';



export const checkpointUsersInclude = [{
  model: Users,
  as: 'check_user',
  attributes: user_attrs_slim,
}, {
  model: Users,
  as: 'user',
  attributes: user_attrs_slim,
}];



export function get_recent_checkpoints(you_id: number) {
  return Checkpoints.findAll({
    where: {
      // user_id: {[Op.ne]: (you_id || -1)},
      // check_id: {[Op.ne]: (you_id || -1)}
    },
    order: [['id', 'DESC']],
    limit: 20,
    include: checkpointUsersInclude,
  })
  .then((models: Model[]) => {
    return convertModels<ICheckpoint>(models);
  });
}

export async function get_checkpoint_by_id_model(id: number) {
  return Checkpoints.findOne({
    where: { id },
    include: checkpointUsersInclude,
  });
}

export async function get_checkpoint_by_id(id: number) {
  return Checkpoints.findOne({
    where: { id },
    include: checkpointUsersInclude,
  })
  .then((model) => {
    return convertModel<ICheckpoint>(model);
  });
}
  
export function get_user_checkpoints_sent_all(user_id: number) {
  const useWhere = {
    date_check_responded: { [Op.ne]: null },
  };

  return getAll(
    Checkpoints,
    'user_id',
    user_id,
    checkpointUsersInclude,
    undefined,
    undefined,
    useWhere,
  )
  .then((models: Model[]) => {
    return convertModels<ICheckpoint>(models);
  });
}

export function get_user_checkpoints_sent(user_id: number, min_id?: number) {
  const useWhere = {
    date_check_responded: { [Op.ne]: null },
  };

  return paginateTable(
    Checkpoints,
    'user_id',
    user_id,
    min_id,
    checkpointUsersInclude,
    undefined,
    undefined,
    useWhere,
  )
  .then((models: Model[]) => {
    return convertModels<ICheckpoint>(models);
  });
}

export function get_user_checkpoints_received_all(user_id: number) {
  const useWhere = {
    date_check_responded: { [Op.ne]: null },
  };

  return getAll(
    Checkpoints,
    'check_id',
    user_id,
    checkpointUsersInclude,
    undefined,
    undefined,
    useWhere,
  )
  .then((models: Model[]) => {
    return convertModels<ICheckpoint>(models);
  });
}

export function get_user_checkpoints_received(user_id: number, min_id?: number) {
  const useWhere = {
    date_check_responded: { [Op.ne]: null },
  };

  return paginateTable(
    Checkpoints,
    'check_id',
    user_id,
    min_id,
    checkpointUsersInclude,
    undefined,
    undefined,
    useWhere,
  )
  .then((models: Model[]) => {
    return convertModels<ICheckpoint>(models);
  });
}


export function get_user_checkpoints_sent_all_pending(user_id: number) {
  return getAll(
    Checkpoints,
    'user_id',
    user_id,
    checkpointUsersInclude,
    undefined,
    undefined,
    {
      date_check_responded: null,
      date_expires: {
        [Op.gt]: new Date(),
      }
    }
  )
  .then((models: Model[]) => {
    return convertModels<ICheckpoint>(models);
  });
}

export function get_user_checkpoints_sent_pending(user_id: number, min_id?: number) {
  return paginateTable(
    Checkpoints,
    'user_id',
    user_id,
    min_id,
    checkpointUsersInclude,
    undefined,
    undefined,
    {
      date_check_responded: null,
      date_expires: {
        [Op.gt]: new Date(),
      }
    }
  )
  .then((models: Model[]) => {
    return convertModels<ICheckpoint>(models);
  });
}

export function get_user_checkpoints_received_all_pending(user_id: number) {
  return getAll(
    Checkpoints,
    'check_id',
    user_id,
    checkpointUsersInclude,
    undefined,
    undefined,
    {
      date_check_responded: null,
      date_expires: {
        [Op.gt]: new Date(),
      }
    }
  )
  .then((models: Model[]) => {
    return convertModels<ICheckpoint>(models);
  });
}

export function get_user_checkpoints_received_pending(user_id: number, min_id?: number) {
  return paginateTable(
    Checkpoints,
    'check_id',
    user_id,
    min_id,
    checkpointUsersInclude,
    undefined,
    undefined,
    {
      date_check_responded: null,
      date_expires: {
        [Op.gt]: new Date(),
      }
    }
  )
  .then((models: Model[]) => {
    return convertModels<ICheckpoint>(models);
  });
}


export function create_send_user_checkpoint(params: {
  user_id: number,
  check_id: number,
}) {
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + 3);
  const createObj = { ...params, date_expires: newDate };

  return Checkpoints.create(createObj)
    .then((model) => {
      return convertModel<ICheckpoint>(model)!;
    });
}

export function get_user_to_user_checkpoints(params: {
  user_id: number,
  check_id: number,
}) {
  return Checkpoints.findOne({
    where: {
      ...params,
    },
    include: checkpointUsersInclude,
  });
}

export function check_user_to_user_checkpoint_pending(params: {
  user_id: number,
  check_id: number,
}) {
  return Checkpoints.findOne({
    where: {
      ...params,
      date_check_responded: null,
      date_expires: {
        [Op.gt]: new Date(),
      }
    },
    include: checkpointUsersInclude,
  });
}

export function get_user_checkpoints_received_all_pending_count(user_id: number) {
  return getCount(
    Checkpoints,
    'check_id',
    user_id,
    undefined,
    {
      date_check_responded: null,
      date_expires: {
        [Op.gt]: new Date(),
      }
    }
  )
}

export function get_user_checkpoints_received_count(user_id: number) {
  return getCount(
    Checkpoints,
    'check_id',
    user_id,
    undefined,
    // {
    //   date_check_responded: null,
    // }
  )
}

export function get_user_checkpoints_sent_count(user_id: number) {
  return getCount(
    Checkpoints,
    'user_id',
    user_id,
    undefined,
    // {
    //   date_check_responded: null,
    // }
  )
}