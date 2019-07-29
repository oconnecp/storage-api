interface Configurations {
  expressServerPort: number;
  downloadLocation: string;
  mongooseConnection: string;
}

export interface ConfigurationInterface extends Configurations {
  test: Configurations;
}
