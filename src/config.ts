import 'dotenv/config'
import { requireEnv } from './env.ts'

export const config = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  HOST: process.env.HOST || 'localhost',
  NODE_ENV: process.env.NODE_ENV || 'development',

  DB_TYPE: 'postgres' as const,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 5432,

  DB_USERNAME: requireEnv('DB_USERNAME'),
  DB_PASSWORD: requireEnv('DB_PASSWORD'),
  DB_NAME: requireEnv('DB_NAME'),
  DB_SSL: process.env.DB_SSL === 'true',
}
