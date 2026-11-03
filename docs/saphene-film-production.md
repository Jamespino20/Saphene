# SAPHENE — Product Film Production Pack

**"Clarity Through Evidence" — Product demonstration film**

| Spec | Value |
|---|---|
| Runtime target | 1:55 (floats to end of last music hook, max ~2:05) |
| Aspect / Resolution | 16:9 · 1920×1080 · 60fps screen capture, 30fps filmed footage |
| Music | Connor Price — "Straight A's" (https://www.youtube.com/watch?v=TQYGAdzAZP4) |
| Mixed media | Real screen capture (OBS) + filmed footage + geometric motion graphics + VO |
| AI presenter | **NONE.** No AI avatar appears on camera. HeyGen may be used for VO voice generation only (see §9). |
| Editor | CapCut Desktop (speed) or DaVinci Resolve (Fusion for facets) |
| Screen capture | OBS Studio |

> **Licensing note (decide before public upload):** "Straight A's" is a commercial track. School screening = fine. Public hackathon upload = expect a Content ID claim (video stays up; rights holder may track/monetize). Crediting in the description does not license it. Fallback: YouTube Audio Library soundalike at the same BPM — the edit does not change.

---

## §1 — Logline & Concept Lock

An AI audit says the project is fine. Another says it isn't. A student has one night before submission and no way to know which machine to believe. Then a tool does the only honest thing possible: it stops guessing and checks the evidence — down to the file and the line.

**Why "Straight A's" is the right track:** Saphene grades claims. Matched = A. The song's hook — *"Straight A student / Following the rules in the rubric"* — is the product thesis: an engine that checks memory against the rubric (the SRS) instead of vibing with the cool kids (the other AIs that all say "looks fine").

**Closing thesis (spoken over end card):**
> Saphene doesn't ask you to trust another AI. It gives you a way to verify what your AI remembers. The claim is not the answer. The receipt is.

---

## §2 — Brand & Graphics Spec (use for ALL graphics)

| Token | Value |
|---|---|
| Background | `#070a0e` |
| Surface / Surface-2 | `#0d141b` / `#131d27` |
| Line | `#1c2b3a` |
| Ink (primary text) | `#f1f5f9` |
| Muted text | `#8b9eb5` |
| Sage (brand primary) | `#bfcd7f` |
| Green (success) | `#4ade80` |
| Amber (warning/brand) | `#eeb250` |
| Red (drift/bad) | `#f87171` |
| Bronze (mismatch) | `#c88b42` |
| Mono font | JetBrains Mono |
| Body font | Inter |
| Logo asset | `saphene.svg` (faceted gem, 30°/60° facet geometry) |

**Motion rules:** panels slide along 30°/60° diagonals, lock together mechanically, then release. Movement is mechanical but fluid. Nothing bounces except the report-card stamps (§8 G2).

---

## §3 — Music Map (beat-anchored)

**Method (~10 min, do first):** drop the track into the editor. Play it and tap a marker on every **ping-pong percussion hit** (the high-pitched "pan hit by a pingpong ball" sound — it is distinctive and easy to mark). Those hits are your cut points. Then identify:

- **P1** — first full percussion bar
- **D** — the hardest drop
- **H1** — first hook: *"Straight A student but I'm friends with the cool kids / Following the rules in the rubric"*
- **V1** — first verse
- **OUT** — last hook

| Song moment | Film moment | Note |
|---|---|---|
| Intro (sparse) | Scene 1 — Discord | Let the Discord notification ping be the first "beat" |
| P1 | Scene 2 begins | Audit montage cuts **on hits** |
| Build into D | Scene 2 window pile-up | **Hard music cut** on VO "Still no certainty" → black |
| D | Scene 3 logo assembly | Facets slam together on the downbeat |
| H1 | Verdict stamps flash | Report-card stamps land per beat (see G2) |
| V1 — *"Whole life felt protagonist"* | Scenes 4–5 dev workflow | |
| *"What a row boat to a cruise ship / What a penny stock to a blue chip"* | Scene 6 fail→pass PR | The lyric IS the before/after |
| *"Can't exploit me cause I know better"* / *"Work smarter not harder"* | Scene 8 offline cards | |
| **MANUAL MUSIC EDIT** | Scene 7 | Hard-cut track to silence + lone ping-pong tick on *"We don't have internet."* Slam full track back on *"We don't need it."* This is an edit move, not song-dependent. Rehearse it. |
| *"Boom / Hit em with the hook"* | Beat return after music cut | |
| OUT | Scene 9 end card | Resolve and fade |

---

## §4 — THE SCRIPT (locked, v2)

Characters: **MIKA** (stressed lead), **NOAH** (overconfident), **RIN** (skeptical), **JUNIOR** (lower-year student, real person), **JAMES** (you), **VO** (your voice or HeyGen voice — calm, dry, slight warmth, never salesy).

> **Honesty rules (non-negotiable):** every terminal frame is real software output from the real Saphene build. VS Code is shown as CLI usage in the integrated terminal (no fake native extension). OpenCode invokes the real MCP tool. The GitHub checks are real workflow runs. The school interaction is a real person. Demo labels "Audit Tool A/B/C" stay generic except CodeRabbit, and "CodeRabbit sucks" is clearly character dialogue, never narrator claim.

---

### SCENE 01 — THE REQUEST
**0:00–0:10 · 10s · Source: R1 · Location: recreated Discord, "Compliance Chaos" server**

- **MUSIC:** Intro, sparse. The Discord ping is the first beat.
- **VISUAL:** Black screen. Discord notification sound. Fade into a recreated Discord channel (`#project-compliance`). Messages appear progressively like a live conversation. Screen-recorded, not animated.
- **DIALOGUE (messages appear in this order):**
  - **MIKA:** Guys, quick compliance check. Does our implementation still satisfy the SRS?
  - **NOAH:** The AI audit says we're good.
  - **RIN:** Which audit?
- **VISUAL:** Cut to a blinking cursor on a dark terminal.
- **ON-SCREEN TEXT:** `SUBMISSION TOMORROW.`

---

### SCENE 02 — THE AUDIT HELL
**0:10–0:26 · 16s · Source: R2, R1 · Location: montage**

- **MUSIC:** P1. Every cut lands on a ping-pong percussion hit.
- **VISUAL:** Three to four AI audit interfaces, terminal windows, and code-review panels flash across screen. Quick cuts, slight zoom punches, overlapping windows. Findings deliberately contradict each other.
- **ON-SCREEN TEXT (flashes with each window):**
  - `AUDIT TOOL A: No critical issues detected.`
  - `AUDIT TOOL B: Requirement not verified.`
  - `AUDIT TOOL C: Potential implementation mismatch.`
- **VISUAL:** Return briefly to Discord.
  - **NOAH:** CodeRabbit sucks.
  - **RIN:** One says everything's fine. Another says we're missing something.
  - **MIKA:** I don't know which one I should follow.
- **VISUAL:** Windows overlap. Notification sounds pile up. Music builds.
- **VO:** "More audits. More answers. Still no certainty."
- **EDIT:** HARD CUT TO BLACK. Music dies completely.

---

### SCENE 03 — THE REVEAL
**0:26–0:36 · 10s · Source: G1 · Location: motion graphics**

- **MUSIC:** THE DROP. Facets lock on the downbeat.
- **VISUAL:** Green geometric facets (30°/60°) enter frame from different directions and lock together. Amber facet locks last. The complete Saphene gem assembles.
- **ON-SCREEN TEXT:**
  - `SAPHENE`
  - `CI FOR AI AGENT MEMORY.`
- **VO:** "What if you stopped asking which AI was right?" *(beat)* "What if you checked the evidence?"
- **MUSIC:** Slams back in.

---

### SCENE 04 — IN VS CODE
**0:36–0:51 · 15s · Source: R3 · Location: VS Code, saphene-demo workspace**

- **MUSIC:** V1. Maintain momentum, don't overpower.
- **VISUAL:** VS Code opens on `saphene-demo`. Show `claims/demo-claims.md` (the claims file, §6). Switch to the integrated terminal. Type the command live:
  ```
  npx tsx D:/Projects/memory-ci/src/cli.ts bridge claims/demo-claims.md --repo ./ --code-only
  ```
- **ON-SCREEN TEXT:** `01 — INSPECT THE CLAIMS.`
- **VISUAL:** Verification output appears (real). Highlight one `matched` line, one `partial` line (a TODO receipt), one `unfound` line. Click one citation open — show the actual source file at the cited line.
- **VO:** "Saphene takes what your agent remembers and checks it against the actual project."
- **ON-SCREEN TEXT:** `CLAIM → EVIDENCE → VERDICT.`

---

### SCENE 05 — IN OPENCODE
**0:51–1:04 · 13s · Source: R4 · Location: OpenCode, saphene-demo**

- **MUSIC:** V1 continues.
- **VISUAL:** OpenCode receives the prompt (typed on screen):
  > Before proceeding, verify the current project claims using Saphene. Show the evidence behind every verdict.
- **VISUAL:** OpenCode invokes the real configured MCP tool (`saphene_bridge`). Show the tool call and its returned result. Show the agent incorporating the verification result into its answer.
- **VO:** "It works alongside your existing coding agent — an independent verification layer."
- **ON-SCREEN TEXT:** `02 — VERIFY BEFORE YOU COMMIT.`

---

### SCENE 06 — THE CI GATE
**1:04–1:15 · 11s · Source: R5 · Location: GitHub, prerecorded**

- **MUSIC:** Sync the fail→pass flip to *"What a row boat to a cruise ship."*
- **VISUAL:** A pull request opens on `saphene-demo`. The `saphene-review.yml` workflow runs. The check **fails**: a previously matched claim (`retrySyncQueue`) has lost its code receipt — DRIFT detected. Cut: the corrective PR restores the file. The check **passes**.
- **ON-SCREEN TEXT:**
  - `03 — MAKE VERIFICATION CONTINUOUS.`
  - `EVIDENCE GATE — PASSED.`
- **VO:** "And when code changes, verification becomes part of your pipeline."

---

### SCENE 07 — THE OFFLINE MOMENT
**1:15–1:29 · 14s · Source: F1–F4 · Location: real school setting, filmed**

- **MUSIC:** Track continues, then —
- **VISUAL:** Cut from GitHub to a real school environment. You at your laptop. A lower-year student approaches. (Over-the-shoulder framing; faces optional.)
- **DIALOGUE (spoken, filmed):**
  - **JUNIOR:** Kuya, ano ginagawa mo?
  - **JAMES:** Checking a project's memory against its actual code.
  - **JUNIOR:** Can you help me check my repo? Something's wrong with the documentation.
  - **JAMES:** Let's Saphene that.
  - *(Junior looks at the laptop.)*
  - **JUNIOR:** Wait. We don't have internet.
  - *(You turn toward the laptop.)*
  - **JAMES:** We don't need it.
- **MUSIC EDIT:** Hard cut to silence + lone ping-pong tick on *"We don't have internet."* Full track slams back on *"We don't need it."*

---

### SCENE 08 — NO MODEL. NO INTERNET.
**1:29–1:47 · 18s · Source: R6 (+R7 optional) · Location: VS Code terminal, offline for real**

- **MUSIC:** Beat returns on *"Boom / Hit em with the hook."*
- **VISUAL:** Close-up of the disconnected Wi-Fi indicator (real disconnect, F5/R6). Cut to VS Code terminal. Run:
  ```
  npx tsx D:/Projects/memory-ci/src/cli.ts bridge claims/demo-claims.md --repo ./ --code-only --no-model
  ```
- **VISUAL:** Cards slide in on beats —
  - `LOCAL PARSING.`
  - `AST SCANNING.`
  - `REGEX EVIDENCE CHECKS.`
- **VISUAL:** Real verdicts appear in the terminal.
- **VO:** "No model call. No internet. Saphene verifies what the local evidence supports — deterministically." *(pause)* "It doesn't pretend to know what it cannot prove."

---

### SCENE 09 — THE CLOSING STATEMENT
**1:47–end · ~8s · Source: G1 reversed · Location: motion graphics**

- **MUSIC:** OUT / last hook. Resolve and fade.
- **VISUAL:** Terminal fades. Geometric facets assemble into the Saphene logo. Background settles into deep evergreen (`#070a0e` with a soft `#4ade80` glow).
- **END CARD TEXT:**
  - `SAPHENE: CLARITY THROUGH EVIDENCE`
  - `The claim is not the answer. The receipt is.`
  - `Built for the 2026 Meta Global AI Hackathon.`
- **VO (final line):** "Saphene doesn't ask you to trust another AI. It gives you a way to verify what your AI remembers."

---

## §5 — VO Script (for self-recording OR HeyGen voice)

Voice direction: calm, dry, warm-neutral. Slow down 10% on the two "thesis" lines. Never sell. Record at 48kHz, quiet room, 15cm from mic.

| # | Line | Delivery |
|---|------|----------|
| VO1 | "More audits. More answers. Still no certainty." | Flat, slightly tired. Land "certainty" then cut to silence. |
| VO2 | "What if you stopped asking which AI was right?" | Genuine question energy, rising. |
| VO3 | "What if you checked the evidence?" | Quiet, certain. Beat after. |
| VO4 | "Saphene takes what your agent remembers and checks it against the actual project." | Matter-of-fact, mid-pace. |
| VO5 | "It works alongside your existing coding agent — an independent verification layer." | Even; stress "independent." |
| VO6 | "And when code changes, verification becomes part of your pipeline." | Light. |
| VO7 | "No model call. No internet. Saphene verifies what the local evidence supports — deterministically." | Stress "No model call. No internet." as two separate statements. |
| VO8 | "It doesn't pretend to know what it cannot prove." | Slowest line in the film. Pause before it. |
| VO9 | "Saphene doesn't ask you to trust another AI. It gives you a way to verify what your AI remembers." | The closer. Warm, unhurried. |

---

## §6 — Demo Repository Blueprint (BUILD THIS FIRST)

Create `D:/Projects/saphene-demo`. Two versions:

- **Version B (corrected):** everything below.
- **Version A (drifted):** identical, **delete `src/sync/retry.ts`**. That single deletion produces the drift flip (matched → unfound) in Scene 6.

### File tree
```
saphene-demo/
├── claims/
│   ├── demo-claims.md      ← 5 claims, Scene 4 & 8
│   └── gate-claims.md      ← 3 claims, Scene 6 CI gate
├── src/
│   ├── api/health.ts
│   ├── auth/session.ts
│   ├── payments/checkout.ts
│   └── sync/retry.ts       ← DELETE this file in Version A
├── README.md
└── opencode.jsonc
```

### `src/api/health.ts`
```ts
export function healthCheck() {
  return { status: "ok", uptime: process.uptime() };
}
```

### `src/auth/session.ts`
```ts
// Session tokens are JWTs scoped to a single tenant_id.
export function issueSession(userId: string, tenant_id: string) {
  return { token: `jwt.${userId}.${tenant_id}`, tenant_id };
}
```

### `src/payments/checkout.ts`
```ts
export function charge(amountCents: number, method: "cash" | "card") {
  // TODO: send receipt email after successful charge
  return { ok: true, amountCents, method };
}
```

### `src/sync/retry.ts` *(Version B only — the drift subject)*
```ts
// Offline sync queue: failed pushes are retried automatically.
export function retrySyncQueue(queue: string[]) {
  return queue.filter((item) => item !== undefined);
}
```

### `claims/demo-claims.md`
```
- The sync service exposes a health check endpoint.
  category: srs | srsClause: 3.1 | requirementType: operational | priority: mandatory
  evidence: healthCheck

- User sessions use JWT tokens scoped by tenant_id.
  category: srs | srsClause: 9.1 | requirementType: security | priority: mandatory
  evidence: jwt, tenant_id

- Payment checkout sends a receipt email after every charge.
  category: srs | srsClause: 4.2 | requirementType: functional | priority: recommended
  evidence: receipt email

- The platform supports GoCardless direct debit.
  category: srs | srsClause: 5.1 | requirementType: interface | priority: recommended
  evidence: GoCardless

- The offline sync queue retries failed pushes automatically.
  category: srs | srsClause: 6.1 | requirementType: functional | priority: mandatory
  evidence: retrySyncQueue
```

Expected verdicts on **Version B**: healthCheck → `matched` · jwt/tenant_id → `matched` · receipt email → `partial` (evidence hits a TODO line) · GoCardless → `unfound` · retrySyncQueue → `matched`. Summary line reads: `5 claims | 3 matched | 1 partial | 0 mismatch | 1 unfound` — exit code 1 (an unfound exists), which is CORRECT behavior; say so on camera if asked.

### `claims/gate-claims.md`
```
- The sync service exposes a health check endpoint.
  category: srs | srsClause: 3.1 | requirementType: operational | priority: mandatory
  evidence: healthCheck

- User sessions use JWT tokens scoped by tenant_id.
  category: srs | srsClause: 9.1 | requirementType: security | priority: mandatory
  evidence: jwt, tenant_id

- The offline sync queue retries failed pushes automatically.
  category: srs | srsClause: 6.1 | requirementType: functional | priority: mandatory
  evidence: retrySyncQueue
```

Expected on Version B: `3 matched` → **exit 0** (gate passes). On Version A: retrySyncQueue gone → `matched → unfound` drift → **exit 1** (gate blocks).

### `opencode.jsonc`
```jsonc
{
  "mcp": {
    "saphene": {
      "type": "local",
      "command": ["npx", "tsx", "D:/Projects/memory-ci/src/mcp.ts"],
      "enabled": true
    }
  }
}
```

### One-time baseline (before filming Scene 6)
> **Status: BUILT & VERIFIED 2026-11-02.** Repo exists at `D:/Projects/saphene-demo`.

Run ONCE on Version B so the ledger has a baseline to drift against (a `.json`
`--out` path writes a real JSON ledger — fixed in cli.ts this session):
```
npx tsx D:/Projects/memory-ci/src/cli.ts bridge claims/gate-claims.md --repo ./ --code-only --no-model --out .saphene/gate.baseline.json
```

**Drift mechanics (git branches, already set up):**
- `main` = Version B (corrected). Baseline ledger committed.
- `remove-retry-sync` = Version A (drifted, `src/sync/retry.ts` deleted).
- Scene 6 flow: open a PR from `remove-retry-sync` → check **fails** (drift) → commit the file
  restoration on the same branch → check **re-runs green**. One PR, fail→pass, no second branch needed.

**CRITICAL — review must always run with `--code-only`:** without it, the search
finds the evidence hints inside the claims file itself and every claim
self-verifies (a spec testifying for itself). The CI workflow
(`.github/workflows/saphene-gate.yml` in the demo repo) already passes it.

---

## §7 — Exact Command Sheet (verified against the real build)

All commands run from any directory (absolute paths). Exit codes matter on camera: **0 = pass, 1 = unfound/drift present.**

| Scene | Command | Expected |
|---|---|---|
| 04 (VS Code) | `npx tsx D:/Projects/memory-ci/src/cli.ts bridge claims/demo-claims.md --repo ./ --code-only` | `5 claims \| 3 matched \| 1 partial \| 0 mismatch \| 1 unfound`, traceability matrix printed, exit 1 |
| 05 (OpenCode) | Agent prompt (§4 Scene 5) → real `saphene_bridge` tool call | Tool result echoes verdict counts |
| 06 (CI, drifted) | `npx tsx D:/Projects/memory-ci/src/review.ts --claims claims/gate-claims.md --repo ./ --code-only --ledger .saphene/gate.baseline.json` | **DRIFT: `matched → unfound ⚠`**, exit 1 → GitHub check ✗ |
| 06 (CI, corrected) | Same command on `main` | "No drift", exit 0 → GitHub check ✓ |
| 08 (offline) | `npx tsx D:/Projects/memory-ci/src/cli.ts bridge claims/demo-claims.md --repo ./ --code-only --no-model` | Same verdicts, zero network. Terminal clearly shows `--no-model` |
| Optional insert | `npm test` (from memory-ci) | `7/7 checks passed` |

Representative bridge output format (what the camera will see):
```
Saphene bridge — claims/demo-claims.md
Targets: ./
  5 claims | 3 matched | 1 partial | 0 mismatch | 1 unfound
  [matched]  The sync service exposes a health check endpoint. — src\api\health.ts:1: export function healthCheck() {
  [partial]  Payment checkout sends a receipt email after every charge. — src\payments\checkout.ts:3: // TODO: send receipt email...
  [unfound]  The platform supports GoCardless direct debit. — searched ./ for "GoCardless"
Traceability matrix:
| Claim | SRS clause | Type | Verdict | Citation |
```

---

## §8 — Asset Manifest

### A. PREPARE (before any recording, ~90 min)
1. Build `saphene-demo` per §6 (Version B, baseline ledger, OpenCode config).
2. Verify all §7 commands on the current build. Film nothing until every command has been run once successfully.
3. Push `saphene-demo` to GitHub; confirm `.github/workflows/saphene.yml` and `saphene-review.yml` are active; open the failing PR (delete `retry.ts`) and the corrective PR (restore it).
4. Create Discord server "Compliance Chaos", channel `#project-compliance`; seed Scene 1 messages from 3 accounts.
5. OBS scene collection: 1920×1080, 60fps, cursor capture, notifications OFF, terminal font JetBrains Mono 18–20px, dark theme, clean desktop.

### B. SCREEN RECORDINGS (OBS)
| ID | Capture | Notes |
|---|---|---|
| R1 | Discord conversation, progressive | Send messages live or record a slow scroll. 20s raw minimum. |
| R2 | Audit chaos, 20s raw | 3–4 windows, conflicting outputs. Generic labels for fake tools; CodeRabbit real UI if available. |
| R3 | VS Code: claims file → terminal → run → open one citation | Type the command on camera. Cursor visible. |
| R4 | OpenCode: prompt → MCP tool call → result | Real invocation. Keep prompt exactly as scripted. |
| R5 | GitHub: failing PR check, then passing PR check | Prerecorded (needs internet). Show `saphene-review.yml` name on screen. |
| R6 | Wi-Fi disconnect click + offline `--no-model` run | The disconnect must be real. Terminal shows `--no-model` in the typed command. |
| R7 | (optional) `npm test` → 7/7 | 10s confidence insert for Scene 8. |

### C. FILMED FOOTAGE (phone, 1080p, landscape, lock exposure/focus)
| ID | Shot | Framing |
|---|---|---|
| F1 | Junior approaches your laptop | Over-the-shoulder on James |
| F2 | Laptop close-up, terminal visible | Over James's shoulder |
| F3 | Two-shot dialogue exchange | Chins-down framing OK if permission is awkward; get verbal consent on camera |
| F4 | Reaction beat on "We don't need it." | Hold 2 seconds |
| F5 | Wi-Fi toggle switched off | Macro close-up |
| F6 | (texture) Hands typing in canteen light | 5s cutaway |

### D. MOTION GRAPHICS (build once, reuse)
| ID | Asset | Spec |
|---|---|---|
| G1 | Logo assembly | Green facets slide in along 30°/60° diagonals, amber facet locks last (Scene 3). Reverse for Scene 9. |
| G2 | **Report-card verdict stamps** | `matched` → green "A" stamp slams on a hook beat · `partial` → amber "B–" · `unfound` → red "F" torn across. This is the whimsy-with-character moment; it only works with this song. Use stamp thunk SFX. |
| G3 | Facet-wipe transition | One diagonal wipe, reused everywhere. |
| G4 | Mono text cards | Every ON-SCREEN TEXT line in §4, JetBrains Mono, ink `#f1f5f9` on `#070a0e`, letterspaced. |
| G5 | Offline cards | `LOCAL PARSING.` / `AST SCANNING.` / `REGEX EVIDENCE CHECKS.` — slide in on beats in Scene 8. |

### E. SFX (freesound.org or CapCut library)
Discord ping · keyboard clacks · notification pile-up (3 stacked pings) · window whoosh · stamp thunk · low sub-drop on hard cut to black · single ping-pong tick (also extracted from the song for the Scene 7 music cut).

---

## §9 — How to use this document with HeyGen

1. **VO generation (recommended use):** paste each line in §5 into HeyGen's voice tool separately — one clip per line, so the editor can place them on exact beats. Do NOT generate one continuous narration. Keep VO9 (the closer) as its own clip with 0.5s of room tone on both ends.
2. **No AI avatar on camera.** The production decision stands: Discord messages are recreated, terminals are real screen recordings, the school scene is a real person. HeyGen is narration tooling, not a presenter.
3. **Storyboarding:** each scene in §4 maps 1:1 to a HeyGen storyboard block if you use its script-to-storyboard feature — timecodes, on-screen text, and VO are already in the right fields.
4. If a HeyGen voice is used for VO, label it in the end credits: `Narration: AI-generated voice` — consistent with a film whose entire thesis is "AI output must be labeled and verified."

---

## §10 — Edit Assembly Order & Export

1. Mark all ping-pong percussion hits (§3 method).
2. Rough cut: place scenes at §4 timecodes, ignoring beat sync.
3. Beat sync: nudge every cut onto a marked hit. Scene 2 cuts hit hardest — one window per percussion hit.
4. Lay VO clips (§5) one by one; duck music −6dB under VO.
5. SFX pass (§8E).
6. Manual music edit for Scene 7 (silence + tick → slam back). Rehearse until the beat return lands exactly on *"We don't need it."*
7. Grade: terminals cool and slightly desaturated; school footage warm. Keep both within the brand palette.
8. Titles: JetBrains Mono everywhere. No other font appears in the film.
9. Export: H.264, 1920×1080, 60fps, ~16–20 Mbps, AAC 320kbps.
10. **QA: play the exported file with Wi-Fi off.** The film about offline verification must survive offline playback.

---

## §11 — Presentation-Day Live Script (after the film)

Play the film once. Then, on the laptop:

> "Everything you just saw is built around one principle: an AI's memory is not evidence. Let's test it locally."

1. Turn off Wi-Fi (for real, in front of them).
2. Open `saphene-demo` in VS Code.
3. Run: `npx tsx D:/Projects/memory-ci/src/cli.ts bridge claims/demo-claims.md --repo ./ --code-only --no-model`
4. Show the output. Open one source citation. Explain one mismatch between memory and code — the `partial` receipt-email TODO is the easiest to narrate.
5. Optional: `npm test` → 7/7 as the confidence close.

GitHub Actions segment: **prerecorded** (needs internet). The offline no-model run is the one performed live. That's the final proof.

Closing message for the class:

> Saphene doesn't ask you to trust another AI. It gives you a way to verify what your AI remembers.
