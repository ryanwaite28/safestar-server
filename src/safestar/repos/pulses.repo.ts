import {
  fn,
  Op,
  WhereOptions
} from 'sequelize';
import { Model } from 'sequelize/types';
import { PULSE_CODES } from '../enums/safestar.enum';
import { IPulse, IPulseMessage } from '../interfaces/pulse.interface';
import { PulseMessages, Pulses } from '../models/pulse.model';
import { Users } from '../models/user.model';
import { convertModels, user_attrs_slim, convertModel } from '../safestar.chamber';
import { getAll, paginateTable } from './_common.repo';



export const pulseIncludes = [{
  model: Users,
  as: `owner`,
  attributes: user_attrs_slim,
}, {
  model: PulseMessages,
  as: `messages`,
  include: [{
    model: Users,
    as: `owner`,
    attributes: user_attrs_slim,
  }]
}];

export async function get_pulse_by_id(id: number) {
  return Pulses.findOne({
    where: { id },
    include: pulseIncludes
  })
  .then((model: Model | null) => {
    return convertModel<IPulse>(model);
  });
}
  
export function get_recent_pulses(you_id: number) {
  return Pulses.findAll({
    where: { owner_id: {[Op.ne]: (you_id || -1)} },
    order: [['id', 'DESC']],
    limit: 20,
    include: pulseIncludes
  })
  .then((models: Model[]) => {
    return convertModels<IPulse>(models);
  });
}

export async function get_user_pulses_count(user_id: number) {
  const count = await Pulses.count({
    where: { owner_id: user_id },
  });
  return count;
}

export function get_user_pulses_all(user_id: number) {
  return getAll(
    Pulses,
    'owner_id',
    user_id,
    pulseIncludes,
  )
  .then((models: Model[]) => {
    return convertModels<IPulse>(models);
  });
}

export function get_user_pulses(user_id: number, min_id?: number) {
  return paginateTable(
    Pulses,
    'owner_id',
    user_id,
    min_id,
    pulseIncludes,
  )
  .then((models: Model[]) => {
    return convertModels<IPulse>(models);
  });
}

export function get_pulse_messages_all(pulse_id: number) {
  return getAll(
    PulseMessages,
    'pulse_id',
    pulse_id,
    pulseIncludes,
  )
  .then((models: Model[]) => {
    return convertModels<IPulseMessage>(models);
  });
}

export function get_pulse_messages(pulse_id: number, min_id?: number) {
  return paginateTable(
    PulseMessages,
    'pulse_id',
    pulse_id,
    min_id,
    pulseIncludes,
  )
  .then((models: Model[]) => {
    return convertModels<IPulseMessage>(models);
  });
}

export function create_pulse(params: {
  lat: number,
  lng: number,
  code: PULSE_CODES,
  owner_id: number
}) {
  return Pulses.create(params)
    .then(async (new_model) => {
      const pulse = await get_pulse_by_id(new_model.get('id') as number);
      return pulse!;
    });
}

export function create_pulse_message(params: {
  body: string,
  pulse_id: number,
  owner_id: number
}) {
  return PulseMessages.create(params)
    .then((new_model) => {
      return PulseMessages.findOne({
        where: { id: new_model.get('id') as number },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      })
      .then((model: Model | null) => {
        return convertModel<IPulseMessage>(model)!
      });
    });
}

export function mark_pulse_as_sent_in_error(pulse_id: number) {
  return Pulses.update({ sent_in_error: true }, { where: { id: pulse_id } });
}