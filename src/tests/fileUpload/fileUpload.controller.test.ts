import { connect, model } from 'mongoose';
import { Configuration } from '../../app/configuration';
import { UploadedFile } from '../../app/fileUpload/fileUpload.database';

describe('fileUploadController tests: ', () => {
  before(() => {
    connect(
      Configuration.test.mongooseConnection,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
      }
    );
  });

  beforeEach(() => {});

  it('Throws an error when file is null', () => {});
});
