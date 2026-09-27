---
doc: scope
status: approved
---
<!-- `status` is the progress state every skill reads. Write `draft` when you first save this file,
     and change it to `approved` when the learner clearly approves the displayed plan ("looks good" counts).
     Do not request a second sign-off. Never skip the draft save —
     an unsaved draft dies with the conversation. -->

# AeveAI

An AI product-building assistant that takes a vague product idea, decides what
the first version actually needs, and builds a small working prototype — in that
order, on purpose.

## The Unique Kernel
**AeveAI's job is subtraction, and it shows its reasoning.** Before any code
exists, it tells you what your idea does *not* need:

> "This product could have 30 features, but your first version only needs these 4."

Product analysis, a technical plan, and code generation are all things other
tools do. What none of them do is aggressively remove features and explain why
they went. The "oh, that's cool" moment is AeveAI taking things *away* — the
opposite of what every AI coding tool does on request.

A second constraint follows from this, and it is easy to get wrong: **the
building blocks must not dictate the product thinking.** If every idea reduced to
CRUD + auth + dashboard, AeveAI would confidently produce the same app forever —
the exact failure mode it exists to prevent. The block set has to be broad
enough that the reduction is genuinely driven by the idea, not by the toolkit.

**The PoC tests this rather than assuming it.** AeveAI is run against two
deliberately different product shapes — a document-oriented one and a
resource/dashboard-oriented one — that ought to reduce to genuinely different
MVPs. If both runs collapse onto the same shape, the kernel is falsified and we
say so. One run proves nothing here: a single idea succeeding is consistent with
both "the tool reasons well" and "the tool is a CRUD generator with good PR."

This is the experiment half of the project, and it is cheap insurance: a second
run is one more prompt, not a second build.

## Who It's For
One person, specifically: **a technical founder or solo developer with a fresh
product idea who is about to open their editor and start building immediately.**

They reach for AeveAI at the specific moment where they think: *"I know what I
want to build, but I'm not sure what the first version should actually contain."*

Today, at that moment, they open the editor — or hand the idea to an AI coding
agent, which happily starts generating code and makes the rush *worse*. AeveAI
is the pause before that. The promise is preventing them from spending days
building the wrong thing.

Optimized for this single user for the PoC. Making the concept general enough
for other kinds of builders comes later.

## The Core Loop
They open AeveAI, type one sentence — *"a Notion-like product for university
students"* — and watch the idea get concrete, one stage at a time:

`Idea → Product DNA → Reduction → MVP → Technical Plan → Build`

1. **Product DNA** — type, target users, core problem, fundamental functionality
2. **Reduction** — enumerate the possible features generously, all of Notion,
   then visibly cut to the few that matter, explaining every removal
