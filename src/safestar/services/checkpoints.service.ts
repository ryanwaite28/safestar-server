import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  fn,
  Op,
  col,
  cast
} from 'sequelize';
import { IUser, PlainObject } from '../interfaces/safestar.interface';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../types/safestar.types';
import { ICheckpoint } from '../interfaces/checkpoint.interface';
import {
  get_recent_checkpoints,
  get_user_to_user_checkpoints,
  create_send_user_checkpoint,
  check_user_to_user_checkpoint_pending,
  get_checkpoint_by_id,
  get_user_checkpoints_received,
  get_user_checkpoints_received_all,
  get_user_checkpoints_sent,
  get_user_checkpoints_sent_all,
  get_user_checkpoints_received_all_pending,
  get_user_checkpoints_received_pending,
  get_user_checkpoints_sent_all_pending,
  get_user_checkpoints_sent_pending,
} from '../repos/checkpoints.repo';
import { compareUserIdArgs, populate_notification_obj } from '../safestar.chamber';
import { create_notification } from '../repos/notifications.repo';
import { EVENT_TYPES, NOTIFICATION_TARGET_TYPES } from '../enums/safestar.enum';
import { CommonSocketEventsHandler } from './common.socket-event-handler';



export class CheckpointsService {
  static async get_recent_checkpoints(user_id: number) {
    const checkpoints: ICheckpoint[] = await get_recent_checkpoints(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoints
      }
    };
    return serviceMethodResults;
  }

  static async get_checkpoint_by_id(id: number) {
    const checkpoint: ICheckpoint | null = await get_checkpoint_by_id(id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoint
      }
    };
    return serviceMethodResults;
  }

  static async check_user_to_user_checkpoint_pending(params: {
    user_id: number,
    check_id: number,
  }) {
    const compareResults = compareUserIdArgs(params.user_id, params.check_id);
    if (compareResults.error) {
      return compareResults;
    }

    const checkpoint_pending = await check_user_to_user_checkpoint_pending(params);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoint_pending
      }
    };
    return serviceMethodResults;
  }



  static async get_user_checkpoints_sent_all(user_id: number) {
    const checkpoints: ICheckpoint[] = await get_user_checkpoints_sent_all(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoints
      }
    };
    return serviceMethodResults;
  }

  static async get_user_checkpoints_sent(user_id: number, min_id?: number) {
    const checkpoints: ICheckpoint[] = await get_user_checkpoints_sent(user_id, min_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoints
      }
    };
    return serviceMethodResults;
  }

  static async get_user_checkpoints_received_all(user_id: number) {
    const checkpoints: ICheckpoint[] = await get_user_checkpoints_received_all(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoints
      }
    };
    return serviceMethodResults;
  }

  static async get_user_checkpoints_received(user_id: number, min_id?: number) {
    const checkpoints: ICheckpoint[] = await get_user_checkpoints_received(user_id, min_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoints
      }
    };
    return serviceMethodResults;
  }


  static async get_user_checkpoints_sent_all_pending(user_id: number) {
    const checkpoints: ICheckpoint[] = await get_user_checkpoints_sent_all_pending(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoints
      }
    };
    return serviceMethodResults;
  }

  static async get_user_checkpoints_sent_pending(user_id: number, min_id?: number) {
    const checkpoints: ICheckpoint[] = await get_user_checkpoints_sent_pending(user_id, min_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoints
      }
    };
    return serviceMethodResults;
  }

  static async get_user_checkpoints_received_all_pending(user_id: number) {
    const checkpoints: ICheckpoint[] = await get_user_checkpoints_received_all_pending(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoints
      }
    };
    return serviceMethodResults;
  }

  static async get_user_checkpoints_received_pending(user_id: number, min_id?: number) {
    const checkpoints: ICheckpoint[] = await get_user_checkpoints_received_pending(user_id, min_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoints
      }
    };
    return serviceMethodResults;
  }


  static async create_send_user_checkpoint(params: {
    user_id: number,
    check_id: number,
  }) {
    const compareResults = compareUserIdArgs(params.user_id, params.check_id);
    if (compareResults.error) {
      return compareResults;
    }

    const checkpoint_pending = await check_user_to_user_checkpoint_pending(params);
    if (checkpoint_pending) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Checkpoint already sent`,
          data: checkpoint_pending
        }
      };
      return serviceMethodResults;
    }

    const new_checkpoint = await create_send_user_checkpoint(params);

    create_notification({
      from_id: params.user_id,
      to_id: params.check_id,
      event: EVENT_TYPES.NEW_CHECKPOINT,
      target_type: NOTIFICATION_TARGET_TYPES.CHECKPOINT,
      target_id: new_checkpoint.id,
    }).then((notification_model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: params.check_id,
          event: EVENT_TYPES.NEW_CHECKPOINT,
          data: {
            notification,
            checkpoint: new_checkpoint,
          },
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: new_checkpoint
      }
    };
    return serviceMethodResults;
  }

  static async get_user_to_user_checkpoints(params: {
    user_id: number,
    check_id: number,
  }) {
    const compareResults = compareUserIdArgs(params.user_id, params.check_id);
    if (compareResults.error) {
      return compareResults;
    }

    const checkpoint_pending = await get_user_to_user_checkpoints(params);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoint_pending
      }
    };
    return serviceMethodResults;
  }

  static async respond_to_user_checkpoint_pending(params: {
    user_id: number, // user
    check_id: number, // you
  }) {
    const compareResults = compareUserIdArgs(params.user_id, params.check_id);
    if (compareResults.error) {
      return compareResults;
    }

    const checkpoint_pending = await check_user_to_user_checkpoint_pending(params);
    if (!checkpoint_pending) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No pending checkpoint`,
          data: checkpoint_pending
        }
      };
      return serviceMethodResults;
    }

    await checkpoint_pending.update({ date_check_responded: new Date() }, { fields: ['date_check_responded'] });

    create_notification({
      from_id: params.check_id,
      to_id: params.user_id,
      event: EVENT_TYPES.NEW_CHECKPOINT_RESPONSE,
      target_type: NOTIFICATION_TARGET_TYPES.CHECKPOINT,
      target_id: checkpoint_pending.get('id') as number,
    }).then((notification_model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: params.user_id,
          event: EVENT_TYPES.NEW_CHECKPOINT_RESPONSE,
          data: {
            notification,
            checkpoint: checkpoint_pending.toJSON(),
          },
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: checkpoint_pending.toJSON()
      }
    };
    return serviceMethodResults;
  }
}
  