---
doc: spec
status: approved
---
<!-- `status` is the progress state every skill reads. Write `draft` when you first save this file,
     and change it to `approved` when the learner clearly approves the displayed plan ("looks good" counts).
     Do not request a second sign-off. Never skip the draft save —
     an unsaved draft dies with the conversation. -->

# AeveAI — Technical Spec

## How This Works, In Plain Language

AeveAI is a single web app. You type a product idea into it, and it runs a short
pipeline of steps. Each step asks a language model a question and gets back
**structured data** — a shape the app can rely on, not a paragraph of prose the
app would have to guess at. That distinction is the whole architecture.

**Zod** is a library for describing the shape of data in TypeScript. We use it to
say "Product DNA is an object with exactly these four fields, all of them text"
and then check that what came back actually matches. **Structured outputs** is a
Claude feature (`output_config.format`) where you attach that shape to the
request, and the model is *constrained* to answer in it. The model cannot return
a missing field or invent an invalid option, because the shape doesn't permit
one. So AeveAI never parses prose and never guesses.

Each pipeline step is one call: a prompt, a Zod shape, and back comes a typed
object. There are **three** of them — Product DNA, Reduction, Technical Plan.
The other stages are derived from those three without calling the model again.

**Business rules are checked separately, and this matters.** A Zod shape can
describe structure but it can't easily express "this plan must include at least
one data source," because the model API rejects that kind of constraint in the
shape. So after a response comes back and matches its shape, AeveAI runs its own
checks on what it says. Structure comes from the schema; meaning comes from our
code. Both layers are needed.

**The building blocks are fixed React components**, not generated code. AeveAI's
Technical Plan names which blocks to use and configures each one — what the
entity is called, what fields it has. The app then assembles those configured
components into a working prototype inside the same screen. That's why the
prototype can't crash: it's our code, running with our instructions.

**Blocks have a one-way dependency.** `CRUD` and `Document/Editor` *create* data —
they're data sources. `Search` and `Dashboard` can only *read* data that a source
provides. A plan with no data source, or a Search with nothing to search, is
rejected. That rule is what makes two different ideas produce two genuinely
different shapes instead of the same app twice — and it's enforced in code, not
hoped for.

**For the demo, we record and replay the model responses.** We do one real run,
save the three API responses to files, and replay those. Every other part —
sequencing, validation, rule checks, block assembly, the running prototype — is
live and real. Only the network call is served from a file, so the recording is
repeatable and can't fail from a rate limit. The normal path stays live, and the
README explains how to run it with a real API key.

## The Core Journey Through the System
Traces `prd.md > The Core Journey` through the pieces above.

1. **Open the app** → `page.tsx` renders the Idea state: value line, one input,
   three examples. No run exists yet.
2. **Type an idea, submit** → the client creates a run record and calls
   `runPipeline`. The workspace switches to Product DNA in progress.
3. **Product DNA** → one API call. Zod shape `dna.ts`; the prompt asks for
   product type, target users, core problem, and fundamental functionality, plus
   a **verdict** field. Validated, then stored on the run.
4. **Reduction** → one API call, given the DNA as context. Returns the broad
   candidate feature set, each marked `core` or `leftOut`, and every `leftOut`
   entry carries a `reason`. Validated, rule-checked, stored.
5. **MVP** → **no API call.** Derived from the Reduction result by
   `deriveMvp()` in `mvp.ts`. Deterministic, so it is guaranteed to be derived
   from the Reduction rather than generated independently, and it costs nothing.
6. **Technical Plan** → one API call, given DNA + MVP. Returns architecture,
   components, data model, and the block list with config and reasoning. Validated,
   then rule-checked by `rules.ts`: at least one data source, and every consumer's
   `sourceId` resolves to a real data source block.
7. **Build** → **no API call.** `assemble.ts` turns the validated plan into an
   ordered list of configured block instances. The workspace renders
   `PrototypeHost`, which mounts the real components.
