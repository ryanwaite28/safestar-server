import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { IUser, IRequest, PlainObject } from '../interfaces/safestar.interface';
import { UsersService } from '../services/users.service';



export class UsersRequestHandler {
  @CatchRequestHandlerError()
  static async check_session(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = await UsersService.check_session(request);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_by_id(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.id, 10);
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_user_by_id(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_recent_users(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_recent_users(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_by_phone(request: Request, response: Response): ExpressResponse {
    const phone = request.params.phone;
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_user_by_phone(phone);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async send_feedback(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const rating: number = request.body.rating;
    const title: string = request.body.title;
    const summary: string = request.body.rating;
    const opts = { you, rating, title, summary };
    const serviceMethodResults: ServiceMethodResults = await UsersService.send_feedback(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_unseen_counts(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_unseen_counts(you);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async get_random_users(request: Request, response: Response): ExpressResponse {
    const limit = request.params.limit;
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_random_users(limit);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async sign_up(request: Request, response: Response): ExpressResponse {
    const opts = {
      firstname: request.body.firstname as string,
      middlename: request.body.middlename as string,
      lastname: request.body.lastname as string,
      username: request.body.username as string,
      email: request.body.email as string,
      password: request.body.password as string,
      confirmPassword: request.body.confirmPassword as string,
      host: request.get('origin')! as string
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.sign_up(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async sign_in(request: Request, response: Response): ExpressResponse {
    console.log(request.body);

    const email_or_username: string = (request.body.email_or_username || request.body.email || request.body.username);
    const password: string = request.body.password;
    const serviceMethodResults: ServiceMethodResults = await UsersService.sign_in(email_or_username, password);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async send_sms_verification(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const phone = request.params.phone_number;
    const serviceMethodResults: ServiceMethodResults = await UsersService.send_sms_verification(you, phone);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async verify_sms_code(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      request_id: request.params.request_id as string,
      code: request.params.code as string,
      phone: request.params.phone as string,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.verify_sms_code(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async verify_email(request: Request, response: Response): ExpressResponse {
    const verification_code = request.params.verification_code;
    const serviceMethodResults: ServiceMethodResults = await UsersService.verify_email(verification_code);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_info(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      email: request.body.email as string,
      username: request.body.username as string,
      bio: request.body.bio as string,
      is_public: request.body.is_public as boolean,
      allow_messaging: request.body.allow_messaging as boolean,
      allow_conversations: request.body.allow_conversations as boolean,
      host: request.get('origin')! as string,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_info(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_phone(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      request_id: request.params.request_id as string,
      code: request.params.code as string,
      phone: request.params.phone as string,
      sms_results: (<IRequest> request).session.sms_verification as PlainObject,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_phone(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_password(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      currentPassword: request.body.currentPassword as string,
      password: request.body.password as string,
      confirmPassword: request.body.confirmPassword as string,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_password(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_icon(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      icon_file: request.files && (<UploadedFile> request.files.icon) as UploadedFile | undefined,
      should_delete: !!request.body.should_delete as boolean,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_icon(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_wallpaper(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      wallpaper_file: request.files && (<UploadedFile> request.files.wallpaper) as UploadedFile | undefined,
      should_delete: !!request.body.should_delete as boolean,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_wallpaper(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async update_latest_coordinates(request: Request, response: Response): ExpressResponse {
    const opts = {
      user_id: response.locals.you.id as number,
      lat: request.body.lat,
      lng: request.body.lng,
      automated: !!request.body.automated,

      device: (<any> request).device.type,
      user_agent: request.get('User-Agent') || '',
      ip_addr: request.ip || '',
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_latest_coordinates(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async find_users_by_name(request: Request, response: Response): ExpressResponse {
    const query_term = request.query.query_term as string;
    const serviceMethodResults: ServiceMethodResults = await UsersService.find_users_by_name(query_term);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async find_users_by_username(request: Request, response: Response): ExpressResponse {
    const query_term = request.query.query_term as string;
    const serviceMethodResults: ServiceMethodResults = await UsersService.find_users_by_username(query_term);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async find_users_by_name_or_username(request: Request, response: Response): ExpressResponse {
    const query_term = request.query.query_term as string;
    const serviceMethodResults: ServiceMethodResults = await UsersService.find_users_by_name_or_username(query_term);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_home_page_stats(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;

    const serviceMethodResults: ServiceMethodResults = await UsersService.get_user_home_page_stats(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}
