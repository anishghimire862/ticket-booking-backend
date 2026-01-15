import express, { type Application } from 'express'
import routes from './routes.ts'

const app: Application = express()

app.use(express.json())

app.use('/api', routes)

export default app
