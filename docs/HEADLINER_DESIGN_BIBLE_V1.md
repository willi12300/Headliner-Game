# HEADLINER — Design Bible v1.0

**Project codename:** Headliner  
**Genre:** Deep festival and music-industry management simulation  
**Primary platform:** Desktop  
**Technology:** Tauri, React, TypeScript, Rust, SQLite  
**Document status:** Foundation document  
**Purpose:** Define what Headliner is, what it is not, and the design principles that every future system must follow.

---

## 1. The vision

Headliner is a long-form festival management simulation in which the player creates, develops and ultimately defines a music festival—or an entire festival company—inside a living, evolving music industry.

The player does not control a static catalogue of artists. Bands form, develop, release music, change members, change labels, gain and lose popularity, go viral, fall out, split up, reunite, decline, reinvent themselves and become legends independently of the player.

Festivals also exist independently. Rivals book artists, compete for dates, secure sponsors, expand, collapse, change ownership and develop reputations. Labels, agents, staff, sponsors, venues, councils, fans and media outlets all have their own interests and memories.

The central promise is:

> **Every save becomes a different history of music and festival culture.**

The game should generate stories players remember because they arose naturally from interacting systems rather than from a fixed campaign script.

Examples of the intended emotional outcomes:

- “I booked them when they had 300 followers.”
- “Their singer left three weeks before my festival, but the replacement became a superstar.”
- “That scout found four future headliners for me.”
- “Our first site nearly bankrupted us, but it became an iconic venue.”
- “A rival festival kept beating us to every electronic act, so we built a completely different identity.”
- “The band I rejected in Year 2 became the biggest act in the world.”

---

## 2. Elevator pitch

**Headliner is Football Manager for festivals and the wider music industry, combined with the ownership and building fantasy of a tycoon game.**

The player starts with limited money, limited reputation, incomplete information and an uncertain future. They discover talent, build relationships, negotiate deals, shape a festival identity, manage risk and gradually establish a cultural institution.

The player may eventually operate multiple festivals across different regions and genres, but every empire begins with one idea, one site and one first lineup.

---

## 3. The player fantasy

The player fantasy is not simply “make money.”

It is:

- becoming a respected festival director;
- discovering future stars before competitors;
- building a unique festival culture;
- curating memorable lineups;
- surviving crises;
- developing trusted staff;
- forming long-term relationships with bands and labels;
- watching the industry change over decades;
- creating an archive of legendary editions;
- growing from a small independent event into a global festival organisation.

The player should feel like a combination of:

- festival founder;
- booking director;
- cultural curator;
- negotiator;
- talent scout;
- business owner;
- crisis manager;
- long-term strategist.

The festival itself should gradually become a character in the game world.

Fans and industry figures should eventually recognise patterns such as:

- “That is exactly the kind of act this festival books.”
- “They always discover artists early.”
- “Their hospitality is the best in the business.”
- “They have become too corporate.”
- “Their late-night stage is legendary.”
- “Artists trust them.”

---

## 4. Core design pillars

### 4.1 A living world

The world continues to change whether or not the player acts.

Bands, members, labels, agents, festivals, sponsors and staff make decisions every simulation cycle. The player participates in the world but does not control it.

### 4.2 Emergent stories

Major stories should result from causes, probabilities and accumulated state.

A band should not split merely because the game selected “band breakup” from a random event list. A split becomes possible because of low chemistry, exhaustion, financial pressure, member ambition, ego, failed releases, external offers or existing conflicts.

### 4.3 Incomplete information

The simulation knows the truth. The player sees reports, estimates, rumours and opinions.

Potential, personality, reliability, relationship strength and future commercial value should often be uncertain until the player gathers knowledge.

### 4.4 Meaningful customisation

Festival names, logos, colours, stage identities, site layouts, philosophy and commercial policies should affect the simulation, not merely appearance.

### 4.5 Long-term attachment

The game must preserve history and encourage attachment to bands, members, staff, sites, rivals and past festival editions.

### 4.6 Difficult but understandable

Failure should be common enough to create tension, but players should usually understand what contributed to the outcome.

### 4.7 Systems over scripts

Scripted content may provide flavour, tutorials and rare set pieces, but the main game must be driven by reusable simulation systems.

### 4.8 One shared truth

The UI must display the simulation state. It must never invent outcomes independently of the engine.

---

## 5. What Headliner is not

Headliner is not:

