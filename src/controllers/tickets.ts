import type { Request, Response } from 'express'

export const testTicketEndpoint = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Ticket test endpoint is working',
    timestamp: new Date().toISOString(),
  })
}
