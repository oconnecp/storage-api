import { connect } from 'mongoose';

import { Configuration } from './configuration';
import { App } from './express/app';

class Index {
  constructor() {
    //we have definded the mongo connection string in configuration
    //start a connection
    connect(
      Configuration.mongooseConnection,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
      }
    )
      .then(() => {
        console.log(
          `Connected to the Mongo server @: ${Configuration.mongooseConnection}`
        );
      })
      .catch(() => {
        console.log(
          `Could NOT connect to server @: ${Configuration.mongooseConnection}`
        );
        process.exit(1);
      });

    const expressServerPort = Configuration.expressServerPort;
    //start listening
    App.app.listen(expressServerPort);
    console.log(`App is now listening on: ${expressServerPort}`);
  }
}

//return a singleton
//this also acts as the bootstrapping to run the constructor code when we start the application
const index: Index = new Index();
export { index as Index };
