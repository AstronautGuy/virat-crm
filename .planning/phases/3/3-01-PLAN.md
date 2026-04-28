---
wave: 1
depends_on: []
files_modified:
  - src/server/db/schema/locationLogs.ts
  - src/server/api/routers/location.ts
  - src/app/_components/dev/MockLocationPinger.tsx
autonomous: true
---

# Phase 3, Plan 1: 24/7 Location Logging & Slabbing

## Objective
Implement continuous 24/7 location logging with server-side time-based slabbing. The backend must group pings into fixed time intervals (slabs) and compute the most frequent location per slab to minimize database entry volume.

## Tasks

<task>
<action>
Modify `src/server/db/schema/locationLogs.ts` to include `date`, `slab`, and `frequencyMap` columns. Remove `accuracy`, `speed`, `heading`, `altitude` columns as they are no longer necessary for frequency slabbing. Add a unique constraint on `(userId, date, slab)`.
</action>
<read_first>
- src/server/db/schema/locationLogs.ts
</read_first>
<acceptance_criteria>
- File contains `slab: text("slab")`
- File contains `frequencyMap: jsonb("frequency_map")`
</acceptance_criteria>
</task>

<task>
<action>
Update `src/server/api/routers/location.ts` to implement the `ping` mutation with slab logic. Determine the current slab, round the coordinates to 4 decimal places, maintain a frequency count map in `frequencyMap`, and calculate the most frequent location to store in `latitude` and `longitude`. Use Drizzle's `onConflictDoUpdate` for upserts.
</action>
<read_first>
- src/server/api/routers/location.ts
</read_first>
<acceptance_criteria>
- `ping` mutation parses location input.
- File contains slab determination logic (e.g. "00:00-10:00").
- `onConflictDoUpdate` is used to update `frequencyMap`, `latitude`, and `longitude`.
</acceptance_criteria>
</task>

<task>
<action>
Push database schema using `drizzle-kit push --force` or manual drop query to apply the new schema, destroying old raw logs.
</action>
<read_first>
- src/server/db/schema/locationLogs.ts
</read_first>
<acceptance_criteria>
- Schema is pushed to the database successfully.
</acceptance_criteria>
</task>

<task>
<action>
Add or verify `MockLocationPinger` in `src/app/_components/dev/MockLocationPinger.tsx` that pings the backend every N seconds.
</action>
<read_first>
- src/app/_components/dev/MockLocationPinger.tsx
</read_first>
<acceptance_criteria>
- `MockLocationPinger` calls `location.ping.useMutation()` continuously.
</acceptance_criteria>
</task>

## Verification
- Run the app, click "Start Pinging" in the mock pinger.
- Observe that multiple pings within the same slab result in only one row in the `locationLogs` table, with an updating `frequencyMap`.

## Must Haves
- Time slabs must be fixed daily intervals.
- The most frequent location per slab must be computed accurately.
- Coordinates must be rounded to at least 4 decimal places to counter GPS jitter.
- Upsert logic must handle concurrent pings gracefully without constraint errors.