8. **Use the prototype** → block components read and write to `localStorage`
   under a run-scoped key. Refresh the page and the data is still there.
9. **Challenge a cut** (optional) → one more API call, given the feature and its
   original reason. Returns a tradeoff explanation. Changes nothing.
10. **Compare runs** → on starting a new run, the previous run's DNA, MVP shape,
    and block list are retained and shown in `PreviousRun`.

A full run is **three model calls**, plus one per challenge.

```
┌──────────────┐   3 API calls    ┌─────────────────────┐
│ Anthropic API│◀────────────────▶│  runStage() choke   │
└──────────────┘   or replay file └──────────┬──────────┘
                                ┌────────────▼───────────┐
                                │ Zod shape + rule check │
                                └────────────┬───────────┘
                                ┌────────────▼───────────┐
                                │  assemble() → blocks   │
                                └────────────┬───────────┘
                                ┌────────────▼───────────┐
                                │ PrototypeHost (live UI)│
                                └────────────────────────┘
```

## Stack
Learner-selected. Each choice below was confirmed in the `4-spec` interview.

| Choice | Version | Docs | Why |
|---|---|---|---|
| Next.js (App Router) | latest stable at build time — **verify** | https://nextjs.org/docs | Already in their stack; one app gives UI *and* a server route, so no separate backend service. |
| TypeScript | bundled with Next.js | https://www.typescriptlang.org/docs | Already their primary language. |
| Zod | v4 (native JSON Schema), `4.6.5` verified | https://zod.dev | Single source of truth for every stage shape; validates at runtime *and* converts to the strict JSON Schema Claude needs. |
| Anthropic TypeScript SDK | `@anthropic-ai/sdk@0.128.0` verified | https://github.com/anthropics/anthropic-sdk-typescript | Ships `zodOutputFormat()`, the zod helper that does the schema conversion for us. |
| Claude Structured Outputs | requires Sonnet 4.5+, Opus 4.5+, or Fable 5+ | https://platform.claude.com/docs/build-with-claude/structured-outputs | Guarantees the response matches the schema. Without it we'd be parsing prose. |
| React | bundled with Next.js | https://react.dev | Block components are React. |
| CSS Modules or plain CSS custom properties | — | — | No Tailwind, no UI kit. The design direction is specific enough that a design system would cost more than it saves, and a utility framework actively works against the "not a generic AI app" requirement. |

**No separate backend service, no database, no auth, no Docker.** A database was
considered for the prototype's data and rejected: the requirement is "survives a
refresh during the demo," which `localStorage` satisfies completely. Docker would
be pure overhead for a single-user local app.

**Model:** pinned to **`claude-sonnet-5`** — confirmed against
`platform.claude.com/docs/about-claude/models/overview` as supporting Structured
Outputs, and described there as "the best combination of speed and intelligence"
($2/$10 per MTok). Not the cheapest tier (Haiku) or the flagship (Fable); chosen
the same way the original OpenAI pick was — mid-tier, cost proportional to a
handful of hackathon runs, reasoning strength still the priority for the
Reduction stage. **Reasoning quality on the Reduction stage should still be
checked on the first real run**; escalate to `claude-opus-5-5` if it isn't
specific enough.

**Cost and rate limits: not verified.** Flagged for day one. At three calls per
run and a handful of runs, total cost should be negligible on any paid tier.
The structural mitigations are already in place — three calls instead of six, and
replay mode for the recording — so a rate limit should not threaten the demo.

## Where It Runs and How Someone Tries It
- **Runtime:** browser, plus a local Next.js dev server. No other services.
- **Requirements:** Node.js 20+ (Node 26.7.0 and npm 11.19.0 confirmed present
  locally), and an Anthropic API key in `.env.local` as `ANTHROPIC_API_KEY`.
- **Start:** `npm install` then `npm run dev`, open `http://localhost:3000`.
- **The key is server-side only.** It's read in the route handler and never sent
  to the browser.
