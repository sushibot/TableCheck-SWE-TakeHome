namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    REDIS_PORT: number;
    HOST: string;
    DB_URL: string;
    TRPC_ENDPOINT: string;
    ENDPOINT: string;
  }
}
