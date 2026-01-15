import { Router } from 'express'
import { testTicketEndpoint } from './controllers/tickets.ts'

const router = Router()

router.get('/tickets', testTicketEndpoint)

export default router
