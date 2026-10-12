# First festival and backstage crisis

This milestone is one playable six-week edition, not the full festival-company
career. It is built on the persistent world/news work in PR #1.

## Rules

The director starts with £350,000, chooses an existing venue and pays its full
hire fee plus £12 per attendee-capacity for operations. The first edition is
capped at 3,000 capacity and uses £125 tickets. These are prototype balance
values, not the final economy.

Up to three bands can be booked, using their existing derived booking fees.
Guaranteed fees are paid up front. Cancelling returns half, rounded down; the
other half remains an expense. Replacing an affected act refunds that same
amount and pays the replacement's current fee. Unaffordable, duplicate and
fourth bookings are rejected without mutating the world.

A band needs at least two available members and its lead vocalist to perform.
Existing injuries, departures, splits and new legal detention all affect the
actual set. Keeping an act does not guarantee its appearance or refund its fee.

When opening week arrives, the simulation settles the edition exactly once.
Attendance depends on the performing lineup's popularity, live strength, genre
fit and missing sets, plus a bounded random demand variation. Ticket revenue,
all committed expenses, profit/loss and reputation change are recorded in the
world and shown in the result.

## Stories and decisions

Risk-taking, stress, professionalism, past incidents and existing traits
influence uncommon organic arrests across the industry, independently of the
player's bookings. They consume the world's seeded RNG. Stress also responds to
fatigue, morale and resilience.

An arrest records an allegation, detention, stressed morale, lost momentum and
relationship strain. Two weeks later, a hearing results in bail or further
detention. A further hearing two weeks after that dismisses the case or imposes
a fine. Bail and resolved cases allow performances if the musician is otherwise
available; detention does not. A fine affects the band's finances. The event
history keeps both the allegation and eventual outcome.

The labelled Backstage crisis challenge schedules an incident involving a
booked band's member two weeks before opening, so the decisions can be explored
reliably. This is an explicit scenario fixture; ordinary worlds do not guarantee
arrests. The challenge requires booking an act before the incident week.

An open case affecting a booked act pauses interface time advancement for a
decision:

- Keep: trust +8, with the full guaranteed fee at risk.
- Cancel: half-fee refund, trust −8, festival reputation −2.
- Replace: half-fee refund, trust −3 with the original band, plus a new fee.

Replacement candidates must currently be able to perform and have no open case.
Their future availability can still change. Trust and decisions are persistent;
full negotiations and trust-based pricing remain future systems.

Decisions, bookings and festival creation autosave as well as weekly ticks.
Multi-year lab advancement stops at a pending festival decision or edition
completion instead of skipping past them.

## Compatibility and validation

Save version 2 / simulation 0.0.4 includes conduct, arrest histories, bookings,
decisions, trust, budgets and festival results. Version-1 / simulation-0.0.3 saves
migrate in memory, retaining entity IDs, RNG state and all past history. Their
future weeks use the new rules; history is not retroactively simulated.

TypeScript tests cover fees, budget/slot constraints, each decision, failed
replacement atomicity, detention/injury availability, one-time settlement, legal
resolution, exact save continuation, legacy migration and invalid ledgers.
The existing multi-seed 20-year round-trip and SQLite persistence checks pass.

Browser checks exercised all three decisions from world creation through a
saved result, including reloading at the crisis, paused advancement, 390px mobile
layout and absence of page errors.

The Windows workflow builds an installer on pull requests. Native Windows
playtesting and Android packaging/device tests remain outstanding.
