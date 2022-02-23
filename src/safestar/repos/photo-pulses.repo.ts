import {
  fn,
  Op,
  WhereOptions
} from 'sequelize';
import { Model } from 'sequelize/types';
import { PULSE_CODES } from '../enums/safestar.enum';
import { IPhotoPulse, IPhotoPulseMessage } from '../interfaces/pulse.interface';
import { PhotoPulseMessages, PhotoPulses } from '../models/pulse.model';
import { Users } from '../models/user.model';
import { convertModels, user_attrs_slim, convertModel } from '../safestar.chamber';
import { getAll, paginateTable } from './_common.repo';



export const photo_pulseIncludes = [{
  model: Users,
  as: `owner`,
  attributes: user_attrs_slim,
}, {
  model: PhotoPulseMessages,
  as: `messages`,
  include: [{
    model: Users,
    as: `owner`,
    attributes: user_attrs_slim,
  }]
}];

export async function get_photo_pulse_by_id(id: number) {
  return PhotoPulses.findOne({
    where: { id },
    include: photo_pulseIncludes
  })
  .then((model: Model | null) => {
    return convertModel<IPhotoPulse>(model);
  });
}
  
export function get_recent_photo_pulses(you_id: number) {
  return PhotoPulses.findAll({
    where: { owner_id: {[Op.ne]: (you_id || -1)} },
    order: [['id', 'DESC']],
    limit: 20,
    include: photo_pulseIncludes
  })
  .then((models: Model[]) => {
    return convertModels<IPhotoPulse>(models);
  });
}

export async function get_user_photo_pulses_count(user_id: number) {
  const count = await PhotoPulses.count({
    where: { owner_id: user_id },
  });
  return count;
}

export function get_user_photo_pulses_all(user_id: number) {
  return getAll(
    PhotoPulses,
    'owner_id',
    user_id,
    photo_pulseIncludes,
  )
  .then((models: Model[]) => {
    return convertModels<IPhotoPulse>(models);
  });
}

export function get_user_photo_pulses(user_id: number, min_id?: number) {
  return paginateTable(
    PhotoPulses,
    'owner_id',
    user_id,
    min_id,
    photo_pulseIncludes,
  )
  .then((models: Model[]) => {
    return convertModels<IPhotoPulse>(models);
  });
}

export function get_photo_pulse_messages_all(photo_pulse_id: number) {
  return getAll(
    PhotoPulseMessages,
    'photo_pulse_id',
    photo_pulse_id,
    photo_pulseIncludes,
  )
  .then((models: Model[]) => {
    return convertModels<IPhotoPulseMessage>(models);
  });
}

export function get_photo_pulse_messages(photo_pulse_id: number, min_id?: number) {
  return paginateTable(
    PhotoPulseMessages,
    'photo_pulse_id',
    photo_pulse_id,
    min_id,
    photo_pulseIncludes,
  )
  .then((models: Model[]) => {
    return convertModels<IPhotoPulseMessage>(models);
  });
}

export function create_photo_pulse(params: {
  lat: number,
  lng: number,
  photo_link: string,
  photo_id: string,
  code: PULSE_CODES,
  owner_id: number
}) {
  return PhotoPulses.create(params)
    .then(async (new_model) => {
      const photo_pulse = await get_photo_pulse_by_id(new_model.get('id') as number);
      return photo_pulse!;
    });
}

export function create_photo_pulse_message(params: {
  body: string,
  photo_pulse_id: number,
  owner_id: number
}) {
  return PhotoPulseMessages.create(params)
    .then((new_model) => {
      return PhotoPulseMessages.findOne({
        where: { id: new_model.get('id') as number },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      })
      .then((model: Model | null) => {
        return convertModel<IPhotoPulseMessage>(model)!
      });
    });
}

export function mark_photo_pulse_as_sent_in_error(photo_pulse_id: number) {
  return PhotoPulses.update({ sent_in_error: true }, { where: { id: photo_pulse_id } });
}