- **Without a key the app still loads** the empty state and example ideas; only
  starting a run fails, with a clear message pointing at the README.

### Demo recording
- Submission requires a **short demo video** and a **public GitHub repository**.
  Deployment is optional and is not a substitute for either.
- Record from `npm run dev` with `AEVE_REPLAY=1`, which replays the recorded
  responses in `src/replays/`.
- **Warm the schema cache first.** Structured outputs compile each schema into a
  grammar on first use and cache it for 24 hours; the first request using a *new*
  schema is slower while that compiles. Do one throwaway live run before hitting
  record, or the recording will open with a slow Product DNA stage.
- **Deployment is deferred.** The learner chose not to add deployment work unless
  the implementation is already complete and stable. If it's wanted later, Next.js
  is the easy case — but the app needs a server-side key, so any host must accept
  a secret environment variable, and a static export will not work.

## Look and Feel
Carried from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.
Do not re-open design decisions.

- **References:** Linear, Vercel, Raycast, modern developer tools.
- **Palette:** mostly neutral — near-black text on off-white or a single dark
  surface, greys for structure. **One distinctive accent color**, used sparingly
  and deliberately: for the current stage, for the surviving MVP features, and
  for the primary action. Nowhere else. The accent is the only saturated color on
  screen at any time, so it carries the eye to the thing that matters.
- **Typography:** strong. One sans-serif with good weight range for UI, and a
  monospace face for AI-generated artifacts — Product DNA, plan contents, and
  code — so the boundary between *the tool's opinion* and *the tool's output* is
  visible. Generous line height, real heading hierarchy, no all-caps labels.
- **Density and energy:** spacious and calm. Generous whitespace, subtle 1px
  borders instead of shadows, restrained motion — short fades on stage change,
  nothing that bounces or spins.
- **Tone of interface copy:** confident and plain. States facts, gives reasons,
  doesn't apologise and doesn't cheerlead. This is a tool that commits to a
  decision.

### How the design serves the kernel
`prd.md > Reduction` is the centerpiece, so the Reduction stage gets the
strongest visual contrast in the app: surviving features large and high-contrast
in the accent, excluded features small, muted, and collapsible after the initial
reveal — with each exclusion's reason still reachable. **The user's eye should
land on what survived, and the excluded set should read as already settled.**
That single contrast is the product's thesis rendered as a layout decision.

### Avoid
Purple AI gradients · robot/AI avatars · excessive glassmorphism · huge rounded
cards everywhere · generic "AI magic" sparkles · a chat interface as the primary
interaction · raw token streaming shown to the user.

**Consistency with the stack:** plain CSS custom properties can honor all of
this. Nothing here requires a component library.

## Components
Each heading names the PRD behavior it serves, so `5-build` can cite them.

### Workspace Shell
The single progressive view. Owns the run record and the current stage index;
renders the stage rail, the active stage, and collapsed summaries of completed
stages. Never navigates — no routes, no page transitions.
PRD ref: `prd.md > Screens and Layout`, `prd.md > The Core Journey`.

### Idea Input (first state)
Value line, one large input, three example ideas. Clicking an example **prefills**
the input rather than submitting (`prd.md > Open Questions`, agent assumption).
PRD ref: `prd.md > Starting a Run`.

### Stage Rail
The always-visible `Idea → Product DNA → Reduction → MVP → Technical Plan →
Build` progress indicator. Shows the current stage; completed stages stay
reachable.
PRD ref: `prd.md > Screens and Layout`.

### DNA Stage
Renders the four Product DNA fields.

**Also the input gate.** `dna.ts` carries a `verdict` field —
`product` | `notAProduct` | `tooVague` — plus a nullable `response` message.
`notAProduct` ("build me a sandwich") and `tooVague` ("an app") short-circuit the
pipeline here: no Reduction call is made, and the message explains what's missing
and asks for more context. **It must never fall through and invent a product** —
that would contradict the kernel, and `prd.md > States and Boundaries` forbids it
explicitly. This is the structural reason the gate lives in the schema rather than
in a prompt instruction.
PRD ref: `prd.md > Product DNA`, `prd.md > States and Boundaries`.

