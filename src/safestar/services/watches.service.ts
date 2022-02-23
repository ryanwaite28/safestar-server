import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  fn,
  Op,
  col,
  cast,
  literal,
  Model,
  where
} from 'sequelize';
import { IUser, PlainObject } from '../interfaces/safestar.interface';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../types/safestar.types';
import { create_watch_message, find_or_create_user_watch_last_opened, find_or_create_watch_member, get_recent_watches, get_user_watches, get_user_watches_all, get_user_watches_exclude_all, get_watch_by_id, get_watch_members, get_watch_members_all, get_watch_member_by_user_id_and_watch_id } from '../repos/watches.repo';
import { IWatch } from '../interfaces/watch.interface';
import { EVENT_TYPES, NOTIFICATION_TARGET_TYPES, STATUSES } from '../enums/safestar.enum';
import { Users } from '../models/user.model';
import { Watches, WatchLastOpeneds, WatchMemberRequests, WatchMembers, WatchMessages, WatchMessageSeens } from '../models/watch.model';
import { create_notification } from '../repos/notifications.repo';
import { get_user_by_id } from '../repos/users.repo';
import { populate_notification_obj, getUserFullName, user_attrs_slim, validateAndUploadImageFile } from '../safestar.chamber';
import { CommonSocketEventsHandler } from './common.socket-event-handler';
import { SocketsService } from './sockets.service';
import { UploadedFile } from 'express-fileupload';



