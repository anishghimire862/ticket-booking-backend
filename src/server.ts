import app from './app.ts'
import { config } from './config.ts'

const PORT = config.PORT

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
