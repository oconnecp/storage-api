import { assert } from 'chai';
import { promises as fsPromises } from 'fs';
import { connect, connection, disconnect, mongo } from 'mongoose';
import { Configuration } from '../../app/configuration';
import { UploadedFileController } from '../../app/fileUpload/fileUpload.controller';
import { FileUploadModelInterface } from '../../app/fileUpload/fileUpload.interface';
import { join } from 'path';

describe('fileUploadController tests: ', () => {
  before(done => {
    //connect to the testing database
    connect(
      Configuration.test.mongooseConnection,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
      }
    )
      .catch(error => {
        console.error(error);
        process.exit(1);
      })
      .finally(() => {
        done();
      });
  });

  after(() => {
    //close the connection after testing or mocha will not close
    disconnect();
  });

  const createTestFile = (
    filename: string = new mongo.ObjectID() + ''
  ): Promise<FileUploadModelInterface> => {
    const testFile: Express.Multer.File = {
      fieldname: '',
      originalname: `${filename}.txt`,
      mimetype: '',
      size: 2400,
      encoding: 'UTF-8',
      destination: '',
      filename,
      path: '',
      buffer: Buffer.from(new ArrayBuffer(10)),
    };

    return UploadedFileController.saveFile(testFile);
  };

  describe('saveFile tests: ', () => {
    it('Throws an error when file is null', done => {
      const request = { file: undefined };
      UploadedFileController.saveFile(request.file!)
        .then(() =>
          done(new Error('saveFile did not throw an error when it should'))
        )
        .catch(() => done());
    });

    it('Saves the uploadedFile to the mongoDB', done => {
      // if the file is uploaded correctly it will run done without an error
      // if the file is uploaded with an error, the catch will run done with the error as the argument
      createTestFile()
        .then(() => done())
        .catch(done);
    });
  });

  describe('findFile tests: ', () => {
    it('throws an error if uploadedFilename is undefined', done => {
      UploadedFileController.findFile(undefined!)
        .then(() => done(new Error('findFile should have thrown an error')))
        .catch(() => done());
    });
    it('throws an error if no file is found', done => {
      UploadedFileController.findFile('noFileByThisName')
        .then(() =>
          done(new Error('findFile should have thrown and unfound file error'))
        )
        .catch(() => done());
    });
    it('finds the file if its from the database', done => {
      const filename = new mongo.ObjectID() + '';
      createTestFile(filename)
        .then(() => UploadedFileController.findFile(filename))
        .then(() => done())
        .catch(done);
    });
  });

  describe('retrieveFiles default page and pageSize tests', () => {
    before(done => {
      const allFilesSavesPromiseArray: Array<
        Promise<FileUploadModelInterface>
      > = [];

      connection.db
        .dropDatabase()
        .then(() => {
          for (let i = 1; i <= 101; i++) {
            allFilesSavesPromiseArray.push(createTestFile());
          }
          return Promise.all(allFilesSavesPromiseArray);
        })
        .then(() => {
          done();
        })
        .catch(done);
    });

    it('if page is less than 0, its reset to 0', done => {
      UploadedFileController.retrieveFiles(-1, 20).then(resultsObject => {
        assert.equal(resultsObject.nextPage, 1);
        assert.equal(resultsObject.foundFiles.length, 20);
        done();
      });
    });

    it('if page is undefined, its reset to 0', done => {
      UploadedFileController.retrieveFiles(undefined, 20).then(
        resultsObject => {
          assert.equal(resultsObject.nextPage, 1);
          assert.equal(resultsObject.foundFiles.length, 20);
          done();
        }
      );
    });

    it('if pagesize is undefined its reset to 20', done => {
      UploadedFileController.retrieveFiles(0, undefined).then(resultsObject => {
        assert.equal(resultsObject.nextPage, 1);
        assert.equal(resultsObject.foundFiles.length, 20);
        done();
      });
    });

    it('if page is less than 20, its reset to 20', done => {
      UploadedFileController.retrieveFiles(0, 5).then(resultsObject => {
        assert.equal(resultsObject.nextPage, 1);
        assert.equal(resultsObject.foundFiles.length, 20);
        done();
      });
    });

    it('if pageSize is greater than 100, its reset to 100', done => {
      UploadedFileController.retrieveFiles(0, 101).then(resultsObject => {
        assert.equal(resultsObject.nextPage, 1);
        assert.equal(resultsObject.foundFiles.length, 100);
        done();
      });
    });
  });

  describe('retrieveFiles results testing', () => {
    let allFiles;
    before(done => {
      const allFilesSavesPromiseArray: Array<
        Promise<FileUploadModelInterface>
      > = [];

      connection.db
        .dropDatabase()
        .then(() => {
          for (let i = 1; i <= 22; i++) {
            allFilesSavesPromiseArray.push(createTestFile());
          }
          return Promise.all(allFilesSavesPromiseArray);
        })
        .then(data => {
          allFiles = data;
          done();
        })
        .catch(done);
    });

    it('returns the first 20 results and the second page properly', done => {
      let lastFile: FileUploadModelInterface;

      UploadedFileController.retrieveFiles(0, 20)
        .then(firstResults => {
          assert.equal(firstResults.foundFiles.length, 20);

          //check that it's in descending order
          firstResults.foundFiles.forEach(file => {
            if (!!lastFile && lastFile.createdDate!.valueOf() !== file.createdDate!.valueOf()) {
              assert.isAbove(
                lastFile.createdDate!.valueOf(),
                file.createdDate!.valueOf()
              );
            }
            lastFile = file;
          });

          return UploadedFileController.retrieveFiles(
            firstResults.nextPage,
            firstResults.pageSize
          );
        })
        .then(secondResults => {
          assert.equal(secondResults.foundFiles.length, 2);
          assert.notEqual(secondResults.foundFiles[0].id, lastFile.id);
          done();
        });
    });
  });

  describe('deleteFile tests: ', () => {
    before(done=>{
      UploadedFileController.setFileLocation(Configuration.test.downloadLocation).then(()=>done()).catch(done);
    });

    it('throws an error if uploadedFilename is undefined', done => {
      UploadedFileController.deleteFile(undefined!)
        .then(() => done(new Error('Should throw an undefined error')))
        .catch(() => done());
    });

    it('deletes the file properly', done => {
      const filename = new mongo.ObjectID() + '';

      fsPromises.appendFile(join(Configuration.test.downloadLocation,filename), 'Hello content!')
        .then(() => createTestFile(filename))
        .then(() => UploadedFileController.deleteFile(filename))
        .then(() => done())
        .catch(done);
    });
  });
});