- a simple clicker or idle game;
- a linear campaign with fixed bands and predetermined outcomes;
- a shallow festival reskin of a generic tycoon game;
- a pure construction game;
- a spreadsheet with no personality or presentation;
- a game where AI rivals cheat by ignoring finances or availability;
- a game where every high-potential artist inevitably succeeds;
- a game where customisation has no gameplay effect;
- a game where failure is caused mainly by unexplained random punishment.

---

## 6. The core gameplay loop

The weekly loop is the heartbeat of the game:

1. Review inbox, news and social reaction.
2. Review deadlines, finances, ticket sales and staff recommendations.
3. Scout bands, members, scenes and showcases.
4. Contact agents and labels.
5. Negotiate artist bookings and contractual terms.
6. Build and adjust the lineup.
7. Manage sponsors, staff, venues and operations.
8. Make strategic decisions about identity, pricing and marketing.
9. Advance time.
10. The world simulates.
11. New opportunities, consequences and stories appear.

The seasonal loop is:

1. Define the next festival edition.
2. Secure a site and dates.
3. Establish a budget and strategic direction.
4. Build the lineup.
5. Secure sponsors and suppliers.
6. Market the festival and sell tickets.
7. Prepare the site and operations.
8. Run the festival weekend.
9. Review results, finances and reputation.
10. Preserve the edition in the archive.
11. Begin the next season.

The career loop is:

1. Survive.
2. Establish identity.
3. Develop relationships.
4. Grow reputation and capacity.
5. Expand the original festival.
6. Launch or acquire additional festivals.
7. Build a festival company.
8. Shape the global music and festival industry.
9. Create a legacy.

---

## 7. New game and origin stories

At the start of a save, the player creates both a director identity and a festival identity.

### 7.1 Festival creation

The player chooses:

- festival name;
- short name;
- region and country;
- initial site type;
- genre focus;
- target audience;
- festival type;
- colour palette;
- logo mark;
- typography style;
- founding values;
- initial ticket philosophy;
- sustainability ambition;
- sponsorship tolerance;
- operational priorities.

### 7.2 Festival types

Possible initial identities include:

- grassroots;
- independent;
- boutique;
- discovery festival;
- community festival;
- camping festival;
- electronic weekender;
- city festival;
- luxury festival;
- experimental festival;
- multi-genre festival.

These are starting positions, not permanent classes. Identity should evolve from behaviour.

### 7.3 Origin stories

Origin stories modify resources, expectations and relationships.

#### Grassroots Dream

A small team has rented a field and announced an ambitious first event.

- low budget;
- low reputation;
- strong authenticity;
- limited staff;
- high freedom;
- high financial risk.

#### Local Favourite

The festival already exists as a small regional event.

- modest reputation;
- loyal local following;
- established community links;
- inherited operational limitations;
- moderate expectations.

#### Industry Backing

Investors and established industry figures support the project.

- larger starting budget;
- stronger contacts;
- higher expectations;
- reduced independence;
- greater commercial pressure.

Additional origins may be added later, including inherited festival, former artist, ex-agent, council-backed cultural event and rescue takeover.

---

## 8. Festival identity

A festival’s identity is represented by continuous dimensions rather than a single label.

Core identity dimensions include:

- authenticity;
- commercialism;
- discovery reputation;
- artist friendliness;
- prestige;
- luxury;
- sustainability;
- inclusivity;
- safety reputation;
- community connection;
- production quality;
- party atmosphere;
- experimentalism;
- family friendliness;
- accessibility;
- value for money.

Actions move these dimensions over time.

Examples:

- booking unknown artists increases discovery credibility;
- repeated artist hospitality failures reduce artist friendliness;
- an intrusive corporate sponsor may increase commercialism and reduce authenticity;
- investing in transport and free water improves safety and trust;
- expensive VIP expansion may improve luxury while alienating parts of the audience;
- repeated strong late-night programming increases party reputation;
- consistent local booking strengthens community connection.

Different audiences, artists, labels and sponsors prefer different identity profiles.

There is no universally optimal identity.

---

## 9. The living music industry

The industry must exist beyond the player’s festival.

### 9.1 Bands

Bands have:

- current ability;
- potential ability;
- individual members;
- genre and subgenre;
- sound profile;
- live profile;
- commercial profile;
- fan demographics;
- personality;
- relationships;
- label and agent representation;
- contracts;
- history;
- releases;
- touring activity;
- finances;
- morale;
- chemistry;
- fatigue;
- health;
- momentum;
- popularity;
- reputation;
- traits;
- goals.

