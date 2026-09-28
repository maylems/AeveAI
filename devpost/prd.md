---
doc: prd
status: approved
---
<!-- `status` is the progress state every skill reads. Write `draft` when you first save this file,
     and change it to `approved` when the learner clearly approves the displayed plan ("looks good" counts).
     Do not request a second sign-off. Never skip the draft save —
     an unsaved draft dies with the conversation. -->

# AeveAI — Product Requirements

An AI product-building assistant that takes a vague product idea, decides what the
first version actually needs, and builds a small working prototype — in that
order, on purpose. For one person: a technical founder or solo developer about to
open their editor.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

> **A number in this document that looks like a rule is not one.** Where the
> Reduction stage produces "four core features," four is the *expected outcome
> for the demo idea*, not a target. AeveAI decides the MVP size per idea. See
> **Reduction** and **Acceptance Criteria — Kernel Integrity** below.

## The Core Journey
The complete path, end to end. A stranger could follow this on a screen.

1. **First open.** A minimal workspace. One line of value: *"Find the core. Build
   the MVP."* One large input: *"What do you want to build?"* Three small example
   ideas underneath. Nothing else.
2. **Submit a broad idea.** They type one sentence — *"a Notion-like workspace for
   university students"* — and the pipeline begins. Stages complete one at a time
   and each is revealed when ready. No token streaming.
3. **Product DNA.** The product analyzed: type, target users, core problem, and
   the fundamental functionality that makes it useful.
4. **Reduction — the centerpiece.** A generous candidate feature set appears, then
   visibly separates into **CORE MVP** and **LEFT OUT**. Every excluded feature
   carries a visible reason. Survivors are visually dominant.
5. **MVP.** The surviving scope, stated plainly: *these* capabilities, not the
   other twenty.
6. **Technical Plan.** Architecture, components, data model — and **which building
   blocks the MVP maps onto**, with the reasoning for each choice.
7. **Build.** One action. The workspace transitions.
8. **Working prototype.** A live, interactive prototype rendered inside AeveAI.
   Functional and stateful: create and edit items, refresh, and the data is still
   there.
9. **Optional — challenge a cut.** On any excluded feature: *"Challenge this
   decision."* AeveAI explains the tradeoff. It does not silently re-add or edit.
10. **Optional — compare with the previous run.** A thin record of the last run's
    Product DNA, MVP shape, and chosen blocks, so two contrasting runs can be
    compared without trusting undocumented claims.

**Success** is reached at step 8: a small working application exists that came from
a scope AeveAI cut down on the record. Steps 9 and 10 make the reasoning
challengeable and the central claim falsifiable.

## Screens and Layout
**One progressive workspace. No page navigation, at any point.** This is a settled
decision from `scope.md > The Core Loop` and `scope.md > Explicitly Cut` — six
separate stage screens were cut for real implementation cost and because they
break the single unbroken arc the demo depends on.

The workspace is a single surface that fills in as the run progresses. Within it:

- **The current stage is unmistakable.** It's the focus, and it's the only part
  mid-generation.
- **Completed stages stay visible**, collapsed to a summary, so the reasoning
  chain stays readable. A user looking back at the MVP should be able to see
  which reductions produced it.
- **The pipeline is always visible** as a progress indicator —
  `Idea → Product DNA → Reduction → MVP → Technical Plan → Build` — so it's
  always clear where they are and what's left.
- **The prototype preview takes over the workspace** at the Build stage. Same
  surface, new content. This is the "workspace transforms" moment, not a new page.

There's no sidebar chat, no message list, and no free-text conversation with the
tool at any point.

## Look and Feel
**A serious product and design tool, not an AI chatbot.**
References: **Linear, Vercel, Raycast, modern developer tools.**

Desired qualities: minimal, precise, editorial, confident. Strong typography,
generous whitespace, subtle borders, restrained motion, a mostly neutral palette
with **one distinctive accent color**.

The visual language should reinforce the core idea — **subtraction** — so the
interface is clean, focused, and intentional, with very little visual noise. In
the Reduction stage specifically, the survivors are visually dominant and the
excluded are muted or collapsed after the initial reveal. The eye should land on
what survived.

### Explicitly Avoid
- Robot or AI avatars
- Excessive glassmorphism
- Huge rounded cards everywhere
- Generic "AI magic" sparkles
- A chat interface as the primary interaction
- Token streaming / raw LLM output shown to the user

**Revised mid-build — the landing screen only:** the learner asked for a warm
radial gradient hero (blue → pink → orange) behind the first-open input,
matching a specific visual reference (`aeve.png`), with the input itself as a
compact centered pill rather than a full-width box. This replaces "Purple AI
gradients" in the avoid-list above for this one screen — the color and mood
are deliberately different from a generic purple AI-app gradient, and it's a
hero treatment for a single empty state, not a decorative pattern repeated
through the app. **Every later stage (Product DNA onward) keeps the original
neutral palette, card surfaces, and restrained motion** — the gradient hero
does not extend past the first-open input.

