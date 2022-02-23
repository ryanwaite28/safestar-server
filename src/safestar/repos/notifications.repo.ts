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
import { Notifications } from '../models/user.model';

export async function create_notification(
  params: {
    from_id: number;
    to_id: number;
    event: string;
    target_type: string;
    target_id?: number;
  }
) {
  const new_notification_model = await Notifications.create(<any> params);
  return new_notification_model;
}

export async function get_user_unseen_notifications_count(you_id: number, last_seen: string | Date) {
  const count = await Notifications.count({
    where: { to_id: you_id, created_at: { [Op.gt]: last_seen } },
  });

  return count;
}