Bands may:

- form;
- recruit members;
- lose members;
- change creative direction;
- release music;
- tour;
- improve;
- decline;
- go viral;
- gain critical acclaim without mainstream success;
- achieve commercial success without critical respect;
- change labels or agents;
- enter hiatus;
- split;
- reunite;
- produce solo projects;
- become legacy acts.

### 9.2 Band members

Members are individuals with their own careers, relationships, personalities, skills, health and ambitions.

A band’s strength must derive substantially from its members.

A member departure should change:

- ability;
- live performance;
- chemistry;
- sound;
- reliability;
- commercial appeal;
- relationships;
- fan reaction;
- future potential.

### 9.3 Wonderbands

Wonderbands are not a special hardcoded category visible to the player.

They are acts with unusual long-term potential relative to their current reputation. Their success is never guaranteed.

Potential may be wasted due to:

- poor development;
- weak professionalism;
- conflict;
- injury;
- bad management;
- unsuitable label strategy;
- poor releases;
- changing trends;
- bad luck;
- member departure.

Lower-potential acts may overperform through excellent chemistry, persistence, timing, live reputation or cultural relevance.

### 9.4 Labels

Labels have:

- genre identity;
- commercial strategy;
- finances;
- reputation;
- development quality;
- marketing capability;
- risk tolerance;
- roster strategy;
- relationships;
- contract philosophy;
- expansion goals.

Labels should discover, develop, sign, release and drop artists independently.

### 9.5 Agents

Agents represent artists and influence negotiations, career choices, fees and availability.

Agents have:

- negotiation ability;
- reputation;
- contacts;
- honesty;
- aggression;
- patience;
- greed;
- artist loyalty;
- festival preferences;
- package-deal tendencies;
- client strategy.

### 9.6 Genres and scenes

Genres and regional scenes evolve over time.

Each genre may change in:

- mainstream popularity;
- underground credibility;
- sponsor appeal;
- audience age;
- geographic strength;
- festival suitability;
- streaming strength;
- live demand.

Regional scenes affect where bands form and how they develop.

The world should be capable of producing periods where a city or region becomes culturally important without a scripted guarantee.

---

## 10. Festival industry simulation

### 10.1 Rival festivals

Rivals use the same fundamental rules as the player.

They must manage:

- budget;
- artist fees;
- dates;
- site capacity;
- sponsors;
- identity;
- reputation;
- ticket sales;
- staff;
- risk;
- expansion.

AI festivals have strategies such as:

- aggressive growth;
- cautious profitability;
- discovery specialism;
- prestige chasing;
- genre purity;
- community focus;
- luxury positioning;
- corporate expansion;
- artist-first culture.

AI should not know hidden artist truth unless its scouting or relationships justify that knowledge.

### 10.2 Festival companies

A company may own multiple festivals.

Shared resources may include:

- senior staff;
- scouting knowledge;
- relationships;
- cash reserves;
- supplier contracts;
- production equipment;
- sponsor agreements;
- artist package deals.

Multiple festivals create advantages and new risks:

- scheduling conflicts;
- cash-flow exposure;
- staff exhaustion;
- brand dilution;
- internal competition;
- shared reputational damage;
- cross-promotion opportunities.

### 10.3 Venues and sites

Sites are strategic assets, not cosmetic backgrounds.

Important variables include:

- capacity;
- licensed capacity;
- terrain;
- drainage;
- transport;
- emergency access;
- power;
- water;
- mobile signal;
- camping;
- parking;
- noise restrictions;
- curfew;
- neighbour tolerance;
- environmental sensitivity;
- weather exposure;
- expansion potential;
- natural beauty;
- brand potential;
- rental cost;
- purchase cost.

A beautiful site may be commercially and culturally valuable while remaining operationally difficult.

---

## 11. Scouting and knowledge

Scouting is central to the player fantasy.

The player should discover acts through:

- hired scouts;
- personal browsing;
- social media;
- label showcases;
- agents;
- local gigs;
- recommendations;
- media coverage;
- fan communities;
- staff networks.

### 11.1 Hidden truth

Actual values are stored separately from player knowledge.

The player may see:

- star estimates;
- ability ranges;
- potential ranges;
- report confidence;
- known and suspected traits;
- qualitative summaries;
- limited member information;
- uncertain commercial projections.