**Stage progression is simulated, not streamed.** Each stage completes and is
revealed as a finished unit. The user sees the product thinking evolve, never the
model's raw output. This is a deliberate risk decision, not a shortcut: it
preserves the whole felt experience while removing the riskiest part of the
implementation.

## Features and Behavior

### Starting a Run
The first thing a user sees. It has one job: get a broad idea typed in.

- One-line value statement: *"Find the core. Build the MVP."*
- One large input: *"What do you want to build?"*
- Three small example ideas, which double as the falsification test's inputs:
  - *"A project management tool for small teams"*
  - *"A Notion-like workspace for students"*
  - *"An expense tracker for freelancers"*
- No long explanation, no onboarding tour, no feature list.

- As a developer with an idea I can't scope, I want one obvious place to type it
  so that the tool starts from my words rather than a template.
  - [ ] The first screen contains a single input and nothing competing with it
  - [ ] Three example ideas are visible without being prominent
  - [ ] Submitting a non-empty idea begins the run

### Product DNA
The first analytical stage. Answers: what kind of product is this, who is it for,
what problem does it solve, and what is the fundamental functionality that makes
it worth existing?

This is what every later stage reasons *from*, so it must be specific. "A
productivity app for students" is not Product DNA; "students collaborating on
course notes and deadlines" is.

- [ ] Product DNA states all four elements: product type, target users, core
      problem, fundamental functionality
- [ ] The core problem is concrete enough that the Reduction stage could visibly
      reason from it
- [ ] It is shown as one finished unit, revealed when the stage completes

### Reduction — the centerpiece
**AeveAI's job is subtraction, and the user watches it happen.**
Source: `scope.md > The Unique Kernel`.

A generous candidate feature set appears first — the full breadth of what the
product *could* be. Then it visibly separates into two labelled groups:

**CORE MVP** — the small set of features that survive.

**LEFT OUT** — features deliberately excluded, **each with its reason visible
beside it**, e.g.:

> *Real-time collaboration — left out because it adds significant complexity
> without being essential to the first validation.*

The survivors are visually dominant. The excluded can be muted or collapsed after
the initial reveal, but the reasons stay reachable.

**The count is decided per idea, never fixed.** AeveAI does not optimize toward a
predetermined number of features. The Notion example happens to land on four;
another idea might honestly reduce to three, five, or two. What determines the
result is the specific Product DNA and core problem.

- As a developer who doesn't know what the first version should contain, I want
  AeveAI to tell me what to leave out and why, so that I don't spend days building
  the wrong thing.
  - [ ] The broad candidate set appears before the reduction, then separates into
        clearly labelled CORE MVP and LEFT OUT groups
  - [ ] Every feature in LEFT OUT has a visible, specific reason — not a generic
        filler reason
  - [ ] Surviving features are visually dominant; excluded are muted or
        collapsible after the initial reveal
  - [ ] The number of CORE MVP features varies with the idea; it is not a constant
        and is not a configurable target
  - [ ] The reduction visibly references the Product DNA rather than a generic
        feature checklist

### MVP Scope
The surviving scope, restated plainly and in its own right: *these capabilities,
not the others.* This exists because the Reduction stage is dense — a separate,
quiet stage lets the user arrive at "so this is what I'm actually building" without
re-reading the cut list.

- [ ] The MVP stage states the retained capabilities unambiguously
- [ ] It is visibly derived from the Reduction stage, not generated independently

### Technical Plan
The bridge from scope to build. Includes:

- **Architecture** — the overall shape of the generated prototype
- **Key components** — what will exist
- **Data model** — what will be stored
- **Building-block mapping** — which blocks the MVP maps onto, **and why each was
  chosen**

Block selection is part of this stage, not a separate step, because it's a
consequence of the reduced scope rather than a fresh decision.

- [ ] The plan states architecture, components, and data model
- [ ] Block choices are shown with reasoning, not silently assigned
- [ ] The plan follows from the reduced MVP scope, not from the original broad
      feature set

### Build and the Working Prototype
One action, then the workspace transitions into a live prototype preview.

The prototype is **functional and stateful, but disposable as a project.** A
reviewer can create and edit items, refresh the page, and the data is still there
— because a prototype that loses everything on refresh reads as a static mockup,
and reviewers will type into it.

It is *not* a project system: no accounts, no cloud persistence, no project
management. Local, lightweight persistence inside the prototype is enough.

- [ ] Build is a single explicit action
- [ ] A live, interactive prototype renders inside the workspace — not a download
      link, not a redirect to an editor
