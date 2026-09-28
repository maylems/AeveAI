---
doc: checklist
status: approved
---
<!-- `status` is the progress state every skill reads. Write `draft` when you first save this file,
     and change it to `approved` when the learner clearly approves the displayed plan ("looks good" counts).
     Do not request a second sign-off. Never skip the draft save —
     an unsaved draft dies with the conversation. -->

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Type an idea, watch a real Product DNA come back**
  Becomes usable: The empty-state screen (value line, one input, three examples) is live; submitting an idea makes one real Anthropic call and renders Product DNA on screen. A non-product or too-vague idea gets an honest refusal instead of invented DNA.
  Why now: This is the riskiest unfamiliar surface (Structured Outputs + Zod + Next.js route) and the first real step of the kernel. Proving it end to end now, with runnable evidence, means every later stage builds on a call pattern we've actually seen work — not one we assumed.
  PRD ref: `prd.md > The Core Journey` (steps 1-3), `prd.md > Starting a Run`, `prd.md > Product DNA`, `prd.md > States and Boundaries` (Not a product idea / Too vague to reduce)
  Spec ref: `spec.md > Stack`, `spec.md > File Structure`, `spec.md > Components > Workspace Shell`, `> Idea Input (first state)`, `> Stage Rail`, `> DNA Stage`, `> Stage Runner (server)`, `spec.md > Verification > Day-one build check`, `spec.md > Decisions and Open Issues > Open issues`
  Build: Scaffold the Next.js + TypeScript app per the file structure; `globals.css` tokens (palette, type scale). `Workspace.tsx` owns the run record and stage index. `IdeaInput.tsx` (value line, input, three examples — click prefills). `StageRail.tsx` showing the full `Idea → … → Build` progress. `dna.ts` Zod schema (product type, target users, core problem, fundamental functionality, plus `verdict`: `product` | `notAProduct` | `tooVague`, nullable `response`). `prompts.ts` with the DNA prompt. `runStage.ts` as the single choke point: live OpenAI call (pinned model, `zodTextFormat`), refusal check, truncation check, Zod parse. `/api/stages/[stage]/route.ts` handling `dna` only for now. `DnaStage.tsx` renders the four fields, or the refusal message when the verdict isn't `product`.
  Verify (mechanical): `npm run dev`; submit the Notion example idea and confirm a real API response renders as validated Product DNA (not a guess — read the terminal/network log to confirm the call actually happened against the pinned model); submit "build me a sandwich" and confirm the `notAProduct` verdict halts the pipeline with a message, no invented DNA.
  Learner check: Open the app, try the Notion example idea and watch Product DNA appear, then type "build me a sandwich" and see the honest refusal instead.
  Commit: `Bootstrap AeveAI and wire the Product DNA stage`

- [x] **2. Watch AeveAI cut features and explain why**
  Becomes usable: After Product DNA, a broad candidate feature set appears and visibly splits into CORE MVP and LEFT OUT, every exclusion with a specific reason. Each exclusion can be challenged for a tradeoff explanation.
  Why now: This is the unique kernel — the centerpiece the whole project exists to prove. It has to land early, not after generic scaffolding, and slice 1 already proved the call pattern it depends on.
  PRD ref: `prd.md > Reduction — the centerpiece`, `prd.md > Challenging a Reduction Decision`, `prd.md > Acceptance Criteria — Kernel Integrity`
  Spec ref: `spec.md > Components > Reduction Stage`, `spec.md > External Services and Dependencies > Anthropic API`, `spec.md > Verification > Manual falsification test`
  Build: `reduction.ts` Zod schema (candidate features, each `core` or `leftOut`, every `leftOut` entry carries a `reason`). Extend `runStage`/route for the `reduction` stage, given DNA as context. `ReductionStage.tsx`: broad set reveal → CORE MVP / LEFT OUT split, survivors visually dominant, excluded muted/collapsible after reveal, reasons always reachable. `ChallengeButton.tsx` triggers a `challenge` call (feature + its reason as context) and renders the tradeoff explanation; never re-adds or edits.
  Verify (mechanical): Run the Notion idea through DNA → Reduction; confirm the split renders with a specific, non-generic reason per excluded feature; click Challenge on one exclusion and confirm a real explanation returns and nothing changes in CORE MVP/LEFT OUT.
  Learner check: Run the Notion idea, read what got cut and why, then challenge one cut and read AeveAI's case for keeping it out.
  Commit: `Add the Reduction stage and Challenge action`

