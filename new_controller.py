from calendar import c
import os, sys



cli_args = sys.argv[1:]

if len(cli_args) < 2:
  print("Not enough args given")
  sys.exit(1)

artifact = cli_args.pop(0)
print("Artifact", artifact)
CWD = os.getcwd()

GUARDS_PATH = os.path.join(CWD, './src/safestar/guards')
HANDLERS_PATH = os.path.join(CWD, './src/safestar/handlers')
INTERFACES_PATH = os.path.join(CWD, './src/safestar/interfaces')
MODELS_PATH = os.path.join(CWD, './src/safestar/models')
REPOS_PATH = os.path.join(CWD, './src/safestar/repos')
ROUTERS_PATH = os.path.join(CWD, './src/safestar/routers')
SERVICES_PATH = os.path.join(CWD, './src/safestar/services')





def create_guard_file():
  artifact_file = os.path.join(GUARDS_PATH, artifact + '.guard.ts')
  if os.path.isfile(artifact_file):
    print("Guard already exists for artifact; exiting...")
    sys.exit(1)

  f = open(artifact_file, "w")
  f.write(
  '''import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { Modells } from '../models/modell.model';



export async function ModellExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const modell_id = parseInt(request.params.modell_id, 10);
  const modell_model = await Modells.findOne({
    where: { id: modell_id }
  });
  if (!modell_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Modell not found`
    });
  }
  response.locals.modell_model = modell_model;
  return next();
}
export async function IsModellOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const modell_model = response.locals.modell_model;
  if (!modell_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Modell not found`
    });
  }
  const isNotOwner = parseInt(modell_model.get('owner_id'), 10) !== you_id;
  if (isNotOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `You are not the modell owner`
    });
  }

  return next();
}
export async function IsNotModellOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const modell_model = response.locals.modell_model;
  if (!modell_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Modell not found`
    });
  }
  const isOwner = parseInt(modell_model.get('owner_id'), 10) === you_id;
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User cannot perform action for modell they own`
    });
  }

  return next();
}
  '''.replace('Modell', artifact[0].upper() + artifact[1:]).replace('modell', artifact)
  )
  f.close()

def create_handler_file():
  artifact_file = os.path.join(HANDLERS_PATH, artifact + 's.handler.ts')
  if os.path.isfile(artifact_file):
    print("Guard already exists for artifact; exiting...")
    sys.exit(1)

  f = open(artifact_file, "w")
  f.write(
  '''import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { IUser, IRequest, PlainObject } from '../interfaces/safestar.interface';



export class ModellsRequestHandler {
  // @CatchRequestHandlerError()
  // static async method(request: Request, response: Response): ExpressResponse {
  //   const serviceMethodResults: ServiceMethodResults = await method(request);
  //   return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  // }
}
  '''.replace('Modell', artifact[0].upper() + artifact[1:]).replace('modell', artifact)
  )
  f.close()


def create_interface_file():
  artifact_file = os.path.join(INTERFACES_PATH, artifact + '.interface.ts')
  if os.path.isfile(artifact_file):
    print("Guard already exists for artifact; exiting...")
    sys.exit(1)

  f = open(artifact_file, "w")
  f.write(
  '''import { ICommonModel, IUser } from "./safestar.interface";


export interface IModell extends ICommonModel {
  
}
  '''.replace('Modell', artifact[0].upper() + artifact[1:]).replace('modell', artifact)
  )
  f.close()


def create_model_file():
  artifact_file = os.path.join(MODELS_PATH, artifact + '.model.ts')
  if os.path.isfile(artifact_file):
    print("Guard already exists for artifact; exiting...")
    sys.exit(1)

  f = open(artifact_file, "w")
  f.write(
  '''import { common_model_options } from '../../_def.model';
import { Model, DataTypes } from 'sequelize';
import { Users } from './user.model';


/*
export class Modell extends Model {}
Modell.init({
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:             { type: DataTypes.INTEGER, allowNull: false, references: { model: Users, key: 'id' } },
  
  uuid:                 { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV1 },
}, {
  ...common_model_options,
  tableName: 'safestar_pulses',
  modelName: 'pulse',
});*/
  '''.replace('Modell', artifact[0].upper() + artifact[1:]).replace('modell', artifact)
  )
  f.close()


def create_repo_file():
  artifact_file = os.path.join(REPOS_PATH, artifact + 's.repo.ts')
  if os.path.isfile(artifact_file):
    print("Guard already exists for artifact; exiting...")
    sys.exit(1)

  f = open(artifact_file, "w")
  f.write(
  '''import {
  fn,
  Op,
  WhereOptions
} from 'sequelize';
import { Model } from 'sequelize/types';
import { IUser } from '../interfaces/safestar.interface';
import { Users } from '../models/user.model';
import { convertModels, user_attrs_slim, convertModel } from '../safestar.chamber';
import { Modells } from '../models/modell.model';



export async function get_modell_by_id(id: number) {
  return Modells.findOne({
      where: { id },
    })
    .then((model: Model | any) => {
      return convertModel<any>(model);
    });
}
  '''.replace('Modell', artifact[0].upper() + artifact[1:]).replace('modell', artifact)
  )
  f.close()


def create_router_file():
  artifact_file = os.path.join(ROUTERS_PATH, artifact + 's.router.ts')
  if os.path.isfile(artifact_file):
    print("Guard already exists for artifact; exiting...")
    sys.exit(1)

  f = open(artifact_file, "w")
  f.write(
  '''import { Router, Request, Response } from 'express';

export const ModellsRouter: Router = Router({ mergeParams: true });
  '''.replace('Modell', artifact[0].upper() + artifact[1:]).replace('modell', artifact)
  )
  f.close()


def create_service_file():
  artifact_file = os.path.join(SERVICES_PATH, artifact + 's.service.ts')
  if os.path.isfile(artifact_file):
    print("Guard already exists for artifact; exiting...")
    sys.exit(1)

  f = open(artifact_file, "w")
  f.write(
  '''import {
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



export class ModellsService {
  // static async method(): ServiceMethodAsyncResults {

  // }
}
  '''.replace('Modell', artifact[0].upper() + artifact[1:]).replace('modell', artifact)
  )
  f.close()





seen_constructs = {}
for construct in cli_args:
  if construct in seen_constructs:
    continue

  seen_constructs[construct] = True

  if construct == 'guard':
    create_guard_file()

  elif construct == 'handler':
    create_handler_file()

  elif construct == 'interface':
    create_interface_file()

  elif construct == 'model':
    create_model_file()

  elif construct == 'repo':
    create_repo_file()

  elif construct == 'router':
    create_router_file()

  elif construct == 'service':
    create_service_file()