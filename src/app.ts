import express, { type Application } from 'express'
import cors from 'cors'
import routes from './routes.ts'
import { config } from './config.ts'

const app: Application = express()

app.use(
  cors({
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

app.use(express.json())

app.use('/api', routes)

export default app
