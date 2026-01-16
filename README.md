# Ticket Booking System 

Backend implementation for the ticket booking system, focused on data consistency, transactional safety, and preventing
double-booking.

## Technologies Used
- Node.js
- TypeScript
- Express
- PostgreSQL
- TypeORM
- ESLint and Prettier

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL


## Steps to Run The Project
- Clone the repository:
    `git clone git@github.com:anishghimire862/ticket-booking-backend.git`

- Install dependencies:
    `npm install`
- Create the environment file:
    `cp .env.example .env`
- Update the environment variables in the `.env` file as needed.
- Run database migrations
    `npm run migration:run`
- Seed the database with initial data (events, inventory, and ticket tiers):
    `npm run seed`
- Start the development server:
    `npm run dev`

After completing the steps above, the API server should be up and running on the port specified in the `.env` file.

## Assumptions & Simplifications

To keep the scope focused on the core problem, the following assumptions were made:

- User management is mocked. Mocked user data is stored in `src/entities/user-mock.ts` and does not implement 
    authentication or authorization. 
- Payments are simulated. A booking is considered successful only when a predefined test card number
    (`4242424242424242`) is provided. No external payment gateway is integrated.
- API error responses are functional but not fully standardized.
- Logs are currently emitted using `console.log/console.error` for basic visibility during development.

## Decisions & Trade-offs

The following decisions were made to ensure correctness, clarity, and maintainability, and timely submission of 
the assignment for the ticket booking system.

1. Pessimistic Locking
    To prevent double-booking under concurrent requests, ticket inventory rows are locked using pessimistic write locks.

   - Benefit: Guarantees data consistency, which is critical in a financial context where preventing overbooking is more 
   important than speed. And it avoids complex retry logic on the client/server.
   - Trade-off: At 50,000 concurrent users, row-level locks can create contention and increase latency. Optimistic locking 
   is prepared via the `version` column for future horizontal scaling.

2. Multi-Tier Booking Consideration

    The system is designed to support booking tickets from multiple tiers in a single request via the `Booking` and 
    `BookingItem` entities. For the purposes of this assignment, only single-tier bookings are processed. This avoids 
    having to handle complex scenarios such as partial fulfillment (e.g., some tiers available, some not) and deciding 
    whether to partially book or fail the entire request. The design, however, allows future extension to fully support 
    multi-tier bookings.

3. Idempotency Keys
    Each booking requires a unique idempotency key to ensure retry-safe requests.

    Benefit: Prevents duplicate bookings if clients retry requests due to network issues or timeouts.
    
    Trade-off: Requires clients to generate unique keys and adds a uniqueness constraint at the database level. 

4. Single Database Transaction
    Booking, inventory updates, and payment processing are wrapped in a single database transaction.

   - Benefit: Ensures that either all operations succeed or none do, maintaining consistency across bookings and inventory.

   - Trade-off: Long-running transactions can block other requests and reduce concurrency. For this assignment, payment 
   is mocked and synchronous, making this approach acceptable. In production, payments would likely be asynchronous 
   and require careful handling of idempotency.

5. Inventory Constraints
    Database-level @Check constraints enforce valid inventory states.

   - Benefit: Adds a safety net even if application logic fails.

   - Trade-off: Minor overhead on database operations, but improves robustness and safety.

6. Mocked Payments:
    Payments are simulated and succeed only for a specific test card number (4242424242424242).

   - Benefit: Simplifies development and allows focus on development of important features.

   - Trade-off: Not production-ready. In a real system, payments would potentially be asynchronous, 
   and integrate with external providers.

7. Logging & Observability
    Currently, `console.log/console.error` are used for error and request logging.

   - Benefit: Minimal overhead for development and debugging.

   - Trade-off: Lacks structured logging.

8. Returning Available Quantities with Booking Response
    The booking API also returns available count of each ticket tiers. This avoids an extra API request from the frontend
    to fetch updated inventory after a booking, reducing latency and simplifying the client-side logic.

9. Multi-Event Support
    The system is designed to support bookings for multiple events using the `Event` entity. While the assignment 
    focuses on single-event booking for simplicity, the data model allows easy extension to handle multiple events 
    concurrently without major changes to the booking logic.

## Concurrency & Consistency (Preventing Double-Booking)

To ensure that two users cannot book the same ticket at the same time, the following measures are implemented:

1. Database Level Locking
    When updating ticket inventory, we acquire a pessimistic write lock `setLock('pessimistic_write')` on the relevant 
    `TicketInventoryEntity` row. This ensures that concurrent booking attempts for the same ticket tier are handled 
    one at a time, preventing overbooking.

2. Idempotency Key
    Each booking request requires a unique idempotency key. If a request with the same key is retried, the system returns 
    the existing booking instead of creating a duplicate

3. Inventory Constraints
    The `TicketInventoryEntity` enforces integrity rules to ensure that ticket quantities remain valid. For example, 
    the number of available tickets cannot be negative, and the combined count of reserved and available tickets 
    never exceeds the total number of tickets. 
    
    This provides a safety net at the database level against accidental or concurrent updates.

4. Optimistic Locking for Future Scaling
    The `version` column in `TicketInventoryEntity` enables optimistic locking, allowing the system to scale horizontally 
    while still preventing race conditions.
    
    Currently, we rely on pessimistic locks for simplicity, but optimistic locking can replace or complement this in a 
    high-throughput environment.

5. Transactional Booking Flow
    All booking operations are wrapped in a single database transaction using TypeORM’s QueryRunner. This ensures that 
    updates to inventory, booking records, booking items, and payment status either all succeed or all roll back, 
    maintaining consistency.

## Future Improvements: Scaling for 1M DAU & 99.99% Availability

While the current implementation prioritizes correctness via Pessimistic Locking, meeting the assignment's target 
of 50,000 concurrent users and 99.99% availability requires the following design strategy:

1. High Availability
   - Infrastructure: Deploy the API services behind a Load Balancer.
   - Database: Implement a Primary-Replica setup for PostgreSQL.

2. Handling 50k Concurrent Users
    Pessimistic locking works well for low-concurrency, but at 50k users, it creates a database bottleneck. 
    Optimistic locking would result in excessive retries.
    - Move the inventory decrement logic to Redis Atomic Counters.

3. Performance Strategy
    To keep booking requests fast:
    - Async Processing: Moving heavy database writes (like creating a booking) to a background worker reduces the time 
    the user waits for a response.
    - Caching: Cache the `GET /events` and tier availability in Redis. The UI only fetches fresh inventory counts when
    the user actually selects a tier, reducing load on the database.

## Example Booking Flow

1. Request Validation
   - API checks for required fields: userId, tierId, quantity, idempotencyKey, and payment details.
   - Returns 400 if any are missing or invalid.
2. Idempotency Check
   - If a booking with the same idempotency key exists, it is returned immediately to prevent duplicates.
3. Inventory Lock & Check
   - Ticket inventory for the requested tier is locked (pessimistic_write) to prevent concurrent updates.
   - System verifies sufficient tickets are available; throws an error if not.
4. Create Booking & Booking Items
   - A new booking record is created with `PENDING_PAYMENT` status.
   - Corresponding booking items are added for the requested tier and quantity.
5. Process Payment
    - Payment is simulated; booking status is updated to CONFIRMED or FAILED.
    - If payment fails, inventory is rolled back to release the reserved tickets.
6. Commit Transaction
    - All changes (inventory, booking, booking items, payment) are committed together.
    - If any step fails, the transaction is rolled back.
7. Return Response
    - API responds with the full booking, payment status, and updated ticket availability for the event.