### Reduction Stage
The centerpiece. Renders the broad candidate set, then **CORE MVP** and **LEFT
OUT** as two clearly labelled groups, each exclusion with its reason beside it.
Survivors visually dominant; excluded muted/collapsible after reveal. Hosts the
**Challenge this decision** action.
PRD ref: `prd.md > Reduction`, `prd.md > Challenging a Reduction Decision`.

### MVP Stage
Renders the derived MVP. Not a separate model call.
PRD ref: `prd.md > MVP Scope`.

### Plan Stage
Architecture, components, data model, and the block list with each block's
reasoning.
PRD ref: `prd.md > Technical Plan`.

### Build Stage
The single Build action, then hands off to the prototype.
PRD ref: `prd.md > Build and the Working Prototype`.

### Stage Error
Names the failed stage, states that completed stages are preserved, offers retry.
PRD ref: `prd.md > States and Boundaries`.

### Previous Run
The thin record — previous run's DNA, MVP shape, and block list — shown
subordinate to the current run. **One previous run only.** Not history, not
project management.
PRD ref: `prd.md > Previous-Run Comparison`.

### Stage Runner (server)
The single choke point for every model call. In order: replay lookup → live
Anthropic call → refusal check → truncation check → Zod parse → business-rule check.
Everything model-related passes through here, which is what makes the failure
handling uniform and testable.
PRD ref: all `prd.md > Features and Behavior` behaviors that call the model.

### Block Registry
Maps each of the four block ids to its config schema, its component, and whether
it is a **data source** or a **consumer**. Adding a fifth block means adding one
entry here — nothing else changes.
PRD ref: `prd.md > Technical Plan`, `prd.md > Honest Refusal`.

### Block: CRUD (data source)
Creates a managed collection: list, create, edit, delete over one entity type.
Configured by entity name and field list.
PRD ref: `prd.md > Build and the Working Prototype`.

### Block: Document/Editor (data source)
Authoring and storing documents with editable content. Configured by document
type name and seeded sample documents.
PRD ref: `prd.md > Build and the Working Prototype`.

### Block: Search/Filtering (consumer)
Queries an existing data source. Cannot create one. Configured by which source it
queries and which fields are searchable.
PRD ref: `prd.md > Build and the Working Prototype`.

### Block: Dashboard (consumer)
Read-only aggregates over an existing data source — counts and summaries.
Cannot create one.
PRD ref: `prd.md > Build and the Working Prototype`.

### Prototype Host
Renders the assembled block instances. Replaces the stage views in the same
surface at Build — not a new page, not an iframe.
PRD ref: `prd.md > Build and the Working Prototype`.

## Data Model
Where each piece of data lives, how it changes, and what survives a refresh.

### Run record (AeveAI's own state)
Created on submit; lives in memory in the Workspace and mirrored to
`localStorage` under `aeve:run:current` so a refresh mid-run doesn't lose work.
Holds: idea text, current stage index, and the completed stage outputs (DNA,
reduction, derived MVP, plan).

- **Updated by:** each stage completing, or failing.
- **On refresh:** rehydrated and the pipeline resumes at the first incomplete
  stage. Completed stages are never recomputed.
- **On new run:** the current run's DNA, MVP shape, and block list are copied to
  `aeve:run:previous` (overwriting whatever was there — **one record only**), and
  the current record is reset.

### Generated prototype data
Owned by the prototype, not by AeveAI. Each block reads and writes its own data
under `aeve:proto:<runId>:<blockId>`. Persists across refresh, which is a PRD
requirement. Discarded when a new run starts, because a new run gets a new
`runId` — this is the "disposable as a project" boundary made concrete.

