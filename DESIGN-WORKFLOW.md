# Front-End Design Workflow: Stitch → Claude Code

A reusable playbook for any future app or site in this account. The problem it
solves: Claude Code writes solid code, but a front-end built from a plain text
prompt tends to look generically "AI-generated." The fix is to design the look
somewhere else first — in Google Stitch — then hand Claude the finished design
to build against exact values instead of guessing.

> One line to remember: **a design file in the project root beats a paragraph
> describing what you want.**

## Step 1 — Design it in Stitch first

Use [stitch.withgoogle.com](https://stitch.withgoogle.com) (free with a Google
account; ~350 generations/month).

1. Describe the app in plain English: what it's for, the screens you need, the
   feel you want.
2. **Drop in 2–3 reference images** — screenshots from Dribbble or Pinterest of
   apps whose look you like. This is the step that actually matters. With no
   references, Stitch defaults to a generic look; with them, it builds toward a
   style you chose on purpose.
3. Let it generate the whole system at once: screens, layouts, colors, type.

> Describe the app. Show it the vibe. Let it generate the system.

## Step 2 — Hand the design to Claude Code

Pick one of two handoff routes.

| Route | What it is | When to use |
| --- | --- | --- |
| **`DESIGN.md` file** (fast) | Export the Stitch design as plain markdown — exact colors, fonts, spacing, components — and drop it in the project root. Claude reads it on its own and builds every screen from those values. | Landing pages, first apps, single-screen work. Does the same job with far less setup. |
| **Stitch MCP server** (live) | Claude Code pulls your screens directly, each screen mapped to a route. | Real multi-screen apps where route↔screen mapping matters. Needs a Google Cloud sign-in, so more setup. |

For most work, start with the `DESIGN.md` file. Reach for the MCP route only
once you have a genuine multi-screen app.

## Step 3 — Tell Claude to finish the job

Stitch gives you **static** screens. They look great, but nothing works yet — no
animations, no mobile layout, buttons that go nowhere. That's expected: it's a
first draft, not a finished app.

Finish it in Claude Code **one instruction at a time**, not one giant prompt:

1. Connect the screens so navigation works.
2. Add animations and hover states.
3. Make it responsive for mobile.
4. Clean up the spacing.

It won't be pixel-perfect — fonts and spacing drift a little because code
generation isn't exact. Put the Stitch preview next to the result and nudge
whatever's off.

> Stitch hands you the look. Claude makes it work.

## The 10-minute checklist

- [ ] Open Stitch, describe the app in a sentence or two, drop in 2–3 reference
      screenshots from Dribbble or Pinterest.
- [ ] Export the design as `DESIGN.md` and save it in the project root.
- [ ] In Claude Code: *"build the screens from DESIGN.md, then make it
      responsive"* — and check the result against the Stitch preview.

---

*Captured as a reusable reference for future app development.*