- [ ] **3. See the MVP and the Technical Plan follow from the cut**
  Becomes usable: The surviving scope is restated plainly as the MVP (no API call — derived), then a Technical Plan appears with architecture, components, data model, and which of the four blocks the MVP maps onto, with reasoning. An idea needing a fifth capability gets an explicit mismatch explanation instead of a fabricated block.
  Why now: Bridges Reduction to Build. The plan's block list is what slice 4 assembles, so its validity has to be enforced in code now, before there's a prototype depending on it.
  PRD ref: `prd.md > MVP Scope`, `prd.md > Technical Plan`, `prd.md > Honest Refusal`, `prd.md > Acceptance Criteria — Kernel Integrity`
  Spec ref: `spec.md > Components > MVP Stage`, `> Plan Stage`, `> Block Registry`, `spec.md > Data Model > Stage schemas`, `spec.md > Verification > Runtime checks`
  Build: `mvp.ts` with `deriveMvp()` — pure function over the Reduction result, no model call. `MvpStage.tsx`. `plan.ts` Zod schema (architecture, components, data model, block list with `sourceId`/config/reasoning, plus a mismatch/refusal field for unsupported capability). Extend `runStage`/route for `plan`. `rules.ts`: at least one data-source block; every consumer's `sourceId` resolves to a real data-source block; violations surface as a validation failure. `PlanStage.tsx` renders architecture/components/data model/block reasoning, or the honest-mismatch explanation when present. Block registry skeleton: the four ids marked data-source or consumer (components land in slices 4-5).
  Verify (mechanical): Run the Notion idea to Plan; confirm MVP lists exactly the Reduction's core set; confirm the plan's blocks pass `rules.ts` (has a data source, consumers resolve). Feed `rules.ts` a deliberately invalid plan shape (no data source, or a dangling `sourceId`) and confirm it's rejected rather than silently accepted.
  Learner check: Look at the MVP stage and confirm it matches what survived the cut, then look at the Technical Plan and see which blocks were picked and why.
  Commit: `Derive MVP and add the Technical Plan stage with block-mapping rules`

- [ ] **4. Click Build and get a working CRUD or Document prototype**
  Becomes usable: The Build action assembles the validated plan into real components and hands the workspace to a live, interactive prototype. Items can be created/edited in a CRUD or Document block and survive a refresh.
  Why now: This is where "we cut scope" stops being a claim and becomes a running app — the proof the PRD requires. Starting with the two data-source blocks means every later block (Search, Dashboard) has real data to read.
  PRD ref: `prd.md > Build and the Working Prototype`
  Spec ref: `spec.md > Components > Build Stage`, `> Prototype Host`, `> Block: CRUD (data source)`, `> Block: Document/Editor (data source)`, `spec.md > Data Model > Generated prototype data`
  Build: `BuildStage.tsx` (single explicit action). `assemble.ts`: validated plan → ordered configured block instances. `registry.ts` wired for `crud` and `document`. `CrudBlock.tsx` (list/create/edit/delete over one configured entity, `localStorage` key `aeve:proto:<runId>:<blockId>`). `DocumentBlock.tsx` (seeded sample documents, create/edit content, same storage pattern). `PrototypeHost.tsx` replaces the stage views in the same surface at Build.
  Verify (mechanical): Run the expense-tracker idea to a CRUD-bearing plan, click Build, create/edit/delete an item, refresh the page, confirm it's still there. Run the Notion idea, confirm seeded documents render, edit one, refresh, confirm the edit survived.
  Learner check: Click Build on your idea's plan, change something in the running prototype, refresh the page, and confirm your change is still there.
  Commit: `Add Build action, assembly, and the CRUD and Document blocks`

