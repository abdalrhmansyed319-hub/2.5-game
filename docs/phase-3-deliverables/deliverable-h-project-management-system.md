# Phase 3 Deliverable H — Project Management System

> **Purpose**: Disciplined, low-overhead production management operating system governing task priorities, feature lifecycles, milestone gating, and the 20-Document Persistent Project Memory (`docs/project-memory/`).

---

## 1. Task Priority Classification (Section 15)
| Priority | Definition | Execution Rule |
| --- | --- | --- |
| **Critical** | Crash, data loss, architectural blocker, broken core loop, or mandatory stage exit gate | Drops everything else; resolved first |
| **High Priority** | Core milestone features, vertical-slice requirements, major feel/readability fixes | Scheduled first inside active milestone |
| **Normal** | Standard planned content, secondary mechanics, polish within active stage | Executed sequentially in dependency order |
| **Optional** | High-value delighters or stretch improvements that do not risk milestone stability | Approved explicitly before building |
| **Deferred** | Good ideas intentionally postponed past current milestone to protect scope | Logged cleanly in `12-development-roadmap.md` so nothing is forgotten |

---

## 2. Feature & Task Lifecycle States
Every tracked feature progresses explicitly through seven clear states (never jumping straight from `Implemented` to `Approved`!):
`Planned` -> `In Progress` -> `Blocked` *(if dependency/asset/decision missing)* -> `Implemented` (`L3/L4`) -> `Tested` (`L5`) -> `Verified` (`L6` / QA Sign-Off) -> `Approved` *(User Owner Sign-Off)*

---

## 3. Mandatory 7-Field Feature Specification Contract
Before starting implementation on any major feature, record these 7 fields in `12-development-roadmap.md` (or linked system doc):
1. **Objective**: Clear player-facing and technical goal.
2. **Dependencies**: Upstream systems, assets (`05-asset-catalog.md`), or approved design decisions required first.
3. **Expected Result**: Concrete observable behavior in-game.
4. **Implementation Plan**: Exact scenes, scripts, resources, and signal contracts to create or touch.
5. **Acceptance Criteria**: Objective pass/fail conditions (both technical & creative).
6. **Testing Requirements**: Exact L4/L5/L6 verification checks required.
7. **Completion Status**: Current lifecycle state + L-level achieved.

---

## 4. The 20-Document Persistent Project Memory System (`docs/project-memory/`)
Conversation history is volatile; **workspace files and `docs/project-memory/` are our permanent studio brain**.

### Synchronization & Anti-Contradiction Rules (Section 14)
1. **Inspect Before Acting**: Whenever resuming work across sessions, inspect actual project files AND `20-production-status.md` before assuming current state.
2. **Code Is Truth**: Documentation must NEVER claim a feature, level, or test exists when the actual project files do not contain it.
3. **Atomic Decision Updates**: Whenever a major architectural or creative decision changes:
   - Log rationale & tradeoffs in `13-technical-decision-log.md` or `14-creative-decision-log.md`.
   - Update the affected authoritative spec (`02-game-design-document.md`, `03-creative-direction.md`, `04-technical-architecture.md`, etc.) in the **same turn** so zero contradictory docs accumulate!
   - Append a crisp entry to `18-change-history.md` and refresh `20-production-status.md`.
4. **Dependency-Ordered Milestones**: Break every stage into small vertical milestones (typically 3–7 cohesive tasks each). Never build 10 unintegrated systems simultaneously!