3. **MVP** — the focused scope, stated plainly: these four, not the other twenty-six
4. **Technical Plan** — architecture, components, data model, *and which building
   blocks the MVP maps onto* (block selection is part of this stage, not a
   separate step — it's a consequence of the reduced scope, not a fresh decision)
5. **Build** — compose the blocks into a working prototype

**One progressive workspace, not six screens.** The stages appear sequentially
and the current one updates in place. The user advances through a pipeline rather
than navigating between pages. This is a deliberate scope decision, not a
simplification to apologize for: it keeps the implementation realistic inside the
time budget and makes the end-to-end arc legible in one unbroken screen recording.

They come back when they have a new idea, and — the real value — they come back
**tame** the next time, because the discipline of "what does the first version
need" sticks.

## Inspiration & Identity
A **product-building workspace, not a chatbot.** The explicit contrast matters:
no chat bubble scrolling in a sidebar, no blank text box waiting for a prompt.

The feel is a single view that fills up as the product becomes concrete —
`Idea → Product DNA → Reduction → MVP → Technical Plan → Build` — where each
stage is tangible and the current stage advances in place. The user is moving
through a pipeline, not chatting with something and not clicking between pages.

Mood: confident, opinionated, editor-like. The tool commits to a scope decision
rather than hedging, and shows the reasoning behind it. Restraint as a visual
style.

## Why This Matters to the Learner
Two motives, and they're compatible.

**Real personal utility.** This genuinely could shorten their own path from idea
to validated prototype, specifically "by forcing me to reduce the scope before
coding." They are the first user, and they have the scar tissue to judge whether
the reduction advice is any good.

**A controlled experiment.** They want to know whether the plan-first process
actually produces a better result than what they currently do. This challenge is
the test, and the build is the evidence.

There's a pleasing recursion: AeveAI exists to automate the discipline this
hackathon teaches, and the artifacts produced here — scope, PRD, spec, checklist
— are literally AeveAI's own output format. During planning, the learner
dogfooded the product's central claim twice: cutting authentication because it
was expensive *and* didn't demonstrate the thing they care about. That decision
is exactly what the tool is supposed to make automatically.

## What "Working" Looks Like
A single run, start to finish, in about a minute of screen time:

> **"Build a Notion-like product for university students"**
> → Product DNA appears
> → the broad feature set is reduced to four essential capabilities, each cut
>   explained on screen
> → the MVP and technical plan follow from the reduced scope
> → the current stage advances to **Build**
> → a working prototype appears and runs

**The moment:** watching AeveAI confidently *remove* features rather than add
them, with reasons on screen.

**The proof it's real:** the working prototype. It demonstrates that the
reduction wasn't just a nice piece of text — the cut scope actually became a
small application you can click through. Without it, "we removed 26 features"
reads as a party trick.

**The control run.** A second, deliberately different idea — resource- and
dashboard-shaped rather than document-shaped — is put through the same pipeline.
Its purpose is falsification, not a second feature: if it reduces to a genuinely
different MVP shape and maps to different blocks, the kernel holds. If both runs
produce the same app, we've found a CRUD bias and the claim is weaker than we
thought. This stays a **control in the background of the demo, not a co-star** —
the Notion run owns the sixty seconds.

Demo-wise: no voiceover, no setup, one idea typed, the whole arc on screen in one
progressive view. It has to be legible in sixty seconds on a screen recording.

## The POC Boundary
**In:**
- The full pipeline end to end: `Idea → Product DNA → Reduction → MVP →
  Technical Plan → Build → working prototype`
- **Four building blocks**: CRUD/resource management, search/filtering,
  dashboard, document/editor
- The document/editor block specifically, so the Notion-shaped demo is viable
  and the block set spans genuinely different product shapes
- **A block-selection test:** two deliberately different product shapes
  (document-oriented, resource/dashboard-oriented) run through the pipeline, to
  verify the AI picks blocks from the idea rather than forcing every idea into one
  template
- **Honest refusal**: an idea needing a fifth block gets a clear explanation of
  the mismatch, plus either a simplification using available blocks or an
  explicit "not supported in this prototype" — never a fake
- **One progressive workspace** — stages appear sequentially and the current one
  updates in place. No per-stage screens or page navigation.
- One user, one idea per run, no project management

**Definition of done:** one broad idea, typed in, run through all stages, ending
in a working prototype — demonstrable in a minute, no setup — plus a second
differently-shaped run confirming the block selection isn't a fixed template.

## Later
- **Authentication** — the first thing to add after the demo, and an explicit
  "production concern" rather than an MVP one
- More building blocks, so the range of product shapes widens
- Generalizing beyond one user toward other kinds of builders
- Re-running and editing individual stages rather than one linear pass
- A third and fourth product shape, once two contrasting runs are reliable
- Persistence, project history, export

## Explicitly Cut
- **Authentication** — the most expensive item on the original block list and
  the least interesting to watch. It doesn't demonstrate the core value, which is
  deciding what to build, so it's out. Named as a later production concern.
- **A universal app generator** — explicitly not the goal. A constrained block
  set is the design, not a limitation to be apologetic about.
- **Serving every type of product builder** — the PoC optimizes for one person:
  the dev about to open their editor.
- **Arbitrary production-ready applications** — the first version produces a
  small constrained prototype, not deployable software.
- **Collaborative or multi-user features** in generated prototypes.
- **Faking capability** — if AeveAI can't honestly build it, it says so. This is
  a design commitment, not a missing feature.
- **Six separate stage screens and page navigation** — one advancing view. Six
  screens is a real implementation cost against a 2–4 hour budget, and it breaks
  the single unbroken arc that makes the demo legible in sixty seconds.
