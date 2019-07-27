import { Application, Router } from 'express';

export interface AppInterface {
  app: Application;
  router: Router;
}
