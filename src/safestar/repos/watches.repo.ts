import {
  fn,
  Op,
  cast, 
  col,
  WhereOptions
} from 'sequelize';
import { Model } from 'sequelize/types';
import { IUser, PlainObject } from '../interfaces/safestar.interface';
import { Users } from '../models/user.model';
import { convertModels, user_attrs_slim, convertModel } from '../safestar.chamber';
import { Watches, WatchLastOpeneds, WatchMembers, WatchMessages } from '../models/watch.model';
import { IWatch, IWatchMember } from '../interfaces/watch.interface';



export async function get_watch_by_id(id: number) {
  return Watches.findOne({
      where: { id },
    })
    .then((model: Model | any) => {
      return convertModel<any>(model);
    });
}

export async function get_watch_members_all(watch_id: number) {
  const results = await WatchMembers.findAll({
    where: { watch_id },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  });

  return results;
}

export async function get_watch_members(watch_id: number, member_id?: number) {
  const whereClause: PlainObject = member_id
    ? { watch_id, id: { [Op.lt]: member_id } }
    : { watch_id };

  const results = await WatchMembers.findAll({
    where: whereClause,
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }],
    limit: 10,
    order: [['id', 'DESC']]
  });

  return results;
}

export async function get_watch_member_by_user_id(user_id: number) {
  const member_model = await WatchMembers.findOne({
    where: { user_id }
  });

  return member_model;
}

export async function get_watch_member_by_watch_id(watch_id: number) {
  const member_model = await WatchMembers.findOne({
    where: { watch_id }
  });

  return member_model;
}

export async function get_watch_member_by_user_id_and_watch_id(user_id: number, watch_id: number) {
  const member_model = await WatchMembers.findOne({
    where: { watch_id, user_id }
  });

  return member_model;
}

export async function find_or_create_watch_member(user_id: number, watch_id: number) {
  // get all the watchs that the user is a part of via when they last opened it
  let member = await WatchMembers.findOne({
    where: {
      watch_id,
      user_id
    },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  });

  if (!member) {
    await WatchMembers.create({ watch_id, user_id });
    member = await WatchMembers.findOne({
      where: {
        watch_id,
        user_id
      },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    }); 
  }

  return member!;
}

export async function remove_watch_member(user_id: number, watch_id: number) {
  // get all the watchs that the user is a part of via when they last opened it
  return WatchMembers.destroy({
    where: {
      watch_id,
      user_id
    }
  });
}

export async function create_watch_message(watch_id: number, body: string) {
  if (!body) {
    console.log({ body });
    throw new TypeError(`body argument was invalid...`);
  }

  const results = await WatchMessages.create({
    watch_id,
    body,
  });

  return results;
}

export function get_user_watches_all(user_id: number) {
  // get all the watches that the user is a part of
  return WatchMembers.findAll({
    where: { user_id },
    include: [{
      model: Watches,
      as: 'watch',
      include: [{
        model: WatchMembers,
        as: 'members',
        attributes: []
      }],
      attributes: {
        include: [
          [cast(fn('COUNT', col('watchMember.watch_id')), 'integer') ,'members_count']
        ]
      }
    }],
    order: [['id', 'DESC']],
    group: ['watchMember.id', 'watch.id']
  });
}

export function get_user_watches(user_id: number, watch_timestamp?: string) {
  const whereClause: PlainObject = { user_id };
  if (watch_timestamp) {
    whereClause.updated_at = { [Op.lt]: watch_timestamp };
  }

  // get all the watches that the user is a part of via when they last opened it
  return WatchLastOpeneds.findAll({
    where: whereClause,
    include: [{
      model: Watches,
      as: 'watch',
      include: [{
        model: WatchMembers,
        as: 'members',
        attributes: []
      }],
      attributes: {
        include: [
          [cast(fn('COUNT', col('watchMember.watch_id')), 'integer') ,'members_count']
        ]
      }
    }],
    order: [['last_opened', 'DESC']],
    limit: 5
  });
}

