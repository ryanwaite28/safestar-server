import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import { Op } from 'sequelize';
import { Model } from 'sequelize/types';
import * as CommonRepo from '../repos/_common.repo';
import { create_notification } from '../repos/notifications.repo';
import { ServiceMethodResults } from '../types/safestar.types';
import { TrackingRequests, Trackings } from '../models/tracking.model';
import { EVENT_TYPES, NOTIFICATION_TARGET_TYPES, STATUSES } from '../enums/safestar.enum';
import { Users } from '../models/user.model';
import { user_attrs_slim, populate_notification_obj, compareUserIdArgs } from '../safestar.chamber';
import { CommonSocketEventsHandler } from './common.socket-event-handler';
import { IUser } from '../interfaces/safestar.interface';
import { get_user_by_id } from '../repos/users.repo';
import {
  get_user_trackers_count,
  get_user_trackings_count,
  get_user_trackers_all,
  get_user_trackings_all,
  check_user_tracking_request,
  check_user_tracking,
  get_user_trackers,
  get_user_trackings,
  get_user_tracking_requests_pending_all,
  get_user_tracker_requests_pending_all,
  get_user_tracker_requests_pending,
  get_user_tracking_requests_pending,
  get_user_tracking_requests,
  get_user_tracker_requests,
  get_user_tracking_requests_all,
  get_user_tracker_requests_all
} from '../repos/trackings.repo';
import { ITracking } from '../interfaces/tracking.interface';


export class TrackingsService {
  