### Stage schemas (Zod, no storage)
`dna`, `reduction`, `mvp`, `plan` — shapes only, defined in `src/lib/schemas/`.
They describe what the model must return and are converted to strict JSON Schema
for the request. Never persisted.

## File Structure
```
aeve-ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # shell, fonts
│   │   ├── page.tsx                   # empty state — input + examples
│   │   ├── globals.css                # palette, type scale, spacing tokens
│   │   └── api/
│   │       └── stages/
│   │           └── [stage]/route.ts   # THE choke point: replay→live→validate
│   ├── components/
│   │   ├── workspace/                 # the single progressive view
│   │   │   ├── Workspace.tsx          # owns run record + stage index
│   │   │   ├── IdeaInput.tsx          # first state
│   │   │   ├── StageRail.tsx          # Idea→…→Build progress
│   │   │   ├── DnaStage.tsx
│   │   │   ├── ReductionStage.tsx     # CORE MVP / LEFT OUT + reasons
│   │   │   ├── MvpStage.tsx
│   │   │   ├── PlanStage.tsx
│   │   │   ├── BuildStage.tsx
│   │   │   ├── ChallengeButton.tsx
│   │   │   ├── PreviousRun.tsx
│   │   │   └── StageError.tsx         # named failure + retry
│   │   └── prototype/
│   │       ├── PrototypeHost.tsx      # renders assembled blocks
│   │       └── blocks/
│   │           ├── registry.ts        # id → schema, component, dataSource?
│   │           ├── CrudBlock.tsx      # data source
│   │           ├── DocumentBlock.tsx  # data source
│   │           ├── SearchBlock.tsx    # consumer
│   │           └── DashboardBlock.tsx # consumer
│   ├── lib/
│   │   ├── schemas/
│   │   │   ├── dna.ts                 # Zod shape per stage
│   │   │   ├── reduction.ts
│   │   │   ├── plan.ts
│   │   │   ├── mvp.ts                 # derived shape + deriveMvp()
│   │   │   └── rules.ts               # post-parse business rules
│   │   ├── pipeline/
│   │   │   ├── runStage.ts            # replay/live/validate/rule-check
│   │   │   ├── runPipeline.ts         # sequencing + failure preservation
│   │   │   └── prompts.ts             # per-stage prompts
│   │   ├── blocks/
│   │   │   ├── dependencies.ts        # data-source vs consumer enforcement
│   │   │   └── assemble.ts            # validated plan → block instances
│   │   ├── replay/
│   │   │   └── cassettes.ts           # read/write recorded responses
│   │   └── store/
│   │       └── runState.ts            # current run + one previous record
│   └── replays/                       # recorded API responses (JSON)
│       └── <idea-slug>/<stage>.json
├── devpost/                           # learner profile, scope, prd, spec
├── .env.example                       # documents ANTHROPIC_API_KEY, no secrets
├── package.json
└── README.md                          # setup, key, live vs replay, demo steps
```

## External Services and Dependencies

### Anthropic API
- **Purpose:** the three pipeline stages plus on-demand challenges.
- **Call:** `client.messages.create()` with `output_config.format` set to a
  Zod-derived JSON Schema via the SDK's `zodOutputFormat()` helper. `runStage.ts`
  reads `stop_reason` and parses the response itself rather than using the SDK's
  `messages.parse()` convenience, which throws on a schema mismatch instead of
  returning null — not a fit for a refusal we want to handle as data.
- **Auth:** `x-api-key: $ANTHROPIC_API_KEY`, set by the SDK from the environment,
  server-side only.
- **Docs:** https://platform.claude.com/docs/build-with-claude/structured-outputs
- **SDK helper:** https://github.com/anthropics/anthropic-sdk-typescript/blob/main/helpers/zod.ts
- **Zod JSON Schema:** https://zod.dev/json-schema

