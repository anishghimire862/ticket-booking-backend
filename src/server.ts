import app from './app.ts'
import { config } from './config.ts'
import { AppDataSource } from './data-source.ts'

const { HOST, PORT } = config

async function bootstrap() {
  try {
    await AppDataSource.initialize()
  } catch (e) {
    console.log('DB Failed', e)
  }
  console.log('Database connected')

  app.listen(PORT, () => {
    console.log(`Ticket booking API server running on ${HOST}:${PORT}`)
  })
}

bootstrap().catch((err) => {
  console.error('Failed to start ticket booking API server', err)
  process.exit(1)
})