### 11.2 Scout quality

Scouting accuracy depends on:

- judgement;
- potential assessment;
- genre knowledge;
- regional knowledge;
- live observation;
- number of reports;
- report freshness;
- access to labels and agents;
- scout workload;
- personal bias.

Scouts may be confidently wrong.

Reports should become stale as artists change.

### 11.3 Artist social profile

Bands should eventually have a social/music profile combining elements of Instagram, MySpace, streaming platforms and a career database.

The player may inspect:

- posts;
- images;
- follower growth;
- fan comments;
- music demos;
- live clips;
- member profiles;
- release history;
- upcoming gigs;
- industry interest;
- scout reports.

AI-generated audio may later provide fictional demo tracks, but the core game must remain functional without requiring online generation.

---

## 12. Relationships and memory

Relationships must contain more than a single score.

Dimensions include:

- trust;
- respect;
- familiarity;
- affection;
- commercial value;
- professional confidence;
- current tension;
- loyalty.

Relationships also contain memories.

Examples:

- booked before famous;
- paid promptly;
- paid late;
- broke a promise;
- provided excellent hospitality;
- offered an insulting fee;
- supported an artist during illness;
- cancelled negotiations late;
- gave a career-defining slot;
- caused reputational harm;
- repeatedly worked together successfully.

Memories may:

- decay quickly;
- decay slowly;
- remain permanent;
- be interpreted differently by different personalities.

A loyal artist may accept less money from a festival that supported them early. A resentful agent may make later negotiations harder. A label may offer access to emerging talent after years of successful cooperation.

---

## 13. Negotiations

Negotiations should resemble a deep transfer or contract system rather than a single price check.

Artist booking terms may include:

- guaranteed fee;
- performance bonuses;
- ticket-sales bonuses;
- stage;
- billing position;
- performance time;
- set length;
- exclusivity radius;
- exclusivity period;
- travel;
- accommodation;
- hospitality;
- production requirements;
- marketing commitments;
- cancellation terms;
- payment schedule;
- future options.

Negotiation outcomes depend on:

- artist demand;
- agent personality;
- label involvement;
- relationship history;
- festival identity;
- stage suitability;
- rival offers;
- schedule;
- artist ambition;
- desired prestige;
- financial need;
- risk;
- player negotiator skill.

The player should sometimes choose between financial value and relationship value.

---

## 14. Sponsorship

Sponsors are strategic relationships, not free money.

Sponsors have:

- budget;
- target audience;
- industry;
- reputation;
- ethical profile;
- fan approval;
- commercial expectations;
- category exclusivity;
- desired visibility;
- risk tolerance;
- contract duration;
- activation requirements.

Possible demands include:

- stage naming rights;
- product exclusivity;
- branded areas;
- social campaigns;
- artist interviews;
- VIP allocation;
- minimum attendance;
- audience data;
- logo placement;
- sustainability targets.

A sponsor may increase revenue while damaging authenticity or preventing another partnership.

Sponsor success should depend on objectives being met.

---

## 15. Staff

Staff are persistent characters with careers.

Roles include:

- booking manager;
- scout;
- marketing director;
- operations manager;
- site manager;
- security chief;
- production manager;
- artist liaison;
- sponsorship manager;
- finance director;
- accessibility lead;
- sustainability lead.

Staff have:

- technical attributes;
- personality;
- ambition;
- loyalty;
- morale;
- workload;
- salary expectations;
- relationships;
- reputation;
- potential;
- interests from rivals;
- career history.

Staff may improve, decline, leave, be poached, disagree with strategy or become important figures in the player’s story.

---

## 16. Economy and finances

The economy must remain coherent over decades.

Player income may include:

- ticket sales;
- sponsorship;
- food and drink shares;
- merchandise;
- camping upgrades;
- VIP packages;
- grants;
- streaming or broadcast rights;
- supplier partnerships.

Expenses may include:

- artist fees;
- site rental;
- staff wages;
- production;
- security;
- transport;
- insurance;
- licensing;
- infrastructure;
- marketing;
- accommodation;
- cancellation costs;
- debt servicing.

Long-term systems should include:

- inflation;
- artist fee inflation;
- ticket-price tolerance;
- credit;
- debt;
- investment;
- ownership;
- financial collapse;
- acquisition.

Money must not appear without a source or disappear without a sink.

The Simulation Lab must track economy health over long test runs.

---

## 17. Ticket demand

Ticket demand is produced by interacting factors, including:

- lineup appeal;
- artist audience overlap;
- festival reputation;
- identity fit;
- ticket price;
- site appeal;
- travel difficulty;
- camping quality;
- marketing;
- social sentiment;
- customer loyalty;
- sponsor perception;
- competing events;
- economic conditions;
- weather expectations;
- past editions;
- capacity scarcity.

A lineup containing many popular artists should not automatically be optimal if all artists attract the same audience or conflict with festival identity.

---

## 18. Weekly simulation philosophy

Every time the player advances time, the engine runs a deterministic sequence of systems.

A conceptual weekly order is:

1. Advance calendar.
2. Execute scheduled events.
3. Update health and recovery.
4. Develop or decline members.
5. Recalculate bands.
6. Update morale, chemistry and fatigue.
7. Simulate releases, gigs and social growth.
8. Progress active story arcs.
9. Test eligibility for new emergent events.
10. Process labels and agents.
11. Process rival festivals.
12. Process sponsors and venues.
13. Calculate ticket sales.
14. Process finances and contracts.
15. Generate structured simulation events.
16. Generate news, social posts and inbox messages from those events.
17. Record history and snapshots.
18. Save atomically.

The order must be versioned because changing it may change deterministic outcomes.

---

## 19. Probability philosophy

Randomness is allowed, but flat unexplained randomness should be avoided for important events.

Every major probability should include:

- eligibility conditions;
- base probability;
- positive modifiers;
- negative modifiers;
- cooldowns;
- seasonal limits;
- context;
- outcome branches;
- recorded cause breakdown.

Example structure:

```text
Band conflict probability

Base risk                  +0.10%
Low chemistry              +0.80%
High fatigue               +0.45%
Creative Differences       +1.20%
Financial stress           +0.30%
Strong professionalism     -0.40%
Recent success             -0.25%
--------------------------------
Final weekly probability    2.20%
```

The player will not normally see exact hidden calculations, but the development tools should.

The game may present qualitative explanations such as:

- “The group appears exhausted after a demanding tour.”
- “Creative tensions have increased.”
- “Recent success has improved morale.”

---

## 20. Story arcs

Major developments should unfold through persistent story arcs rather than isolated popups.

Examples include:

- band conflict;
- member departure;
- solo project;
- viral breakthrough;
- career decline;
- label dispute;
- contract conflict;
- staff poaching;
- sponsor controversy;
- licensing crisis;
- festival financial collapse;
- ownership takeover;
- band reunion;
- site dispute;
- weather crisis;
- cultural movement.

A story arc contains:

- participants;
- causes;
- current stage;
- severity;
- next evaluation date;
- possible branches;
- resolution;
- historical record.

Arcs should interact with other systems.

For example, a member dispute may reduce live performance, create rumours, affect ticket sales, attract label intervention and eventually lead to a departure.

---

## 21. Festival weekend

The festival itself must be an active simulation, not only a final score screen.

The event weekend should progress through a live timeline.

Possible developments include:

- queues;
- transport delays;
- weather changes;
- stage delays;
- artist lateness;
- technical failures;
- overcrowding;
- campsite incidents;
- medical issues;
- social-media moments;
- surprise performances;
- outstanding sets;
- poor sets;
- security concerns;
- supplier shortages.

Player decisions may include:

- redeploying staff;
- delaying performances;
- opening additional entrances;
- authorising emergency spending;
- changing crowd flow;
- issuing public communication;
- cancelling or moving acts;
- changing transport operations;
- responding to weather.

The weekend creates:

- financial outcomes;
- artist memories;
- fan reviews;
- press stories;
- sponsor evaluations;
- operational learning;
- reputation changes;
- historical moments.

---

## 22. Difficulty philosophy

Difficulty should come from constrained resources, imperfect information and intelligent competition—not invisible cheating.

Harder difficulties may change:

- starting capital;
- credit availability;
- reputation;
- staff quality;
- scouting knowledge;
- rival strength;
- council tolerance;
- audience patience;
- sponsor expectations;
- consequences of failure.

Harder modes should not simply multiply random failure rates.

The intended normal experience should be demanding. Players may lose money, miss artists, make poor scouting decisions and fail to grow. Recovery should usually remain possible when the player understands the causes.

Suggested initial modes:

- Dreamer;
- Promoter;
- Festival Veteran;
- Survival.

These names and values remain provisional until balance testing.

---

## 23. Success, failure and legacy