  static async check_user_tracking(you_id: number, user_id: number) {
    const compareResults = compareUserIdArgs(you_id, user_id);
    if (compareResults.error) {
      return compareResults;
    }
  
    const check_tracking = await check_user_tracking(you_id, user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: check_tracking
      }
    };
    return serviceMethodResults;
  }

  static async check_user_tracking_request(you_id: number, user_id: number) {
    const compareResults = compareUserIdArgs(you_id, user_id);
    if (compareResults.error) {
      return compareResults;
    }
  
    const check_tracking = await check_user_tracking_request(you_id, user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: check_tracking
      }
    };
    return serviceMethodResults;
  }

  static async request_track_user(you_id: number, user_id: number) {
    const compareResults = compareUserIdArgs(you_id, user_id);
    if (compareResults.error) {
      return compareResults;
    }

    const check_tracking = await Trackings.findOne({
      where: { user_id: you_id, tracking_id: user_id },
    });
    if (check_tracking) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You already track this user`
        }
      };
      return serviceMethodResults;
    }
    
    const check_tracking_request = await TrackingRequests.findOne({
      where: { user_id: you_id, tracking_id: user_id, status: STATUSES.PENDING },
    });
    if (check_tracking_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You already request to track this user`
        }
      };
      return serviceMethodResults;
    }

    const new_tracking_request = await TrackingRequests.create({
      user_id: you_id, 
      tracking_id: user_id,
      status: STATUSES.PENDING,
    });

    // don't block via await
    check_user_tracking_request(you_id, user_id).then((tracking_request: Model | null) => {
      create_notification({
        from_id: you_id,
        to_id: user_id,
        event: EVENT_TYPES.NEW_TRACKER_REQUEST,
        target_type: NOTIFICATION_TARGET_TYPES.USER,
        target_id: user_id
      }).then((notification_model: Model) => {
        populate_notification_obj(notification_model).then((notification) => {
          CommonSocketEventsHandler.emitEventToUserSockets({
            user_id,
            event: EVENT_TYPES.NEW_TRACKER_REQUEST,
            data: {
              notification,
              tracking_request,
            },
          });
        });
      });
    })


    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Tracking request sent!`,
        data: new_tracking_request,
      }
    };
    return serviceMethodResults;
  }

  static async cancel_request_track_user(you_id: number, user_id: number) {
    const compareResults = compareUserIdArgs(you_id, user_id);
    if (compareResults.error) {
      return compareResults;
    }
    
    const check_tracking_request = await TrackingRequests.findOne({
      where: { user_id: you_id, tracking_id: user_id, status: STATUSES.PENDING },
    });
    if (!check_tracking_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You did not request to track this user`
        }
      };
      return serviceMethodResults;
    }

    await check_tracking_request.update({ status: STATUSES.CANCEL }, { fields: ['status'] });

    // don't block via await
    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.NEW_TRACKER_REQUEST_CANCELED,
      target_type: NOTIFICATION_TARGET_TYPES.USER,
      target_id: user_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.NEW_TRACKER_REQUEST_CANCELED,
          data: {
            notification,
            tracking_request: check_tracking_request
          },
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Tracking request canceled!`,
        data: null,
      }
    };
    return serviceMethodResults;
  }

  static async reject_request_track_user(you_id: number, user_id: number) {
    const compareResults = compareUserIdArgs(you_id, user_id);
    if (compareResults.error) {
      return compareResults;
    }
    
    const check_tracking_request = await TrackingRequests.findOne({
      where: { user_id, tracking_id: you_id, status: STATUSES.PENDING },
    });
    if (!check_tracking_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No tracking request found from user`
        }
      };
      return serviceMethodResults;
    }

    await check_tracking_request.update({ status: STATUSES.REJECT }, { fields: ['status'] });

    // don't block via await
    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.NEW_TRACKER_REQUEST_REJECTED,
      target_type: NOTIFICATION_TARGET_TYPES.USER,
      target_id: user_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.NEW_TRACKER_REQUEST_REJECTED,
          data: {
            notification,
            tracking_request: check_tracking_request
          },
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Tracking request rejected!`,
        data: null,
      }
    };
    return serviceMethodResults;
  }

  static async accept_request_track_user(you_id: number, user_id: number) {
    const compareResults = compareUserIdArgs(you_id, user_id);
    if (compareResults.error) {
      return compareResults;
    }
    
    const check_tracking_request = await TrackingRequests.findOne({
      where: { user_id, tracking_id: you_id, status: STATUSES.PENDING },
    });
    if (!check_tracking_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No tracking request found from user`
        }
      };
      return serviceMethodResults;
    }

    await check_tracking_request.update({ status: STATUSES.ACCEPT }, { fields: ['status'] });

    const new_tracking = await Trackings.create({
      user_id, tracking_id: you_id
    });
    const tracking = await check_user_tracking(user_id, you_id);

    // don't block via await
    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.NEW_TRACKER_REQUEST_ACCEPTED,
      target_type: NOTIFICATION_TARGET_TYPES.USER,
      target_id: user_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.NEW_TRACKER_REQUEST_ACCEPTED,
          data: {
            notification,
            tracking,
            tracking_request: check_tracking_request
          },
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Tracking request accepted!`,
        data: tracking
      }
    };
    return serviceMethodResults;
  }

  static async stop_tracking(you_id: number, user_id: number) {
    // the tracker stops tracking the user
    const compareResults = compareUserIdArgs(you_id, user_id);
    if (compareResults.error) {
      return compareResults;
    }

    const check_tracking = await Trackings.findOne({
      where: {
        user_id: you_id,
        tracking_id: user_id
      },
    });
    if (!check_tracking) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not tracking this user`
        }
      };
      return serviceMethodResults;
    }

    const deletes = await check_tracking.destroy();

    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.STOP_TRACKING,
      target_type: NOTIFICATION_TARGET_TYPES.USER,
      target_id: user_id
    }).then(async (notification_model) => {
      const notification = await populate_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: user_id,
        event: EVENT_TYPES.STOP_TRACKING,
        data: {
          notification,
          deletes,
          tracking: check_tracking,
        }
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Stopped tracking!`,
        data: {
          deletes,
          tracking: check_tracking,
        }
      }
    };
    return serviceMethodResults;
  }

  static async stop_tracker(you_id: number, user_id: number) {
    // the tracker stops tracking the user
    const compareResults = compareUserIdArgs(you_id, user_id);
    if (compareResults.error) {
      return compareResults;
    }

    const check_tracking = await Trackings.findOne({
      where: {
        user_id,
        tracking_id: you_id
      },
    });
    if (!check_tracking) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `User is not tracking this you`
        }
      };
      return serviceMethodResults;
    }

    const deletes = await check_tracking.destroy();

    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.STOP_TRACKER,
      target_type: NOTIFICATION_TARGET_TYPES.USER,
      target_id: user_id
    }).then(async (notification_model) => {
      const notification = await populate_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: user_id,
        event: EVENT_TYPES.STOP_TRACKER,
        data: {
          notification,
          deletes,
          tracking: check_tracking,
        }
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Stopped tracker!`,
        data: {
          deletes,
          tracking: check_tracking,
        }
      }
    };
    return serviceMethodResults;
  }

  static async get_user_trackers_count(user_id: number) {
    const trackers_count = await get_user_trackers_count(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: trackers_count
      }
    };
    return serviceMethodResults;
  }

  static async get_user_trackings_count(user_id: number) {
    const trackings_count = await get_user_trackings_count(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: trackings_count
      }
    };
    return serviceMethodResults;
  }

  static async get_user_trackers_all(user_id: number) {
    const results: ITracking[] = await get_user_trackers_all(user_id);

    const serviceMethodResults: ServiceMethodResults<ITracking[]> = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_trackings_all(user_id: number) {
    const results = await get_user_trackings_all(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_trackers(user_id: number, tracking_id?: number) {
    const results = await get_user_trackers(user_id, tracking_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_trackings(user_id: number, tracking_id: number) {
    const results = await get_user_trackings(user_id, tracking_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }


  static async get_user_tracker_requests_all(user_id: number) {
    const results = await get_user_tracker_requests_all(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_tracking_requests_all(user_id: number) {
    const results = await get_user_tracking_requests_all(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_tracker_requests(user_id: number, tracking_id?: number) {
    const results = await get_user_tracker_requests(user_id, tracking_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_tracking_requests(user_id: number, tracking_id: number) {
    const results = await get_user_tracking_requests(user_id, tracking_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }


  static async get_user_tracker_requests_pending_all(user_id: number) {
    const results = await get_user_tracker_requests_pending_all(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_tracking_requests_pending_all(user_id: number) {
    const results = await get_user_tracking_requests_pending_all(user_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_tracker_requests_pending(user_id: number, tracking_id: number) {
    const results = await get_user_tracker_requests_pending(user_id, tracking_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async get_user_tracking_requests_pending(user_id: number, tracking_id: number) {
    const results = await get_user_tracking_requests_pending(user_id, tracking_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }
}