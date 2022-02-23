import {
  DB_ENV,
  sequelizeInst as sequelize
} from './_def.model';



/** Init Database */

export const db_init = async () => {
  console.log({
    DB_ENV,
    // sequelize,
    // process_env: process.env,
  });

  // await Photos.sync({ alter: true });
  // await Videos.sync({ alter: true });
  // await Audios.sync({ alter: true });

  // console.log(`--- altering done ---`);

  return sequelize.sync({ force: false, alter: true })
    .then(() => {
      console.log('\n\nDatabase Initialized! ENV: ' + DB_ENV);
    })
    .catch((error) => {
      console.log('\n\nDatabase Failed!', error);
      throw error;
    });
};