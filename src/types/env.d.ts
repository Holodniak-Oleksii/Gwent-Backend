declare namespace NodeJS {
  export interface ProcessEnv {
    MONGO_URL: string;
    JWT_REFRESH_SECRET: string;
    JWT_SECRET: string;
    DEFAULT_USER_SCORE: string;
    PORT?: string;
  }
}
