import * as express from 'express';
import { Request, Response } from 'express';
import { existsSync, promises as fsPromises } from 'fs';
import * as multer from 'multer';
import { join } from 'path';

import { Configuration } from '../configuration';
import { UploadedFile } from '../fileUpload/uploadedFile';
import { UploadedFileInterface } from '../fileUpload/uploadedFile.interface';

interface RoutesInterface {
  createRoutes: () => express.Router;
}

class Routes implements RoutesInterface {
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
  createRoutes = () => {
    //this is default code frome the mongoose documentation to initialize an express.Router type
    const router = express.Router();
    //multer handles the file upload for express and is used as a handler in the post
    const upload = multer({ dest: Configuration.downloadLocation });

    //the upload route
    router.post(
      '/upload',
      upload.single('uploadedFile'),
      (req: Request, res: Response) => {
        //if no file is sent, multer won't attach file to the request
        if (!req.file) {
          res.status(500).send('No file was sent');
        } else {
          //Create an object to store the information in the database
          const uploadedFile: UploadedFileInterface = {
            originalFilename: req.file.originalname,
            savedFilename: req.file.filename,
          };

          //Save the data for the user
          UploadedFile.create(uploadedFile)
            .then(() => {
              //successful save in the database means we can send the user a success reponse
              res.send(req.file.filename);
            })
            .catch(error => {
              console.error(error);
              //the failed save in mongo means we should tell the user there was an error
              res.status(500).send(error.message);
            });
        }
      }
    );

    //the download route
    router.get('/download', (req: Request, res: Response) => {
      //uploadedFilename is a required query parameter so we can use it to search
      if (!req.query.uploadedFilename) {
        res.status(400).send('Missing uploadedFileName as a query parameter');
      } else {
        //giving this the same type as the save is causing issues everywhere.
        //todo: create a second type for search
        const uploadedFile = {
          savedFilename: req.query.uploadedFilename,
        };
        //Search for the uploadedFile in the mongo database
        UploadedFile.findOne(uploadedFile)
          .then(foundFile => {
            //when nothing is found, foundFile is null
            if (!foundFile) {
              //throwing this error will kick the promise out to the .catch below.  to make life easy I pretty printed the uploadedFile object to the string
              throw new Error(
                `No File exists with the following data:\n${JSON.stringify(
                  uploadedFile,
                  undefined,
                  ' '
                )}`
              );
            }
            //res.download automatically attaches the originalFileName but in an ugly format, this will make it easier for programming in a front end
            res.header({ 'File-Name': foundFile.originalFilename });
            //res.download reads and sends the file to the client
            res.download(
              join(Configuration.downloadLocation, uploadedFile.savedFilename),
              foundFile.originalFilename
            );
          })
          .catch(error => {
            console.log(error.message);
            //there was either an error with mongo or there was no file found, send this information to the client
            res.status(500).send(error.message);
          });
      }
    });

    //file route supporting pagination
    router.get('/files', (req: Request, res: Response) => {
      let page = req.query.page || 0;
      let pageSize = req.query.pageSize || 20;

      if (page < 0) page = 0;
      if (pageSize > 100) pageSize = 100;
      if (pageSize < 20) pageSize = 20;

      const skip = (page * pageSize);
      const nextPage = page + 1;


      UploadedFile.find().skip(skip).limit(pageSize).then((foundFiles) => {
        res.header({ 'nextPage': nextPage });
        res.header({ 'pageSize': pageSize });
        res.send(foundFiles);
      }).catch(error => {
        console.log(`Error finding files: ${error.message}`);
        res.status(500).send(error.message);
      });
    });

    return router;
  };
}

//return a singleton.  the constructor code will only ever be run once
const routes = new Routes();
export { routes as Routes };