Headliner does not require a single traditional victory screen.

Success may mean:

- surviving the first season;
- building a profitable independent event;
- becoming the leading discovery festival;
- creating a global festival company;
- developing an iconic site;
- maintaining authenticity while growing;
- creating legendary lineups;
- supporting artists throughout their careers.

Failure states may include:

- bankruptcy;
- revoked licence;
- forced sale;
- investor removal;
- reputational collapse;
- loss of site;
- company insolvency.

Some failures should allow continuation in another role or through a reduced operation rather than always ending the save immediately.

The game should preserve career records including:

- festivals created;
- editions completed;
- artists discovered;
- greatest performances;
- attendance records;
- financial records;
- awards;
- disasters;
- staff careers;
- rivalries;
- legacy scorecards.

---

## 24. Customisation and brand creation

Customisation is a major pillar.

### 24.1 Logo creator

The player should eventually create logos using layered components:

- shape;
- symbol;
- primary text;
- secondary text;
- colour palette;
- texture;
- effects;
- spacing;
- lockups.

Logo styles may include:

- minimal;
- vintage;
- psychedelic;
- hand-drawn;
- neon;
- industrial;
- luxury;
- folk;
- punk;
- electronic.

### 24.2 Poster creator

Each festival edition should generate or allow creation of a poster based on:

- lineup hierarchy;
- festival branding;
- colours;
- typography;
- artwork;
- sponsor placement;
- date and site details.

Posters become part of the permanent archive.

### 24.3 Stage and site identity

Players should name and brand stages, areas and campsites.

These identities may build their own reputations over time.

### 24.4 Mechanical effect

Branding affects:

- social engagement;
- audience fit;
- sponsor interest;
- merchandise appeal;
- perceived authenticity;
- perceived prestige;
- campaign effectiveness.

It should never be the sole cause of success, but it should matter.

---

## 25. User interface principles

The player-facing UI should combine:

- Football Manager-style information density;
- social-media familiarity;
- modern music branding;
- clear hierarchy;
- quick navigation;
- contextual explanation.

The homepage should contain:

- inbox or direct messages;
- central social/news feed;
- tasks and deadlines;
- fan sentiment;
- ticket and finance summaries;
- lineup status;
- scouting updates;
- upcoming events;
- rival activity.

UI rules:

- important information must be visible without excessive clicking;
- hidden truth must remain hidden;
- uncertainty should be displayed clearly;
- consequences should be traceable;
- tables must support filters, sorting and comparison;
- contextual tooltips should explain displayed values;
- major events should feel dramatic without obscuring management information;
- all pages should share the same dark, premium visual language.

The Simulation Lab is a developer tool and may expose hidden truth. The final player UI may not.

---

## 26. Audio and fictional music

The long-term vision includes fictional music created for generated artists.

Possible implementation levels:

1. Text-only descriptions of sound.
2. Locally bundled genre and mood samples.
3. Procedurally assembled instrumental snippets.
4. Optional AI-generated fictional tracks.

The game must not depend on copying identifiable living artists or generating direct imitations.

Prompts and descriptions should use original combinations of musical qualities rather than requests to sound exactly like a named artist.

Audio generation must remain optional, cacheable and compatible with offline play where possible.

---

## 27. Simulation testing and balance

The Simulation Lab is essential infrastructure.

It should support:

- deterministic seeds;
- world-size settings;
- fast-forwarding;
- 5, 10, 15 and 20-year checkpoints;
- entity inspection;
- probability breakdowns;
- event history;
- economy reports;
- genre reports;
- regional reports;
- comparison across seeds;
- exportable JSON and CSV reports;
- automated batch runs.

Important balance questions include:

- Are too many bands splitting?
- Are too few bands changing members?
- Does every wonderband succeed?
- Do followers inflate unrealistically?
- Do artist fees outgrow festival income?
- Do festivals become too large too quickly?
- Do AI festivals remain solvent?
- Does one genre dominate permanently?
- Are relationships influential enough?
- Are major events rare enough to remain meaningful?

Balance should target plausible ranges, not identical results.

---

## 28. Persistence and save integrity

Saves must preserve long-term history reliably.

Each save stores:

- initial seed;
- current RNG state;
- simulation version;
- database schema version;
- calendar;
- complete entity state;
- relationships;
- memories;
- contracts;
- scheduled events;
- active story arcs;
- history;
- player knowledge;
- branding assets;
- settings.

