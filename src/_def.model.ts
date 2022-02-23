import * as Sequelize from 'sequelize';
import { InitOptions } from 'sequelize';

let sequelize: Sequelize.Sequelize;
let db_env: string;

if (process.env.DATABASE_URL) {
  try {
    console.log(`process.env.DATABASE_URL:`, process.env.DATABASE_URL);
    db_env = 'Production PostgreSQL';
    sequelize = new Sequelize.Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  } catch (e) {
    console.log(e);
    console.log(`error connecting to prod postgresql database; using local sqlite...`);
    
    throw e;
  }
} else if (process.env.DATABASE_URL_DEV) {
  try {
    console.log(`process.env.DATABASE_URL_DEV:`, process.env.DATABASE_URL_DEV);
    db_env = 'Development PostgreSQL';
    sequelize = new Sequelize.Sequelize(<string> process.env.DATABASE_URL_DEV, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: false,
        rejectUnauthorized: false
      },
      logging: false
    });
  } catch (e) {
    console.log(e);
    console.log(`error connecting to dev postgresql database; using local sqlite...`);
    
    db_env = 'Development (sqlite)';
    sequelize = new Sequelize.Sequelize('database', 'username', 'password', {
      dialect: 'sqlite',
      storage: 'database.sqlite',
      logging: false
    });
  }
} else {
  db_env = 'Development (sqlite)';
  sequelize = new Sequelize.Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
  });
}

export const sequelizeInst = sequelize;
export const DB_ENV = db_env;

export const common_model_options: InitOptions = {
  sequelize: sequelizeInst,
  paranoid: true,
  timestamps: true,
  freezeTableName: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
};
