# SRS Traceability Bridge — Saphene + Paper Adapter

**Standard:** ISO/IEC/IEEE 29148 (SRS) primary · ISO/IEC/IEEE 26514 (user manuals) secondary  
**Status:** draft · Oct 28, 2026  
**Purpose:** Turn workspace memory items into SRS-aligned claims, verify them against a paper/docs/repo evidence loop, and write verdicts back into memory as traceability links.

---

## 1. Architecture

```
workspace memory  ──ingest──►  claim ledger  ──verify──►  verdicts
                                    ▲                  │
                                    │                  ▼
                            paper adapter ◄───────── evidence citations
```

Three features, one app:

| Feature | Responsibility |
|---|---|
| **memory** (main) | Workspace-memory items → claims; verdicts written back as citation-backed memory notes |
| **paper** (feature) | Claims → evidence grep/read/check against docs (PDF, DOCX, XLSX) + repo code/SQL |
| **bridge** (bridge) | Traceability matrix: claim → SRS clause → paper evidence → repo evidence → verdict status |

---

## 2. Claims schema (extends claims.example.json)

**Claim** fields:

| Field | Type | Notes |
|---|---|---|
| id | string | deterministic: `clm_<hash(source::text)>` |
| text | string | the requirement as written |
| category | "fact" \| "config" \| "numeric" \| "path" \| "behavior" \| **srs** | new: `srs` marks SRS-aligned requirement |
| srsClause | string? | ISO/IEC/IEEE 29148 section reference, e.g. `5.3.2`, `6.1` |
| requirementType | string? | functional \| performance \| safety \| security \| interface \| operational \| constraint \| quality |
| priority | string? | mandatory \| recommended \| optional |
| source | string | memory file path, paper path, or repo path |
| expectedEvidence | string[] | hints for where to look (file:line, URL, table name) |
| status | VerdictStatus | unverified \| matched \| partial \| mismatch \| unfound |
| evidence | Evidence[] | verdict citations with quotes |
| verifiedAt | string? | ISO timestamp of last successful verify |

**Evidence** fields (unchanged): kind, location, quote, fetchedAt.

**Verdict** fields (unchanged): claimId, status, citation, confidence, reason.

**AdapterResult** — added field `traceability` → array of `{claimId, srsClause, status, citations}` for bridge export.

---

## 3. Claim categories per ISO/IEC/IEEE 29148

Map every `srs` claim to one requirement type:

- **functional** — what the system shall do (e.g., calculate EDC via Naegele's rule)
- **performance** — response times, capacity (e.g., 50 concurrent users)
- **safety** — patient-safety behavior (e.g., abnormal lab results flagged automatically)
- **security** — access control, audit (e.g., RBAC roles admin/doctor/secretary/patient)
- **interface** — external/system interfaces (e.g., hospital EHR integration)
- **operational** — deployment/ops (e.g., InfinityFree hosting, XAMPP local)
- **constraint** — technology/implementation constraints (e.g., PHP + MySQL + HTML/JS)
- **quality** — quality attributes (e.g., 20-30% reduction in administrative time)

---

## 4. Bridge workflow

1. **Ingest**: read a workspace memory file; for each SRS-relevant statement, create a claim with `category: "srs"`, `srsClause`, `requirementType`, `expectedEvidence`.
2. **Verify**: run the paper adapter — grep/read/check against MatriFlow.docx/pdf + MatriFlow repo code and SQL schema.
3. **Verdict**: each claim returns matched / partial / mismatch / unfound with citations (file:line or SQL table).
4. **Write back**: verdicts are appended to the source memory file as a dated traceability block:

```
## Traceability (YYYY-MM-DD)
| Claim | SRS clause | Type | Verdict | Citation |
| clm_00000001 | 5.3.2 | functional | matched | app/core/PregnancyCalculator.php:10-20 |
```

5. **Export**: `npm run bridge -- <memory-file>` prints a requirements traceability matrix (CSV/MD) ready for an SRS document.

---

## 5. Bridge CLI sketch (Oct 29)

```
# verify a memory file's SRS claims against the paper + repo
npm run bridge -- D:\University\System Integration\README.md

# output: per-claim verdict + citations + traceability matrix
```

Adapter selection logic:
- `memory` adapter → verify against workspace-memory files only
- `paper` adapter → verify against MatriFlow.pdf/docx/xlsx + repo (default for SRS claims)
- `helm` adapter → reserved fallback (documented only)

---

## 6. Exit codes

| Code | Meaning |
|---|---|
| 0 | all claims matched |
| 1 | any claim unfound or mismatch (requires human review) |
| 2 | engine error (model/provider unavailable) |

---

## 7. Open questions

- SRS clause numbering scheme (29148 section numbers vs. project-local IDs)?
- Confidence threshold for auto-write-back vs. flag-for-human?
- 26514 user-manual drafting from verdicts — in scope after Oct 30?

---

## Related

- [[00-INDEX]] · [[schema]] · [[extract]] · [[verify]] · [[bridge]] · calendar/2026.md