- [ ] The prototype is genuinely functional: items can be created and edited
- [ ] Data survives a page refresh
- [ ] The four available building blocks are: **CRUD/resource management**,
      **search/filtering**, **dashboard**, and **document/editor**

### Challenging a Reduction Decision
A lightweight accountability action, not an editing workflow.

Each feature in LEFT OUT carries a **"Challenge this decision"** action. It opens
an explanation of the tradeoff: why this was excluded, and what it would cost to
include. AeveAI argues its case. It does not re-add the feature and does not open
an editing flow.

**The principle: AeveAI makes a recommendation, but it shows its reasoning rather
than silently deleting things.** Without this, the tool takes away things a user
asked for with no recourse — which is uncomfortable to watch, even in a demo.

- [ ] Every left-out feature offers "Challenge this decision"
- [ ] Challenging produces a genuine explanation of the tradeoff
- [ ] No feature can be re-added or edited through this action in the PoC
- [ ] The action is discoverable on the Reduction stage without a tutorial

### Previous-Run Comparison
A **thin record of the previous run only** — Product DNA, MVP shape, and selected
building blocks. It is not project history or project management.

It exists for one reason: to make the kernel's falsification test observable
without asking a reviewer to take undocumented claims on faith. With no record,
the second run simply overwrites the first and a reviewer can never see that two
different ideas produced two different shapes.

After two runs, the workspace can show the comparison:

- **Run A:** document-oriented idea → Document + Search
- **Run B:** resource/dashboard-oriented idea → CRUD + Dashboard + Search

It stays **lightweight and secondary** to the main run. Two runs must never become
two competing demos.

- [ ] The previous run's DNA, MVP shape, and chosen blocks are retained and visible
- [ ] Two contrasting runs can be compared without undocumented claims
- [ ] The comparison is visually subordinate to the current run
- [ ] Only one prior run is retained; this is not project history

### Honest Refusal
When an idea needs capability the four blocks don't provide, AeveAI does not fake
it. It explains the mismatch, then either simplifies the idea into something the
available blocks can demonstrate, or marks the unsupported part explicitly as out
of scope.

This is a **design commitment, not a missing feature** (`scope.md > Explicitly
Cut`).

- [ ] An unsupported capability produces an explicit explanation, never a fake
- [ ] The user is offered a simplification using available blocks, or an explicit
      "not supported in this prototype"

## States and Boundaries

- **First use / empty** — the single input and three examples. No history, no
  empty dashboard, no disabled controls.
- **Stage in progress** — the current stage is visibly working; completed stages
  stay visible as summaries. Stages complete sequentially, so only one is ever
  in progress.
- **Not a product idea** (e.g. *"build me a sandwich"*) — AeveAI says it can't
  identify a software product problem and asks the user to describe what they want
  to build. It does not invent a product.
- **Too vague to reduce** (e.g. *"an app"*) — AeveAI explains what is missing and
  asks for enough context to continue. **It must not invent an arbitrary
  product** — fabricating scope here would contradict the entire premise.
- **Stage failure** (technical/LLM error) — everything already succeeded is
  **preserved**, the failed stage is named, and a retry is offered. Example: *"Technical Plan couldn't be generated. Your Product DNA and MVP scope are preserved. Retry this stage."* No generic red error screen, and never fake successful output.
- **Honest refusal** — the unsupported-capability state above.
- **Completed run** — the prototype is live and the run is done.
- **What persists** — the generated prototype's own data (across refresh), and
  exactly one previous run's record. **What doesn't:** projects, accounts, full
  history, exports.

## Product Decisions
- **One progressive workspace, not six screens** — six screens is a real
  implementation cost against a 2–4 hour budget, and it breaks the single unbroken
  arc that makes the demo legible in sixty seconds.
- **Sequential stage reveal, not token streaming** — keeps the felt experience of
  watching the pipeline move while removing the riskiest implementation surface.
  The user never sees raw LLM output.
- **Reduction splits into two labelled groups, CORE MVP and LEFT OUT, with a
  visible reason per exclusion** — the subtraction has to be legible, or the
  centerpiece doesn't land. Reasons stay reachable after the initial reveal.
- **"Challenge this decision" included, but no stage editing** — accountability
  without opening an editing workflow, which would expand scope and break the
  linear flow. Explain-only.
- **MVP size is decided per idea; there is no target count** — if AeveAI optimized
  toward a fixed number, it would be a template with good prose. The demo would
  still be compelling but wouldn't be reasoning, which is the thing the project
  exists to avoid.
- **Building blocks are four, and auth is not one of them** — auth was the most
  expensive item on the original list and the least interesting to watch; it
  doesn't demonstrate the core value, which is deciding what to build. A
  later production concern.
