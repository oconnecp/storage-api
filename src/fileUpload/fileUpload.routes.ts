import * as express from 'express';
import { Request, Response } from 'express';
import { existsSync, promises as fsPromises } from 'fs';
import * as multer from 'multer';
import { join } from 'path';

import { Configuration } from '../configuration';
import { UploadedFileController } from './fileUpload.controller';

interface RoutesInterface {
  attachRoutes: (router: express.Router) => express.Router;
}

class UploadedFileRoutes implements RoutesInterface {
  constructor() {
    //these routes use multer that has a downloadLocation, if the downloadLocation does not exist the application will not work
    //if the downloadLocation does not exist, create it
    const downloadLocationExists = existsSync(Configuration.downloadLocation);
    if (!downloadLocationExists) {
      fsPromises
        .mkdir(Configuration.downloadLocation)
        .then(() => {
          console.log(
            `Download location: ${Configuration.downloadLocation} created successfully`
          );
        })
        .catch(error => {
          console.log(`Download location doesn't exist and can't be created`);
          console.log(error.message);
          process.exit(1);
        });
    }
  }

  //Define the router and create upload and download
  attachRoutes = (router: express.Router) => {
    //multer handles the file upload for express and is used as a handler in the post
    const upload = multer({ dest: Configuration.downloadLocation });

    //the upload route
    router.post(
      '/file',
      upload.single('uploadedFile'),
      (req: Request, res: Response) => {
        UploadedFileController.saveFile(req.file)
          .then(newFile => {
            res.send(newFile.savedFilename);
          })
          .catch(error => {
            console.error(`Error uploading file: ${error.message}`);
            res.status(500).send(error.message);
          });
      }
    );

    //the download route
    router.get('/file/:uploadedFilename', (req: Request, res: Response) => {
      UploadedFileController.findFile(req.params.uploadedFilename)
        .then(foundFile => {
          //res.download automatically attaches the originalFileName but in an ugly format,
          //this will make it easier for programming in a front end
          res.header({ 'File-Name': foundFile.originalFilename });
          //res.download reads and sends the file to the client
          res.download(
            join(Configuration.downloadLocation, foundFile.savedFilename),
            foundFile.originalFilename
          );
        })
        .catch((error: Error) => {
          //there was either an error with mongo or there was no file found, send this information to the client
          console.error(error.message);
          res.status(500).send(error.message);
        });
    });

    //files route supporting pagination
    router.get('/files', (req: Request, res: Response) => {
      UploadedFileController.retrieveFiles(req.query.page, req.query.pageSize)
        .then(retrieveFileObject => {
          res.header({ nextPage: retrieveFileObject.nextPage });
          res.header({ pageSize: retrieveFileObject.pageSize });
          res.send(retrieveFileObject.foundFiles);
        })
        .catch(error => {
          console.error(`Error finding files: ${error.message}`);
          res.status(500).send(error.message);
        });
    });

    //the delete route
    router.delete(`/file/:uploadedFilename`, (req: Request, res: Response) => {
      UploadedFileController.deleteFile(req.params.uploadedFilename)
        .then(() => {
          //todo: create a s response object
          res.send('todo: finish delete route');
        })
        .catch(error => {
          console.error(`Error deleting file: ${error.message}`);
          res.status(500).send(error.message);
        });
    });

    return router;
  };
}

//return a singleton.  the constructor code will only ever be run once
const uploadedFileRoutes = new UploadedFileRoutes();
export { uploadedFileRoutes as UploadedFileRoutes };