- [ ] **5. Search and Dashboard read real data from the sources**
  Becomes usable: A plan that includes Search or Dashboard renders a working filter or a live aggregate over an existing CRUD/Document source inside the same prototype.
  Why now: Completes the four-block set. Only once consumers exist can the two contrasting demo shapes (document-oriented vs. resource/dashboard-oriented) actually look different, which is the falsification test the whole kernel rests on.
  PRD ref: `prd.md > Build and the Working Prototype`, `prd.md > Acceptance Criteria — Kernel Integrity` (block selection varies with the idea)
  Spec ref: `spec.md > Components > Block: Search/Filtering (consumer)`, `> Block: Dashboard (consumer)`, `spec.md > Blocks > dependencies.ts`
  Build: `SearchBlock.tsx` (queries a named source's configured searchable fields, read-only). `DashboardBlock.tsx` (counts/summaries over a named source, read-only). `dependencies.ts` resolves each consumer's `sourceId` to its live data source at assembly time. `registry.ts` updated with both consumer blocks.
  Verify (mechanical): Run the expense-tracker idea (CRUD + Dashboard + Search) to Build; add a couple of items and confirm the dashboard counts update and search filters them. Run the Notion idea (Document + Search) and confirm search filters the seeded documents.
  Learner check: On the expense-tracker prototype, add a couple of entries and watch the dashboard and search reflect them.
  Commit: `Add the Search and Dashboard blocks`

- [ ] **6. A second run compares, failures recover, and the demo replays**
  Becomes usable: Starting a second, differently-shaped idea shows the previous run's DNA/MVP/blocks alongside it. A stage failure preserves everything already done and offers a named retry. `AEVE_REPLAY=1` reruns the pipeline from recorded responses instead of the live API.
  Why now: Last because it depends on everything else existing to compare against, fail meaningfully, or replay. It's also what makes the recorded demo reproducible and the falsification test observable rather than a verbal claim.
  PRD ref: `prd.md > Previous-Run Comparison`, `prd.md > States and Boundaries` (Stage failure)
  Spec ref: `spec.md > Components > Previous Run`, `> Stage Error`, `spec.md > Data Model > Run record`, `spec.md > File Structure` (`replay/cassettes.ts`, `src/replays/`), `spec.md > Where It Runs and How Someone Tries It > Demo recording`, `spec.md > Important Failure Modes`
  Build: `runState.ts` copies the finished run's DNA/MVP/blocks to `aeve:run:previous` (one record, overwritten) when a new run starts; `PreviousRun.tsx` renders it, subordinate to the current run. `StageError.tsx` + failure handling in `runPipeline.ts`: names the failed stage, keeps completed stages, offers retry for that stage only. `cassettes.ts` reads/writes `src/replays/<idea-slug>/<stage>.json`; `runStage.ts` branches to replay when `AEVE_REPLAY=1`.
  Verify (mechanical): Run idea A to completion, start idea B, confirm `PreviousRun` shows A's DNA/MVP/blocks while B runs. Force a stage failure (e.g. a temporarily invalid API key) and confirm earlier stages survive with a named retry; fix and retry successfully. Record one real run's three responses, set `AEVE_REPLAY=1`, confirm the pipeline replays them with the same validation and prototype.
  Learner check: Run a second, differently-shaped idea and see the previous run's summary next to it; then try `AEVE_REPLAY=1` and confirm the same prototype appears without a live API call.
  Commit: `Add previous-run comparison, stage-failure recovery, and replay mode`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after Slice 2 (Product DNA + Reduction, the kernel itself, is on screen)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions

- Switched the model provider from OpenAI to Anthropic (`claude-sonnet-5`, `@anthropic-ai/sdk@0.128.0`) — the build discovered no OpenAI API key was available, only Claude API credits. Verified Anthropic's Structured Outputs (`output_config.format` + `zodOutputFormat()`) covers the same need; `devpost/spec.md > Stack` and `> External Services and Dependencies` updated accordingly. The three-call architecture, deterministic MVP/Build, replay, block registry, `rules.ts` separation, Zod schemas, prompts, and UI are all unaffected — only `src/lib/anthropic.ts` (was `openai.ts`) and `runStage.ts`'s internals change.
- Added Tailwind CSS v4 + shadcn CLI (`base-nova`/Base UI preset), reversing the original "no Tailwind, no UI kit" stack decision — the learner asked for it explicitly after reviewing the Slice 2 UI. `npx shadcn@latest init -d` scaffolded `components.json`, `src/lib/utils.ts`, `src/components/ui/`; shadcn's default theme tokens were remapped to AeveAI's existing palette rather than left generic. Existing components (IdeaInput, Workspace, StageRail, DnaStage, ReductionStage, ChallengeButton, StageError) were kept on plain CSS and verified end to end against real Claude calls after the change — not rewritten to Tailwind, since nothing asked for that yet. `devpost/spec.md > Stack` and `> What Was Simplified and Why` updated accordingly. The chat-composer feature set from the reference component (model picker, voice input, image attachments) was explicitly declined — it would contradict `prd.md > Look and Feel > Explicitly Avoid` ("a chat interface as the primary interaction") and AeveAI's single pinned model.
