import { Router } from 'express';
import {
  XSRF_PROTECTED_2
} from '../guards/xsrf.guard';
import { UtilsRequestHandler } from '../handlers/utils.handler';

export const UtilsRouter: Router = Router({ mergeParams: true });

UtilsRouter.get('/get-xsrf-token', UtilsRequestHandler.get_xsrf_token);
UtilsRouter.get('/get-xsrf-token-pair', UtilsRequestHandler.get_xsrf_token_pair);

UtilsRouter.post('/get-google-api-key', XSRF_PROTECTED_2, UtilsRequestHandler.get_google_maps_key);