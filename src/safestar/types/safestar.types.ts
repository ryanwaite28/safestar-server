import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { IModelValidator, IMyModel } from '../interfaces/safestar.interface';
import { BuildOptions, Model } from 'sequelize/types';



export type ExpressMiddlewareFn = (
  request: Request, 
  response: Response, 
  next: NextFunction
) => Promise<void | Response<any>>;

export type ExpressResponse = Promise<Response<any>>;
export type ExpressRouteEndHandler = (
  request: Request, 
  response: Response
) => ExpressResponse;


export interface ServiceMethodResultsInfo<T = any> {
  message?: string;
  data?: T;
  error?: any;
};

/**
 * @interface ServiceMethodResults
 * 
 * @description
 * Interface for a service method return value.
 * - status: uses an http code to signify result of action
 * - error: flag to indicate if there was an error
 * - info: object that serves as details about the results
 */
export type ServiceMethodResults<T = any> = {
  status: HttpStatusCode,
  error: boolean,
  info: ServiceMethodResultsInfo<T>,
};

export type ServiceMethodAsyncResults<T = any> = Promise<ServiceMethodResults<T>>;

export type ModelValidators = IModelValidator[];

export type MyModelStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): IMyModel | Model;
};

export type MyModelStaticGeneric<T> = typeof Model & {
  new (values?: object, options?: BuildOptions): T;
};