export function get_user_watches_exclude_all(user_id: number) {
  // get all the watches that the user is a part of
  return WatchMembers.findAll({
    where: { user_id: {[Op.ne]: user_id} },
    include: [{
      model: Watches,
      as: 'watch',
      include: [{
        model: WatchMembers,
        as: 'members',
        attributes: []
      }],
      attributes: {
        include: [
          [cast(fn('COUNT', col('watchMember.watch_id')), 'integer') ,'members_count']
        ]
      }
    }],
    order: [['id', 'DESC']],
    group: ['watchMember.id', 'watch.id']
  });
}

export function get_user_watches_exclude(user_id: number) {
  // get all the watches that the user is a part of
  return WatchMembers.findAll({
    where: { user_id: {[Op.ne]: user_id} },
    include: [{
      model: Watches,
      as: 'watch',
      include: [{
        model: WatchMembers,
        as: 'members',
        attributes: []
      }],
      attributes: {
        include: [
          [cast(fn('COUNT', col('watchMember.watch_id')), 'integer') ,'members_count']
        ]
      }
    }],
    order: [['id', 'DESC']],
    // group: ['watchMember.id', 'watch.id']
    limit: 5,
  });
}

export async function get_user_unread_watches_messages_count(user_id: number) {
  const watches_member_models = await WatchMembers.findAll({
    where: { user_id },
    include: [{
      model: Watches,
      as: 'watch',
    }],
    order: [['id', 'DESC']],
  });

  let count = 0;

  for (const watch_member of watches_member_models) {
    const watchMemberObj: PlainObject = watch_member.toJSON();
    const watch_id = watchMemberObj.watch_id;
    // when a user is added to a watch, a record for last opened is also created; assume there is a record
    const last_opened_model = await WatchLastOpeneds.findOne({
      where: { watch_id, user_id }
    });
    const you_last_opened = last_opened_model!.get('last_opened') as string;
    // find how many messages are in the watch since the user last opened it
    const unseen_messages_count = await WatchMessages.count({
      where: { watch_id, created_at: { [Op.gt]: you_last_opened }, owner_id: { [Op.not]: user_id } }
    });
    // watchMemberObj.unseen_messages_count = unseen_messages_count;
    count = count + unseen_messages_count;
  }

  return count;
}

export function find_or_create_user_watch_last_opened(user_id: number, watch_id: number) {
  return WatchLastOpeneds.findOrCreate({
    where: {
      watch_id,
      user_id
    }
  });
}

export function get_recent_watches(user_id: number) {

  // return Watches.findAll({
  //   where: { owner_id: {[Op.ne]: (user_id || -1)} },
  //   order: [['id', 'DESC']],
  //   limit: 20,
  //   include: [{
  //     model: Users,
  //     as: `owner`,
  //     attributes: user_attrs_slim,
  //   }]
  // })
  // .then((models: Model[]) => {
  //   return convertModels<IWatch>(<Model[]> models);
  // });

  // get all the watches that the user is a part of
  return WatchMembers.findAll({
    where: { user_id: {[Op.ne]: user_id} },
    include: [{
      model: Watches,
      as: 'watch',
      where: { owner_id: {[Op.ne]: user_id} },
      // attributes: [
      //   [fn('DISTINCT', col('id')), 'id']
      // ]
      // include: [{
      //   model: WatchMembers,
      //   as: 'members',
      // }],
      // attributes: {
      //   include: [
      //     [cast(fn('COUNT', col('watchMember.watch_id')), 'integer') ,'members_count']
      //   ]
      // }
    }],
    order: [['id', 'DESC']],
    group: ['watchMember.id', 'watch.id'],
    // group: ['watch.id'],
    limit: 20,
  })
  .then((models: Model[]) => {
    const list: IWatch[] = [];
    const data = models
      .map((model) => (model.toJSON()) as IWatchMember)
      .forEach((member) => {
        if (!list.find(c => c.id === member.watch_id)) {
          list.push(member.watch!);
        }
      });
    return list;
  });
}
