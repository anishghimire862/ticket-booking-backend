import { Router } from 'express'
import { getEventById, getEvents } from './controllers/event.controller.ts'

const router = Router()

router.get('/events', getEvents)
router.get('/events/:id', getEventById)

export default router