export class WatchesService {
  static async get_recent_watches(owner_id: number) {
    const watches: IWatch[] = await get_recent_watches(owner_id);
  
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: watches
      }
    };
    return serviceMethodResults;
  }

  static async get_watch_members_all(watch_id: number) {
    const members_models = await get_watch_members_all(watch_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: members_models
      }
    };
    return serviceMethodResults;
  }

  static async get_watch_members(watch_id: number, member_id?: number) {
    const members_models = await get_watch_members(watch_id, member_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: members_models
      }
    };
    return serviceMethodResults;
  }

  static async check_watch_member(opts: {
    you_id: number,
    watch_id: number,
  }) {
    const { you_id, watch_id } = opts;
    const results = await get_watch_member_by_user_id_and_watch_id(you_id, watch_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async check_watch_member_request(opts: {
    you_id: number,
    watch_id: number,
  }) {
    const { you_id, watch_id } = opts;
    const check_member_request = await WatchMemberRequests.findOne({
      where: {
        watch_id,
        user_id: you_id,
        status: STATUSES.PENDING,
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: check_member_request
      }
    };
    return serviceMethodResults;
  }

  static async send_member_request(opts: {
    you_id: number,
    watch_id: number,
  }) {
    const { you_id, watch_id } = opts;
    const check_member_request = await WatchMemberRequests.findOne({
      where: {
        watch_id,
        user_id: you_id,
        status: STATUSES.PENDING,
      }
    });
    if (check_member_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You already sent a member request to this watch`
        }
      };
      return serviceMethodResults;
    }

    const member_request = await WatchMemberRequests.create({
      watch_id,
      user_id: you_id,
      status: STATUSES.PENDING,
    });

    // don't block via await
    get_watch_by_id(watch_id).then((watch: IWatch | null) => {
      create_notification({
        from_id: you_id,
        to_id: watch!.owner_id,
        event: EVENT_TYPES.WATCH_MEMBER_REQUESTED,
        target_type: NOTIFICATION_TARGET_TYPES.WATCH,
        target_id: watch_id
      }).then((notification_model: Model) => {
        populate_notification_obj(notification_model).then((notification) => {
          CommonSocketEventsHandler.emitEventToUserSockets({
            user_id: watch!.owner_id,
            event: EVENT_TYPES.WATCH_MEMBER_REQUESTED,
            data: {
              watch,
              notification
            },
          });
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: true,
      info: {
        message: `Member request sent!`,
        data: member_request
      }
    };
    return serviceMethodResults;
  }

  static async cancel_member_request(opts: {
    you_id: number,
    watch_id: number,
  }) {
    const { you_id, watch_id } = opts;
    const check_member_request = await WatchMemberRequests.findOne({
      where: {
        watch_id,
        user_id: you_id,
        status: STATUSES.PENDING,
      }
    });
    if (!check_member_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You did not send a member request to this watch`
        }
      };
      return serviceMethodResults;
    }

    await check_member_request.update({ status: STATUSES.CANCEL }, { fields: ['status'] });

    // don't block via await
    get_watch_by_id(watch_id).then((watch: IWatch | null) => {
      create_notification({
        from_id: you_id,
        to_id: watch!.owner_id,
        event: EVENT_TYPES.WATCH_MEMBER_REQUEST_CANCELED,
        target_type: NOTIFICATION_TARGET_TYPES.WATCH,
        target_id: watch_id
      }).then((notification_model: Model) => {
        populate_notification_obj(notification_model).then((notification) => {
          CommonSocketEventsHandler.emitEventToUserSockets({
            user_id: watch!.owner_id,
            event: EVENT_TYPES.WATCH_MEMBER_REQUEST_CANCELED,
            data: {
              notification
            },
          });
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: true,
      info: {
        message: `Member request canceled!`,
        data: check_member_request
      }
    };
    return serviceMethodResults;
  }

  static async accept_member_request(opts: {
    you_id: number,
    user_id: number,
    watch_id: number,
  }) {
    const { you_id, user_id, watch_id } = opts;
    const check_member_request = await WatchMemberRequests.findOne({
      where: {
        watch_id,
        user_id,
        status: STATUSES.PENDING,
      }
    });
    if (!check_member_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No member request found for this watch`
        }
      };
      return serviceMethodResults;
    }

    await check_member_request.update({ status: STATUSES.ACCEPT }, { fields: ['status'] });

    await WatchesService.add_watch_member(opts);

    // don't block via await
    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.WATCH_MEMBER_REQUEST_ACCEPTED,
      target_type: NOTIFICATION_TARGET_TYPES.WATCH,
      target_id: watch_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.WATCH_MEMBER_REQUEST_ACCEPTED,
          data: {
            notification
          },
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: true,
      info: {
        message: `Member request accepted!`,
        data: check_member_request
      }
    };
    return serviceMethodResults;
  }

  static async reject_member_request(opts: {
    you_id: number,
    user_id: number,
    watch_id: number,
  }) {
    const { you_id, user_id, watch_id } = opts;
    const check_member_request = await WatchMemberRequests.findOne({
      where: {
        watch_id,
        user_id,
        status: STATUSES.PENDING,
      }
    });
    if (!check_member_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No member request found for this watch`
        }
      };
      return serviceMethodResults;
    }

    await check_member_request.update({ status: STATUSES.REJECT }, { fields: ['status'] });
    
    // don't block via await
    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.WATCH_MEMBER_REQUEST_REJECTED,
      target_type: NOTIFICATION_TARGET_TYPES.WATCH,
      target_id: watch_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.WATCH_MEMBER_REQUEST_REJECTED,
          data: {
            notification
          },
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: true,
      info: {
        message: `Member request rejected!`,
        data: check_member_request
      }
    };
    return serviceMethodResults;
  }

  static async add_watch_member(opts: {
    you_id: number,
    user_id: number,
    watch_id: number,
  }) {
    const { you_id, user_id, watch_id } = opts;

    const member_model = await get_watch_member_by_user_id_and_watch_id(user_id, watch_id);
    if (member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user is already a member`
        }
      };
      return serviceMethodResults;
    }

    // get all the watches that the user is a part of via when they last opened it
    const new_watch_member_model = await find_or_create_watch_member(user_id, watch_id);
    const new_watch_last_opened_model = await find_or_create_user_watch_last_opened(user_id, watch_id);

    SocketsService.get_io().to(`watch-${watch_id}`).emit(
      EVENT_TYPES.WATCH_MEMBER_ADDED, 
      {
        event: EVENT_TYPES.WATCH_MEMBER_ADDED,
        data: {
          // watch: response.locals.watch_model!.toJSON(),
          member: new_watch_member_model.toJSON()
        },
      }
    );

    // don't block via await
    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.WATCH_MEMBER_ADDED,
      target_type: NOTIFICATION_TARGET_TYPES.WATCH,
      target_id: watch_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.WATCH_MEMBER_ADDED,
          data: {
            notification
          },
        });
      });
    });
    
    const full_name = getUserFullName((<PlainObject> new_watch_member_model.toJSON()).user);
    const body: string = `${full_name} was added to the watch.`;
    create_watch_message(watch_id, body)
      .then((message_model: Model) => {
        SocketsService.get_io().to(`watch-${watch_id}`).emit(EVENT_TYPES.NEW_WATCH_MESSAGE, {
          event: EVENT_TYPES.NEW_WATCH_MESSAGE,
          data: message_model!.toJSON(),
        });
      });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: new_watch_member_model,
        message: `Watch member added!`
      }
    };
    return serviceMethodResults;
  }

  static async remove_watch_member(opts: {
    you_id: number,
    user_id: number,
    watch_id: number,
  }) {
    const { you_id, user_id, watch_id } = opts;

    const member_model = await get_watch_member_by_user_id_and_watch_id(user_id, watch_id);

    if (!member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user is not a member`
        }
      };
      return serviceMethodResults;
    }
    
    const memberObj: PlainObject = member_model.toJSON();
    const deletes = await member_model.destroy();

    SocketsService.get_io().to(`watch-${watch_id}`).emit(EVENT_TYPES.WATCH_MEMBER_REMOVED, {
      event: EVENT_TYPES.WATCH_MEMBER_REMOVED,
      data: { watch_id, user_id, member: memberObj },
    });

    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.WATCH_MEMBER_REMOVED,
      target_type: NOTIFICATION_TARGET_TYPES.WATCH,
      target_id: watch_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.WATCH_MEMBER_REMOVED,
          data: {
            notification
          },
        });
      });
    });

    const full_name = getUserFullName(memberObj.user);
    const body: string = `${full_name} was removed from the watch.`;

    create_watch_message(watch_id, body).then((message_model: Model) => {
      SocketsService.get_io().to(`watch-${watch_id}`).emit(EVENT_TYPES.NEW_WATCH_MESSAGE, {
        event: EVENT_TYPES.NEW_WATCH_MESSAGE,
        data: message_model!.toJSON(),
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: deletes,
        message: `Watch member removed!`
      }
    };
    return serviceMethodResults;
  }

  static async leave_watch(you_id: number, watch_id: number) {
    const member_model = await get_watch_member_by_user_id_and_watch_id(you_id, watch_id);
    if (!member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `you are not a member`
        }
      };
      return serviceMethodResults;
    }

    const deletes = await member_model.destroy();
    const roomKey = `watch-${watch_id}`;

    const user_model = await get_user_by_id(you_id);
    const user = <IUser> user_model!;
    const full_name = getUserFullName(user);
    const body: string = `${full_name} left the watch.`;

    create_watch_message(watch_id, body).then((message_model: Model) => {
      SocketsService.get_io().to(roomKey).emit(EVENT_TYPES.WATCH_MEMBER_LEFT, {
        event: EVENT_TYPES.WATCH_MEMBER_LEFT,
        data: {
          watch_id,
          user_id: you_id,
          user: user,
        },
      });

      SocketsService.get_io().to(roomKey).emit(EVENT_TYPES.NEW_WATCH_MESSAGE, {
        event: EVENT_TYPES.NEW_WATCH_MESSAGE,
        data: {
          message: message_model!.toJSON(),
        }
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: deletes,
        message: `Left watch!`
      }
    };
    return serviceMethodResults;
  }

  static async search_members(watch_id: number, query: string) {
    let query_term = (<string> query || '').trim().toLowerCase();
    if (!query_term) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `query_term query param is required`
        }
      };
      return serviceMethodResults;
    }

    const member_ids_models = await WatchMembers.findAll({
      where: { watch_id },
      attributes: ['user_id']
    });
    const user_ids = member_ids_models.length ? member_ids_models.map((m: Model) => m.get('user_id')) : [];
    const results = await Users.findAll({
      where: {
        id: { [Op.notIn]: user_ids as number[] },
        allow_watches: true,
        [Op.or]: [
          {
            firstname: where(fn('LOWER', col('firstname')), 'LIKE', '%' + query_term + '%'),
          },
          {
            middlename: where(fn('LOWER', col('middlename')), 'LIKE', '%' + query_term + '%'),
          },
          {
            lastname: where(fn('LOWER', col('lastname')), 'LIKE', '%' + query_term + '%'),
          },
          {
            username: where(fn('LOWER', col('username')), 'LIKE', '%' + query_term + '%'),
          },
        ]
      },
      attributes: [
        ...user_attrs_slim,
        [literal("firstname || ' ' || lastname"), 'full_name']
      ],
      limit: 10
    });

    const newList = [];
    for (const user_model of results) {
      // see if there is a pending request
      const user = <IUser> user_model.toJSON();
      if (user.is_public) {
        (<any> user).member_request = null;
        newList.push(user);
        continue;
      }
      const request_model = await WatchMemberRequests.findOne({
        where: {
          watch_id,
          [Op.or]: [{ user_id: user.id }, { sender_id: user.id }] 
        }
      });
      (<any> user).member_request = request_model && request_model!.toJSON() || null;
      newList.push(user);
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newList
      }
    };
    return serviceMethodResults;
  }

  static async get_watch_messages(opts: {
    you_id: number,
    watch_id: number,
    message_id: number,
  }) {
    const { you_id, watch_id, message_id } = opts;
    const watch_member_model = await WatchMembers.findOne({
      where: { watch_id, user_id: you_id }
    });

    if (!watch_member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not a member of this watch`
        }
      };
      return serviceMethodResults;
    }

    const whereClause: PlainObject = { watch_id };
    if (message_id) {
      whereClause.id = { [Op.lt]: message_id };
    }

    // get all the watches that the user is a part of via when they last opened it
    const watches_last_opened_models = await WatchMessages.findAll({
      where: whereClause,
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }],
      order: [['id', 'DESC']],
      limit: 5
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: watches_last_opened_models
      }
    };
    return serviceMethodResults;
  }

  static async update_watch_last_opened(opts: {
    you_id: number,
    watch_id: number,
  }) {
    const { you_id, watch_id } = opts;

    console.log(`updating last opened for watch`);
    const updates = await WatchLastOpeneds.update({ last_opened: fn('NOW') }, {
      where: { watch_id, user_id: you_id }
    });

    console.log({ updates, watch_id, user_id: you_id });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `watch last opened updated`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  static async create_watch_message(opts: {
    you_id: number,
    watch_id: number,
    parent_message_id: number,
    body: string,
  }) {
    let { you_id, watch_id, parent_message_id, body } = opts;
    body = body && body.trim();

    const watch_member_model = await WatchMembers.findOne({
      where: { watch_id, user_id: you_id }
    });

    if (!watch_member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not a member of this watch`
        }
      };
      return serviceMethodResults;
    }
    
    if (!body) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `message body cannot be empty`
        }
      };
      return serviceMethodResults;
    }

    // get all the watches that the user is a part of via when they last opened it
    const new_watch_message_model = await WatchMessages.create({
      watch_id,
      parent_message_id,
      body,
      owner_id: you_id
    });

    const watch_message_model = await WatchMessages.findOne({
      where: { id: new_watch_message_model.get('id') as number },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    });

    SocketsService.get_io().to(`watch-${watch_id}`).emit(EVENT_TYPES.NEW_WATCH_MESSAGE, {
      event: EVENT_TYPES.NEW_WATCH_MESSAGE,
      data: watch_message_model!.toJSON(),
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `watch message created!`,
        data: watch_message_model
      }
    };
    return serviceMethodResults;
  }

  static async mark_message_as_seen(opts: {
    you_id: number,
    watch_id: number,
    message_id: number,
  }) {
    const { you_id, watch_id, message_id } = opts;

    let seen_message_model: Model | null = await WatchMessageSeens.findOne({
      where: { watch_id, message_id, user_id: you_id, seen: true }
    });
    if (seen_message_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `message already seen`
        }
      };
      return serviceMethodResults;
    }
    seen_message_model = await WatchMessageSeens.create({
      watch_id, message_id, user_id: you_id, seen: true
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `message marked as seen`,
        data: seen_message_model
      }
    };
    return serviceMethodResults;
  }

  static async get_user_watches_all(you_id: number) {
    try {
      // get all the watches that the user is a part of
      const watches_member_models = await get_user_watches_all(you_id);

      const newList: any = [];
      // for each watch, find when user last opened it
      for (const watch_member of watches_member_models) {
        const watchMemberObj: PlainObject = watch_member.toJSON();
        const watch_id = watchMemberObj.watch_id;
        // when a user is added to a watch, a record for last opened is also created; assume there is a record
        const last_opened_model = await WatchLastOpeneds.findOne({
          where: { watch_id, user_id: you_id }
        });
        const last_opened = last_opened_model!.get('last_opened') as string;
        // watchMemberObj.last_opened = last_opened;
        watchMemberObj.watch.last_opened = last_opened;
        // find how many messages are in the watch since the user last opened it
        const unseen_messages_count = await WatchMessages.count({
          where: { watch_id, created_at: { [Op.gt]: last_opened }, owner_id: { [Op.not]: you_id } }
        });
        // watchMemberObj.unseen_messages_count = unseen_messages_count;
        watchMemberObj.watch.unseen_messages_count = unseen_messages_count;
        newList.push(watchMemberObj.watch);
      }

      // sort by last opened

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: newList
        }
      };
      return serviceMethodResults;
    }
    catch (e) {
      console.log(`get_user_watches_all error:`, e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `could not get user watches...`,
          error: e,
        }
      };
      return serviceMethodResults;
    }
  }

  static async get_user_watches_exclude_all(you_id: number) {
    try {
      // get all the watches that the user is a part of
      const watches_member_models = await get_user_watches_exclude_all(you_id);

      const newList: any = [];
      // for each watch, find when user last opened it
      for (const watch_member of watches_member_models) {
        const watchMemberObj: PlainObject = watch_member.toJSON();
        const watch_id = watchMemberObj.watch_id;
        // when a user is added to a watch, a record for last opened is also created; assume there is a record
        const last_opened_model = await WatchLastOpeneds.findOne({
          where: { watch_id, user_id: you_id }
        });
        const last_opened = last_opened_model!.get('last_opened') as string;
        // watchMemberObj.last_opened = last_opened;
        watchMemberObj.watch.last_opened = last_opened;
        // find how many messages are in the watch since the user last opened it
        const unseen_messages_count = await WatchMessages.count({
          where: { watch_id, created_at: { [Op.gt]: last_opened }, owner_id: { [Op.not]: you_id } }
        });
        // watchMemberObj.unseen_messages_count = unseen_messages_count;
        watchMemberObj.watch.unseen_messages_count = unseen_messages_count;
        newList.push(watchMemberObj.watch);
      }

      // sort by last opened

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: newList
        }
      };
      return serviceMethodResults;
    }
    catch (e) {
      console.log(`get_user_watches_all error:`, e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `could not get user watches...`,
          error: e,
        }
      };
      return serviceMethodResults;
    }
  }

  static async get_user_watches(opts: {
    you_id: number,
    watch_timestamp: string,
  }) {
    const { you_id, watch_timestamp } = opts;

    const watches_last_opened_models = await get_user_watches(you_id, watch_timestamp);

    const newList: any = [];
    for (const last_opened_model of watches_last_opened_models) {
      const lastOpenedObj: PlainObject = last_opened_model.toJSON();
      const watch_id = lastOpenedObj.watch_id;
      const last_opened = last_opened_model!.get('last_opened') as string;
      const created_at = { [Op.gt]: last_opened };
      lastOpenedObj.watch.last_opened = last_opened;
      // find how many messages are in the watch since the user last opened it
      const unseen_messages_count = await WatchMessages.count({
        where: { watch_id, created_at }
      });
      // lastOpenedObj.unseen_messages_count = unseen_messages_count;
      lastOpenedObj.watch.unseen_messages_count = unseen_messages_count;
      newList.push(lastOpenedObj.watch);
    }

    // sort by last opened

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.BAD_REQUEST,
      error: true,
      info: {
        data: newList
      }
    };
    return serviceMethodResults;
  }

  static async create_watch(opts: {
    you_id: number,
    title: string,
    icon_file: UploadedFile | undefined,
    coordinates: {
      center: { lat: number, lng: number },
      northEast: { lat: number, lng: number },
      southWest: { lat: number, lng: number },
    },
  }) {
    let { title, you_id, icon_file, coordinates } = opts;
    title = (title || '').trim();

    if (!title) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `title cannot be empty`
        }
      };
      return serviceMethodResults;
    }

    const createObj: PlainObject = {
      title,
      owner_id: you_id,
      swlat: coordinates.southWest.lat,
      swlng: coordinates.southWest.lng,
      nelat: coordinates.northEast.lat,
      nelng: coordinates.northEast.lng,
    };

    const imageValidation = await validateAndUploadImageFile(icon_file, {
      treatNotFoundAsError: false,
      mutateObj: createObj,
      id_prop: 'icon_id',
      link_prop: 'icon_link',
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const new_watch_model = await Watches.create(createObj);
    // add owner as a member of watch
    const watch_id = new_watch_model.get('id') as number;
    const new_watch_last_opened_model = await WatchLastOpeneds.create({
      watch_id,
      user_id: you_id
    });
    const new_watch_member_model = await WatchMembers.create({
      watch_id,
      user_id: you_id
    });

    const watch: IWatch = new_watch_model.toJSON() as IWatch;
    watch.last_opened = new_watch_last_opened_model.get('last_opened') as string;
    watch.members_count = 1;

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Watch created!`,
        data: {
          watch,
          last_opened: new_watch_last_opened_model,
          new_member: new_watch_member_model,
        },
      }
    };
    return serviceMethodResults;
  }

  static async update_watch(opts: {
    watch_id: number,
    title: string,
    icon_file?: UploadedFile,
    coordinates?: {
      center: { lat: number, lng: number },
      northEast: { lat: number, lng: number },
      southWest: { lat: number, lng: number },
    };
  }) {
    let { title, watch_id, icon_file, coordinates } = opts;
    title = (title || '').trim();
    if (!title) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `title cannot be empty`
        }
      };
      return serviceMethodResults;
    }

    const updatesObj: PlainObject = {
      title,
      // swlat: coordinates.southWest.lat,
      // swlng: coordinates.southWest.lng,
      // nelat: coordinates.northEast.lat,
      // nelng: coordinates.northEast.lng,
    };

    const imageValidation = await validateAndUploadImageFile(icon_file, {
      treatNotFoundAsError: false,
      mutateObj: updatesObj,
      id_prop: 'icon_id',
      link_prop: 'icon_link',
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const updates = await Watches.update(updatesObj, { where: { id: watch_id } });
    const watch = await Watches.findByPk(watch_id).then((model) => model && model.toJSON() as IWatch);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Watch updated!`,
        data: {
          watch,
          updates,
        },
      }
    };
    return serviceMethodResults;
  }

  static async delete_watch(watch_id: number) {
    const c_deletes = await Watches.destroy({ where: { id: watch_id } });
    const m_deletes = await WatchMembers.destroy({ where: { watch_id } })
      .then((deletes: any) => {
        // console.log(`removed members for watch: ${watch_id}`, deletes);
      })
      .catch((error: any) => {
        // console.log(`could not remove members for watch: ${watch_id}`, error);
      });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Watch deleted!`,
        data: {
          c_deletes,
          m_deletes,
        }
      }
    };
    return serviceMethodResults;
  }
}

  