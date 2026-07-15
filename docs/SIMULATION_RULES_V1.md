# Simulation Rules v1

## Weekly processing order

1. Advance calendar and execute scheduled events.
2. Recover health and process new health incidents.
3. Develop or decline band-member skills.
4. Recalculate band ability from available members.
5. Update morale, fatigue, chemistry and relationships.
6. Process releases, gigs, momentum, followers and popularity.
7. Progress active story arcs.
8. Test eligibility for new contextual events.
9. Process agents and record labels.
10. Process rival-festival booking decisions.
11. Process sponsors and venues.
12. Process festival finances, capacity and reputation.
13. Generate structured simulation events.
14. Generate news and social reactions from those events.
15. Record snapshot and history data.

## Probability design

Probabilities are stored internally from 0 to 1. No important event uses a flat chance without eligibility and contextual modifiers.

### Band conflict inputs

- chemistry
- fatigue
- morale
- ego
- professionalism
- resilience
- financial stress
- recent momentum
- creative-differences traits
- active-story cooldown

### Viral breakthrough inputs

- song and performance ability
- momentum
- social influence
- current genre trend
- label marketing support
- recent gigs
- viral traits
- small seeded luck component

### Member health inputs

- fatigue
- health
- tour load
- role-specific strain
- lifestyle and injury-prone traits
- age and endurance

### Rival booking utility

- genre fit
- audience fit
- popularity
- momentum
- potential
- relationship
- estimated fee
- schedule availability
- reliability
- rival strategy and risk tolerance

## Snapshot years

Simulation Lab creates comparable reports at years 0, 5, 10, 15 and 20. Reports include entity counts, splits, closures, major acts, finances, popularity distribution and event totals.
