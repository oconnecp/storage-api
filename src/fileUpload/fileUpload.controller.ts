import { UploadedFile } from './fileUpload.database';
import {
  FileUploadInterface,
  SearchableFileUploadInterface,
} from './fileUpload.interface';

class UploadedFileController {
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
    return UploadedFile.create(uploadedFile);
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
    return UploadedFile.findOne(uploadedFile).then(foundFile => {
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

    return UploadedFile.find()
      .skip(skip)
      .limit(pageSize)
      .then(foundFiles => {
        return { nextPage, pageSize, foundFiles };
      });
  };

  deleteFile = (uploadedFilename: string) => {
    //using the findFile function will ensure that foundFile will never be null
    return this.findFile(uploadedFilename).then(foundFile => {
      console.log('todo: finish delete route');
    });
  };
}

const controller = new UploadedFileController();
export { controller as UploadedFileController };
