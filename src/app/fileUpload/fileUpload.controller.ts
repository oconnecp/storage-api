import { FileUploadModel } from './fileUpload.database';
import { FileUploadInterface, SearchableFileUploadInterface, FileUploadModelInterface } from './fileUpload.interface';
import { existsSync, promises as fsPromises } from 'fs';
import { join } from 'path';

class UploadedFileController {
  fileLocation = '';

  //if the downloadLocation does not exist, create it
  //return the promise to handle mkdir errors
  setFileLocation = (fileLocation: string) => {
    this.fileLocation = fileLocation;
    const downloadLocationExists = existsSync(fileLocation);
    if (!downloadLocationExists) {
      console.log('creating file location');
      return fsPromises
        .mkdir(fileLocation)
        .then(() => {
          console.log(
            `Download location: ${fileLocation} created successfully`
          );
        });
    }

    return Promise.resolve();
  }

  saveFile = (file: Express.Multer.File) => {
    //if no file is sent, multer won't attach file to the request
    if (!file) {
      return Promise.reject(new Error('No file was sent'));
    }

    //Create an object to store the information in the database
    const uploadedFile: FileUploadInterface = {
      originalFilename: file.originalname,
      savedFilename: file.filename,
    };

    //Save the data for the user
    return FileUploadModel.create(uploadedFile);
  };

  //giving this the same type as the save is causing issues everywhere.
  //todo: create a second type for retrieval
  findFile = (uploadedFilename: string) => {
    //uploadedFilename is a required routing parameter so we can use it to search
    if (!uploadedFilename) {
      return Promise.reject(new Error('Must included an uploadedFilename'));
    }

    const uploadedFile: SearchableFileUploadInterface = {
      savedFilename: uploadedFilename,
    };

    //Search for the uploadedFile in the mongo database
    return FileUploadModel.findOne(uploadedFile).then(foundFile => {
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
      return foundFile;
    });
  };

  retrieveFiles = (page = 0, pageSize = 20) => {
    if (page < 0) page = 0;
    if (pageSize > 100) pageSize = 100;
    if (pageSize < 20) pageSize = 20;

    const skip = page * pageSize;
    const nextPage = page + 1;

    return FileUploadModel.find()
      .skip(skip)
      .limit(pageSize)
      .sort('-createdDate')
      .then(foundFiles => {
        return { nextPage, pageSize, foundFiles };
      });
  };

  deleteFile = (uploadedFilename: string) => {
    //using the findFile function will ensure that foundFile will never be null
    let file: FileUploadModelInterface;
    return this.findFile(uploadedFilename).then(foundFile => {
      file = foundFile;
      return fsPromises.unlink(join(this.fileLocation, foundFile.savedFilename));
    }).then(() => file.remove());
  };
}

const controller = new UploadedFileController();
export { controller as UploadedFileController };

