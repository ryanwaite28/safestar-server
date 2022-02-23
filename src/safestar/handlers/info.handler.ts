import { Request, Response } from 'express';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { InfoService } from '../services/info.service';



export class InfoRequestHandler {
  @CatchRequestHandlerError()
  static async get_site_info(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = await InfoService.get_site_info();
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  /** External API calls */

  @CatchRequestHandlerError()
  static async get_safety_news(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = await InfoService.get_safety_news();
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}