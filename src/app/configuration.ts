import { ConfigurationInterface } from './configuration.interface';

class Configuration implements ConfigurationInterface {
  expressServerPort =
    (process.env.EXPRESS_SERVER_PORT && +process.env.EXPRESS_SERVER_PORT) ||
    5000;

  downloadLocation =
    process.env.DOWNLOAD_LOCATION ||
    '/Users/evilgingerman/workspace/storage-api/uploadedfiles/';

  mongooseConnection =
    process.env.MONGOOSE_CONNECTION || 'mongodb://localhost:27017/storage-api';

  test = {
    expressServerPort: 3000,
    downloadLocation:
      '/Users/evilgingerman/workspace/storage-api/testUploadedfiles/',
    mongooseConnection: 'mongodb://localhost:27017/test-storage-api',
  };
}

const configuration: Configuration = new Configuration();
export { configuration as Configuration };
