import * as bodyParser from 'body-parser';
import * as express from 'express';

import { AppInterface } from './app.interface';
import { UploadedFileRoutes } from '../fileUpload/fileUpload.routes';

class App implements AppInterface {
  app: express.Application;
  router: express.Router;

  constructor() {
    this.app = express();
    // support application/json type post data
    this.app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({ extended: false }));
    //this is default code frome the mongoose documentation to initialize an express.Router type
    this.router = express.Router();
    //load the routes from fileUpload.routes.ts
    UploadedFileRoutes.attachRoutes(this.router);

    //attach the router to the app
    this.app.use('/', this.router);
  }
}

//return a singleton
//creating this new App also runs the constructor code when we import it in index.ts and bootstraps this to run as we start up the application
const app: App = new App();
export { app as App };
