import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  fn,
  Op,
  col,
  cast
} from 'sequelize';
import { Model } from 'sequelize/types';
import { IUser, PlainObject } from '../interfaces/safestar.interface';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../types/safestar.types';
import { IPhotoPulse, IPhotoPulseMessage } from '../interfaces/pulse.interface';
import {
  get_photo_pulse_by_id,
  get_recent_photo_pulses,
  get_user_photo_pulses_count,
  get_user_photo_pulses_all,
  get_user_photo_pulses,
  get_photo_pulse_messages_all,
  get_photo_pulse_messages,
  create_photo_pulse,
  create_photo_pulse_message,
  mark_photo_pulse_as_sent_in_error,
} from '../repos/photo-pulses.repo';
import { create_pulse_required_props, create_pulse_message_required_props, validateData, validateAndUploadImageFile, populate_notification_obj } from '../safestar.chamber';
import { EVENT_TYPES, NOTIFICATION_TARGET_TYPES, PULSE_CODES } from '../enums/safestar.enum';
import { UploadedFile } from 'express-fileupload';
import { create_notification } from '../repos/notifications.repo';
import { find_users_within_radius_of_point } from '../repos/users.repo';
import { CommonSocketEventsHandler } from './common.socket-event-handler';
import { TrackingsService } from './trackings.service';



export class PhotoPulsesService {
  static async get_photo_pulse_by_id(photo_pulse_id: number) {
    const photo_pulse: IPhotoPulse | null = await get_photo_pulse_by_id(photo_pulse_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: photo_pulse,
      }
    };
    return serviceMethodResults;
  }

  static async get_recent_photo_pulses(owner_id: number) {
    const photo_pulses: IPhotoPulse[] = await get_recent_photo_pulses(owner_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: photo_pulses,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_photo_pulses_count(owner_id: number) {
    const photo_pulsesCount: number = await get_user_photo_pulses_count(owner_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: photo_pulsesCount,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_photo_pulses_all(owner_id: number) {
    const photo_pulses: IPhotoPulse[] = await get_user_photo_pulses_all(owner_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: photo_pulses,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_photo_pulses(owner_id: number, photo_pulse_id: number) {
    const photo_pulses: IPhotoPulse[] = await get_user_photo_pulses(owner_id, photo_pulse_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: photo_pulses,
      }
    };
    return serviceMethodResults;
  }

  static async get_photo_pulse_messages_all(photo_pulse_id: number) {
    const photo_pulseMessages: IPhotoPulseMessage[] = await get_photo_pulse_messages_all(photo_pulse_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: photo_pulseMessages,
      }
    };
    return serviceMethodResults;
  }

  static async get_photo_pulse_messages(photo_pulse_id: number, photo_pulse_message_id: number) {
    const photo_pulseMessages: IPhotoPulseMessage[] = await get_photo_pulse_messages(photo_pulse_id, photo_pulse_message_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: photo_pulseMessages,
      }
    };
    return serviceMethodResults;
  }

  static async create_photo_pulse(params: {
    lat: number,
    lng: number,
    code: string,
    owner_id: number,
    pulse_image?: UploadedFile
  }) {
    const dataValidation = validateData({
      data: params, 
      validators: create_pulse_required_props,
    });
    if (dataValidation.error) {
      return dataValidation;
    }

    const createObj: any = {};
    const imageValidation = await validateAndUploadImageFile(params.pulse_image, {
      treatNotFoundAsError: true,
      mutateObj: createObj,
      id_prop: 'photo_id',
      link_prop: 'photo_link',
    });
    if (imageValidation.error) {
      return imageValidation;
    }
    
    const photo_pulse: IPhotoPulse = await create_photo_pulse({
      lat: params.lat,
      lng: params.lat,
      owner_id: params.owner_id,
      photo_id: createObj.photo_id as string,
      photo_link: createObj.photo_link as string,
      code: params.code as PULSE_CODES,
    });

    /*
      async/background task:

      notify all users that are tracking this user or are with 10 miles of pulse location
    */

      const notify = async () => {
        const user_trackers = await TrackingsService.get_user_trackers_all(params.owner_id);
        find_users_within_radius_of_point(params.lat, params.lat, params.owner_id)
          .then((local_users) => {
            const use_local_users = local_users.filter(user => (<any> user).distance <= 10);
  
            const user_ids_from_trackers = user_trackers.info.data!.map(tracker => tracker.user_id);
            const user_ids_from_local_users = use_local_users.map(user => user.id);
            const userIdsSet = new Set<number>([ ...user_ids_from_trackers, ...user_ids_from_local_users ]);
            
            for (const user_id of userIdsSet) {
              // create notification, send socket event and send push notification
              create_notification({
                from_id: params.owner_id,
                to_id: user_id,
                event: EVENT_TYPES.NEW_PHOTO_PULSE,
                target_type: NOTIFICATION_TARGET_TYPES.PHOTO_PULSE,
                target_id: photo_pulse.id
              }).then((notification_model: Model) => {
                populate_notification_obj(notification_model).then((notification) => {
                  CommonSocketEventsHandler.emitEventToUserSockets({
                    user_id,
                    event: EVENT_TYPES.NEW_PHOTO_PULSE,
                    data: {
                      notification,
                      photo_pulse,
                    },
                  });
  
                  
                });
              });
            }
          }).catch((error) => {
            console.error(error);
          });
    };
  
    notify();

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: photo_pulse,
      }
    };
    return serviceMethodResults;
  }

  static async create_photo_pulse_message(params: {
    body: string,
    owner_id: number,
    photo_pulse_id: number,
  }) {
    const dataValidation = validateData({
      data: params, 
      validators: create_pulse_message_required_props,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    
    const photo_pulseMessage: IPhotoPulseMessage = await create_photo_pulse_message(params);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: photo_pulseMessage,
      }
    };
    return serviceMethodResults;
  }

  static async mark_photo_pulse_as_sent_in_error(owner_id: number, photo_pulse_id: number) {
    const photo_pulse = await get_photo_pulse_by_id(photo_pulse_id);
    if (!photo_pulse) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.NOT_FOUND,
        error: true,
        info: {
          message: `Photo Pulse not found`
        }
      };
      return serviceMethodResults;
    }
    if (photo_pulse.owner_id !== owner_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Not photo pulse owner`
        }
      };
      return serviceMethodResults;
    }
    
    const updates = await mark_photo_pulse_as_sent_in_error(photo_pulse_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Photo Pulse updated successfully`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }
}
  