**Constraints that shape our schemas** (all confirmed in the docs):
- **Every field must be `required`.** Optionality is a nullable union.
- **`additionalProperties: false` on every object.** The SDK helper handles this.
- **Unsupported keywords include `minItems`, `minLength`, `minimum`, `maximum`,
  and others.** Unlike the OpenAI helper originally evaluated, the Anthropic
  TypeScript SDK auto-strips these from schemas it derives and folds the
  constraint into the field's description — but business rules still live in
  `rules.ts`, not the schema, per the architecture decision. See **Verification**
  below.
- **Two failure modes the schema does not cover:** the model may **refuse**
  (`stop_reason: "refusal"`, a plain-text explanation instead of the requested
  shape), and generation may be **truncated** at the token limit
  (`stop_reason: "max_tokens"`). Both are detected explicitly in `runStage.ts`.
- **First request with a new schema is slower** while its grammar compiles; the
  compiled grammar is cached for 24 hours from last use. Warm before recording.

### Local storage (browser)
Prototype data and run records. No network, no cost, no account.

## Verification
How we know the kernel is real, not just demoed. Serves
`prd.md > Acceptance Criteria — Kernel Integrity`.

### Day-one build check
**Verified before building on it.** Zod refinements (`.min()`, `.max()`)
generate JSON Schema keywords that structured-outputs strict mode doesn't
support. Installing `@anthropic-ai/sdk@0.128.0` and `zod@4.6.5` and running
`zodOutputFormat()` against a schema with `.min()`/`.max()` confirmed the SDK
auto-strips these and moves the constraint into the field description, rather
than passing them through for the API to reject (which is what the OpenAI
helper originally evaluated does). The plan is unchanged regardless: keep
schemas plain, put business rules in `rules.ts` — this was the decision before
the verification and stays the decision after it.

### Runtime checks
- **Plan validation:** at least one data source block. Consumers reference a real
  `sourceId`. Violations surface as a validation failure, not a broken prototype.
- **Honest refusal:** an unsupported capability produces an explicit explanation,
  never a fake.

### Manual falsification test (the kernel test)
Run two contrasting ideas through the full pipeline — the Notion-for-students
idea (document-oriented) and the expense-tracker idea (resource/dashboard-shaped).
Then check, per `prd.md > Acceptance Criteria — Kernel Integrity`:
- [ ] Reduction counts differ, or match for defensible reasons
- [ ] Block selections differ
- [ ] Excluded-feature reasons are specific, not repeated boilerplate
- [ ] The previous-run record shows the contrast

**If both runs produce the same shape, the kernel is falsified and that gets
reported**, not hidden. That's the test, and it is allowed to fail.

## Important Failure Modes
The three places this will realistically break.

- **Model refuses the request** → not a schema error; a refusal marker comes
  back instead of the shape. Detected explicitly and rendered as an honest
  failure. `prd.md > States and Boundaries` requires no fake output, so we never
  substitute a placeholder.
- **Output truncated at the token limit** → the response no longer matches its
  schema. Check the finish reason before parsing; treat as a retryable stage
  failure.
- **Input isn't a usable product idea** ("build me a sandwich", "an app") → the
  DNA stage's `verdict` catches it and the pipeline stops there with a request
  for context. Never invent a product to keep the pipeline moving.
- **A stage fails after earlier stages succeeded** → all completed stages are
  preserved on the run record. The UI names the failed stage, states that the
  earlier work is safe, and offers retry for that stage only.

Lower probability, still handled: a rate limit or network error mid-run is
surfaced the same way as a stage failure, and the run resumes at the failed stage.

## What Was Simplified and Why
Engineering judgment, recorded so the build doesn't quietly undo it.

- **Fixed block components instead of generated code** — the learner chose the
  registry. Generated code would be more spectacular and would mean live-debugging
  unpredictable output during a recorded demo. The full version would need
  validation, error recovery, and a review pass per generated app.
