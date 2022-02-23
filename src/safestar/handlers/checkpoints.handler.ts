import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { IUser, IRequest, PlainObject } from '../interfaces/safestar.interface';
import { CheckpointsService } from '../services/checkpoints.service';



export class CheckpointsRequestHandler {
  @CatchRequestHandlerError()
  static async get_recent_checkpoints(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_recent_checkpoints(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async get_checkpoint_by_id(request: Request, response: Response): ExpressResponse {
    const checkpoint_id: number = parseInt(request.params.checkpoint_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_checkpoint_by_id(checkpoint_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async get_user_to_user_checkpoints(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.you_id, 10);
    const check_id: number = parseInt(request.params.user_id, 10);
    const opts = { user_id, check_id };
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_user_to_user_checkpoints(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async check_user_to_user_checkpoint_pending(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.you_id, 10);
    const check_id: number = parseInt(request.params.user_id, 10);
    const opts = { user_id, check_id };
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.check_user_to_user_checkpoint_pending(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async get_user_checkpoints_sent_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_user_checkpoints_sent_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_checkpoints_sent(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const checkpoint_id: number = parseInt(request.params.checkpoint_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_user_checkpoints_sent(user_id, checkpoint_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_checkpoints_received_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_user_checkpoints_received_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_checkpoints_received(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const checkpoint_id: number = parseInt(request.params.checkpoint_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_user_checkpoints_received(user_id, checkpoint_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_checkpoints_sent_all_pending(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_user_checkpoints_sent_all_pending(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_checkpoints_sent_pending(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const checkpoint_id: number = parseInt(request.params.checkpoint_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_user_checkpoints_sent_pending(user_id, checkpoint_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_checkpoints_received_all_pending(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_user_checkpoints_received_all_pending(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_checkpoints_received_pending(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const checkpoint_id: number = parseInt(request.params.checkpoint_id, 10);
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.get_user_checkpoints_received_pending(user_id, checkpoint_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }



  @CatchRequestHandlerError()
  static async create_send_user_checkpoint(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.you_id, 10);
    const check_id: number = parseInt(request.params.user_id, 10);
    const opts = { user_id, check_id };
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.create_send_user_checkpoint(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async respond_to_user_checkpoint_pending(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const check_id: number = parseInt(request.params.you_id, 10);
    const opts = { user_id, check_id };
    const serviceMethodResults: ServiceMethodResults = await CheckpointsService.respond_to_user_checkpoint_pending(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}
  