- **A document/editor block was added specifically so the Notion-shaped demo is
  viable** and the block set spans genuinely different product shapes.
- **Block selection is verified, not assumed** — two deliberately contrasting
  product shapes must reduce to different MVPs and different blocks. If they
  don't, the kernel is falsified and that's reported, not hidden.
- **The prototype is stateful but disposable** — local persistence only, so a
  reviewer can actually type into it without the PoC becoming a storage or
  project-management system.
- **A thin previous-run record, not project history** — exists solely to make the
  falsification test observable. Explicitly a narrow exception to the cut history.
- **Honest failure over a generic error screen** — a product about good product
  decisions shouldn't pretend everything is possible.
- **Visual identity: Linear/Vercel/Raycast, not a chatbot** — including an
  explicit anti-list, because unspecified visuals reliably collapse into generic
  AI-app defaults.

## Acceptance Criteria — Kernel Integrity
These exist to keep the build honest. They are properties of the *system*, not of
any single run, and they're the ones most likely to be quietly violated during a
build.

- [ ] **Reduction count varies with the idea.** Two different ideas do not both
      reduce to the same number of core features for the same underlying reason.
- [ ] **Block selection varies with the idea.** A document-oriented idea and a
      resource/dashboard-oriented idea do not select the same block set.
- [ ] **Reasoning is tied to the specific Product DNA**, not to a generic
      template — the same idea run twice with the same input yields
      substantively the same reasoning, and a *different* idea yields visibly
      different reasoning.
- [ ] **Every exclusion has a specific reason.** No generic filler, no
      "not essential for MVP" repeated verbatim across unrelated features.
- [ ] **No fabricated capability.** Where the four blocks can't honestly build
      something, AeveAI says so.
- [ ] **No invented product on vague input.** "An app" produces a request for
      context, not an arbitrary scope.

## What We're Building
Everything the PoC must do to be complete:

1. A minimal first-run workspace: value line, one input, three example ideas
2. The staged pipeline in one progressive view, with a visible progress indicator
3. Product DNA generation
4. The Reduction stage — the centerpiece — with CORE MVP / LEFT OUT, per-exclusion
   reasons, and per-idea MVP sizing
5. The MVP stage
6. The Technical Plan, including block mapping **with reasoning**
7. A Build action producing a live in-workspace prototype
8. The four building blocks: CRUD, search/filtering, dashboard, document/editor
9. Prototype statefulness across refresh
10. "Challenge this decision" on every exclusion
11. A thin previous-run record enabling the two-run comparison
12. Honest refusal for unsupported capabilities
13. The honest-failure states: non-product input, vague input, and per-stage
    failure with successful stages preserved

## Deferred From the POC
Named so none of them slip into the build unnoticed:

- **Authentication** — the most expensive item on the original block list and the
  least interesting to watch. Doesn't demonstrate the core value.
- **Stage editing / re-running** — explicitly out. A linear pass holds.
- **Full project history and project management** — the thin record is a single
  previous run, nothing more.
- **Accounts, cloud persistence, multi-user anything** — "functional and
  stateful, but disposable as a project."
- **Export** of any kind.
- **Raw token streaming** — staged reveal instead.
- **Back-navigation between stages** — the pipeline is forward-only.

## Possible Later Enhancements
A sentence or two each, no acceptance criteria:

- More building blocks, widening the range of product shapes
- Generalizing past the single user toward other kinds of builders
- Re-running and editing individual stages, including restoring a cut feature
- A third and fourth product shape, once two contrasting runs are reliable
- Persisted projects and a real comparison view across many runs
- Sharpening the reduction over time from user challenge history

## Non-Goals
- **A universal app generator.** A constrained block set is the design, not a
  limitation to apologize about.
- **A fixed feature count or fixed block set per idea.** Templates are the failure
  mode.
- **Production-ready output.** A small constrained prototype, not deployable
  software.
- **Auth, accounts, multi-user, or collaboration features** in generated
  prototypes.
- **Serving every type of product builder.** Optimized for one person: the dev
  about to open their editor.
- **A chat interface.** The workspace is the interaction.
- **Faking capability or output**, in either direction — no invented product, no
  fake success, no simulated prototype.

## Open Questions
- **Assumption (agent-stated, needs confirming if it matters):** clicking an
  example idea prefills the input rather than submitting immediately. Low
  consequence either way.
- **Assumption (agent-stated, needs confirming if it matters):** starting a new
  idea discards the current run without a confirmation prompt. If a reviewer has a
  working prototype and types a new idea, that prototype disappears. Cheap to add
  a guard; probably not worth the time.
- **Block content detail** — exactly what each of the four blocks gives the user
  is `4-spec` territory, not a product decision, provided the four shapes stay
  distinguishable.
