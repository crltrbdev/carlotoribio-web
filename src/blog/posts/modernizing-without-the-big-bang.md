Nobody greenlights a rewrite anymore, and for good reason — the industry has a graveyard full of "v2" projects that shipped eighteen months late and half as capable. But the alternative people reach for, "just leave the monolith alone," isn't strategy either. It's surrender with better branding.

The middle path is boring and it works: peel the system apart at the seams while it keeps running.

## Find the seam, not the rewrite

Every legacy system has natural fault lines — a bounded context that's already mostly separate, a report generator that only reads, an integration that already speaks HTTP. Your first modernization target should be the component that would embarrass you the least if it took twice as long as planned.

The strangler fig pattern is the usual name for this, and the mechanism is dead simple: put a router in front of the old system and move traffic over one route at a time.

```js
// the entire idea, in one ugly lookup table
const routes = {
  '/api/reports':      NEW_REPORTS_SERVICE,
  '/api/documents':    NEW_DOCUMENTS_SERVICE,
  '/*':                LEGACY_MONOLITH,   // everything else, for now
};
```

That's it. That's the architecture. Each row of that table is a small, reversible decision instead of one giant irreversible one.

## The rules that keep it honest

- **New capability goes to the new system, always.** The moment you add a feature to the legacy app "just this once," you've lost the plot. Freeze the monolith's feature set by policy, not by hope.
- **Route by business capability, not by file layout.** Move "invoicing," not "the controllers folder."
- **Delete what you strangle.** A migration that leaves the old code running behind a flag is not a migration. It's a second system you're now maintaining.

## The part nobody budgets for

The hard dependency is never code — it's data. Shared tables are the real monolith. Every strangler project I've seen stall died at the database layer, where three services still secretly shared one schema.

So start the data conversation on day one: which service owns which tables, and what's the contract when two of them need the same row? Answer that early and the code routing is the easy part. Skip it and you'll build a beautiful new front door into the same old house.

Fifteen years in, the pattern I trust is unglamorous: small cuts, reversible decisions, relentless deletion. The big bang makes a better story. The strangler makes a better system.