A weekly simulation update should be applied as an atomic database transaction. A crash must not leave a partially simulated week.

Database migrations must preserve old saves whenever possible.

---

## 29. Technical architecture principles

The architecture is divided into four layers:

### 29.1 Domain

Defines entities, value types, IDs, ranges and invariants.

### 29.2 Simulation

Processes time and changes the world.

### 29.3 Persistence

Stores and retrieves world state through SQLite.

### 29.4 Presentation

Displays state and collects player decisions.

The simulation must be runnable without the desktop UI for automated testing.

Core functions should be deterministic when provided the same:

- world state;
- seed and RNG state;
- simulation version;
- player decisions.

---

## 30. Content philosophy

Procedural generation provides scale, but handcrafted reference content provides coherence.

Handcrafted data should include:

- genres and subgenres;
- roles;
- traits;
- event definitions;
- site types;
- sponsor categories;
- naming fragments;
- regional profiles;
- narrative templates;
- design components.

Generated content combines these ingredients into unique entities.

Generated names, biographies and news must avoid offensive accidental combinations through filtering and validation.

---

## 31. Development priorities

### Milestone A — Design foundation

- Design Bible;
- Simulation Principles;
- Data Dictionary;
- Probability Model;
- Relationship Model;
- balance targets.

### Milestone B — Music Genome

- exact band and member attributes;
- trait framework;
- genre and scene model;
- hidden truth and scouting knowledge;
- derived ratings.

### Milestone C — Persistent world

- SQLite migrations;
- save creation;
- world generation;
- database browser;
- versioning.

### Milestone D — Living simulation

- weekly pipeline;
- member development;
- band progression;
- relationships;
- health;
- conflicts;
- releases;
- rival decisions;
- economy;
- history.

### Milestone E — First playable vertical slice

- create festival;
- dashboard;
- scouting;
- band profiles;
- negotiations;
- booking;
- continue week;
- save/load;
- simple ticket sales;
- basic festival result.

### Milestone F — Festival season

- sponsorship;
- venue selection;
- lineup builder;
- operations;
- marketing;
- live festival weekend;
- season archive.

---

## 32. Locked design decisions

The following decisions are considered locked unless testing strongly disproves them:

1. Desktop first.
2. Tauri, React, TypeScript and SQLite.
3. The world simulates independently of the player.
4. Bands contain individual persistent members.
5. Hidden truth is separate from player knowledge.
6. Important outcomes use contextual probability.
7. Relationships contain memories.
8. Major stories use multi-stage arcs.
9. Rival festivals obey financial and informational constraints.
10. Festival identity emerges from decisions.
11. Every edition and major career event is archived.
12. Customisation has mechanical consequences.
13. Simulation can run headlessly for testing.
14. Seeds and simulation versions make outcomes reproducible.
15. The initial player-facing game is one festival; multiple festivals are later progression.

---

## 33. Open design questions

These require prototypes or balance testing before being locked:

- Exact starting world size.
- Exact simulation time step for different systems.
- Whether all bands are fully simulated or some use lower-detail simulation tiers.
- Exact injury and health terminology.
- Extent of romantic and family-life simulation for members.
- How much control the player has over artist development.
- Whether the player can own labels or agencies in the base game.
- Exact end-state and retirement systems.
- Exact AI music implementation.
- Exact site-construction depth.
- Exact number and scale of attributes.
- Exact economy and inflation model.
- How many countries are included at first release.
- Whether the first public version begins in one country or several.
- Mod support and community databases.
- Online features, cloud saves and workshop integration.

Open questions must not block foundational architecture unless they affect schema compatibility.

---

## 34. The Headliner test

Before approving a feature, ask:

1. Does it create meaningful decisions?
2. Does it interact with existing systems?
3. Can it generate different outcomes across saves?
4. Can the player understand its consequences?
5. Does it contribute to long-term stories?
6. Does it respect incomplete information?
7. Can AI actors use it under the same rules?
8. Can it be tested deterministically?
9. Can it be stored and migrated safely?
10. Does it strengthen the fantasy of running a festival in a living music industry?

If the answer to most of these is no, the feature should be reconsidered.

---

## 35. Final statement

Headliner should make players feel that they entered a world with its own history, shaped it through years of decisions, and left behind a festival culture that could not have existed in any other save.

The game’s greatest achievement will not be a perfect score or the largest bank balance.

It will be the stories players tell:

> “You had to be there.”
