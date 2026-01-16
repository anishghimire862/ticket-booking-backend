import { Router } from 'express'
import { getEventById, getEvents } from './controllers/event.controller.ts'
import { createBooking } from './controllers/booking.controller.ts'

const router = Router()

router.get('/events', getEvents)
router.get('/events/:id', getEventById)
router.post('/bookings', createBooking)

export default router