- **MVP derived, not generated** — `deriveMvp()` produces the MVP from the
  reduction with no model call. This *satisfies* `prd.md > MVP Scope` (which
  requires the MVP be derived from the reduction, not generated independently),
  guarantees it, and removes one call per run. Six calls became three.
- **`localStorage` instead of a database** — the requirement is surviving a
  refresh. A database would add a service, a schema, and a failure mode to
  satisfy a requirement `localStorage` already meets.
- **Recorded response replay instead of a live-call demo** — makes the recording
  reproducible and immune to rate limits, while the pipeline stays genuinely
  live. The tradeoff is that the video shows a genuine recorded run rather than
  live variance, and it must be labeled that way in the video and README.
- **Plain CSS instead of a component library** — the design direction is specific,
  and a library pulls toward the generic look the PRD explicitly rejects.
- **No token streaming** — decided at the PRD stage; staged reveal only.

## Decisions and Open Issues

**Learner decisions (this interview):**
- **Block registry, not code generation** — fixed reusable components configured
  by a schema-valid JSON plan. Accepted tradeoff: loses the "watch it write an
  app" spectacle, gains a demo that cannot break.
- **One-way block dependency** — `CRUD` and `Document/Editor` create data;
  `Search` and `Dashboard` only consume it. A valid plan must contain at least
  one data source; consumers can't create independent data. This is what makes
  the falsification test meaningful rather than label-swapping.
- **Next.js + TypeScript, single app, route handler for Anthropic, key
  server-side, Zod everywhere, no separate backend** — keeps implementation
  proportional.
- **Anthropic only, no multi-provider support** — explicitly out of scope.
  Switched from the originally planned OpenAI during the build (see **Open
  issues**); the constraint itself — one provider, no abstraction layer — is
  unchanged.
- **HTTP response recording/replay for the demo, live path retained** — the
  replayed flow still passes through validation, sequencing, block mapping, and
  prototype assembly.
- **Local `npm run dev`; deployment optional and last** — "unless the
  implementation is already complete and stable."

**Implementation details derived from those decisions** (not separate learner
choices): MVP derived rather than generated; business rules in `rules.ts` rather
than the schema; one stage runner as the single choke point; `localStorage` keys
as named above.

### The learner's stated unfamiliarity, and how it's addressed
The learner is **new to schema-first orchestration** — they have integrated LLM
APIs and done prompt engineering, but not built a pipeline where every response
is schema-validated and drives the next stage. They named this as something they
want to practice, and it's their learning goal for the build.

Addressed by: the plain-language section above; keeping exactly one choke point
(`runStage.ts`) where the pattern is visible in one place rather than scattered;
and the documented split between **what a schema can enforce** (shape) and **what
only code can enforce** (meaning) — the distinction most likely to be the durable
lesson from this project.

### Open issues
- **Resolved during the build: switched provider from OpenAI to Anthropic.** No
  OpenAI API key was available; the learner has Claude API credits instead. All
  three model calls, the Zod schemas, the prompts, and the replay/rules/block
  architecture were unaffected — only `src/lib/anthropic.ts` (was `openai.ts`)
  and the request/response handling inside `runStage.ts` changed. See
  **Stack** and **External Services and Dependencies > Anthropic API** above.
- **Resolved: model pinned to `claude-sonnet-5`**, confirmed against the current
  model list as supporting Structured Outputs.
- **Resolved: confirmed SDK + Zod behavior on `.min()`/`.max()`** — the
  Anthropic SDK strips these automatically rather than rejecting them; the
  chosen plan (plain schemas, business rules in `rules.ts`) is unchanged.
- **Resolved: confirmed Zod v4's JSON Schema export** behaves as documented,
  verified against `zod@4.6.5` with the installed SDK.
- **Carried from `prd.md > Open Questions`:** whether clicking an example prefills
  or submits, and whether starting a new run warns before discarding a completed
  prototype. Both are low consequence; the spec assumes prefill and no warning.
