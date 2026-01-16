import 'reflect-metadata'
import { DataSource } from 'typeorm'

import { config } from './config.ts'

export const AppDataSource = new DataSource({
  type: config.DB_TYPE,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME!,

  ssl: config.DB_SSL,

  synchronize: false,
  logging: true,

  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
})
