import {
  CookieOptions,
  Request,
  Response,
} from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import moment from 'moment';
import { v1 as uuidv1 } from 'uuid';
import { ServiceMethodResults } from '../types/safestar.types';
import { generateJWT } from '../safestar.chamber';


const cookieOptions: CookieOptions = {
  httpOnly: false,
  path: `/`,
  // domain: process.env.NODE_ENV && process.env.NODE_ENV === 'production' ? 'https://rmw-modern-client.herokuapp.com' : undefined,
  sameSite: 'none',
  secure: true,
  // expires: 
};


export class UtilsService {
  static set_xsrf_token(response: Response): ServiceMethodResults {
    const token = generateJWT(process.env.APP_SECRET);
    
    response.cookie('xsrf-token', token, cookieOptions as CookieOptions);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `new xsrf-token cookie sent.`,
      }
    };
    return serviceMethodResults;
  }

  static set_xsrf_token_pair(response: Response): ServiceMethodResults {
    const datetime = new Date().toISOString();
    const jwt = generateJWT(datetime);
    
    response.cookie('xsrf-token-a', datetime, cookieOptions as CookieOptions);
    response.cookie('xsrf-token-b', jwt, cookieOptions as CookieOptions);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `new xsrf-token cookies sent.`,
      }
    };
    return serviceMethodResults;
  }

  static get_google_maps_key(): ServiceMethodResults {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!key) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.SERVICE_UNAVAILABLE,
        error: true,
        info: {
          message: `Google maps instance/service is not available on this app right now; please try again later.`
        }
      };
      return serviceMethodResults;
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: {
          key,
        }
      }
    };
    return serviceMethodResults;
  }
}