import { KrutAuth } from "@krutai/auth";
import { DbService } from "@krutai/db-service";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

type ServerConfig = {
  apiKey: string;
  serverUrl: string;
  projectId: string;
  dbName: string;
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getServerConfig(): ServerConfig {
  return {
    apiKey: requireEnv("KRUTAI_API_KEY"),
    serverUrl: requireEnv("KRUTAI_SERVER_URL"),
    projectId: requireEnv("PROJECT_ID"),
    dbName: requireEnv("PROJECT_DB_NAME"),
  };
}

let dbUrlPromise: Promise<string> | null = null;
let authClientPromise: Promise<KrutAuth> | null = null;
let poolPromise: Promise<Pool> | null = null;
let prismaPromise: Promise<PrismaClient> | null = null;

export async function getDbUrl() {
  if (!dbUrlPromise) {
    dbUrlPromise = (async () => {
      const config = getServerConfig();
      const dbService = new DbService({
        apiKey: config.apiKey,
        serverUrl: config.serverUrl,
      });

      await dbService.initialize();

      const { dbUrl } = await dbService.getDbConfig({
        projectId: config.projectId,
        dbName: config.dbName,
      });

      return dbUrl;
    })().catch((error) => {
      dbUrlPromise = null;
      throw error;
    });
  }

  return dbUrlPromise;
}

export async function getAuthClient() {
  if (!authClientPromise) {
    authClientPromise = (async () => {
      const config = getServerConfig();
      const databaseUrl = await getDbUrl();
      const auth = new KrutAuth({
        apiKey: config.apiKey,
        serverUrl: config.serverUrl,
        databaseUrl,
      });

      await auth.initialize();
      return auth;
    })().catch((error) => {
      authClientPromise = null;
      throw error;
    });
  }

  return authClientPromise;
}

export async function getPool() {
  if (!poolPromise) {
    poolPromise = (async () => {
      const dbUrl = await getDbUrl();

      return new Pool({
        connectionString: dbUrl,
      });
    })().catch((error) => {
      poolPromise = null;
      throw error;
    });
  }

  return poolPromise;
}

export async function getPrisma() {
  if (!prismaPromise) {
    prismaPromise = (async () => {
      const pool = await getPool();
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter });
    })().catch((error) => {
      prismaPromise = null;
      throw error;
    });
  }
  return prismaPromise;
}
