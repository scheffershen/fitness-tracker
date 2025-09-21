
# Implementation Plan: Fitness Tracker Application

**Branch**: `001-build-a-fitness` | **Date**: 2025-09-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-build-a-fitness/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Fitness Tracker application enabling users to log workouts with exercises, sets, and repetitions. Features include categorized exercise library, workout history tracking, and progress visualization with consistency monitoring. Built as React Native Expo app with cross-platform support and offline capabilities.

## Technical Context
**Language/Version**: TypeScript 5.9+ with React Native 0.81.4
**Primary Dependencies**: Expo 54.0, Expo Router 6.0, NativeWind, Zustand 4.5, React 19.1
**Storage**: AsyncStorage for local persistence, potential cloud sync in future iterations
**Testing**: Jest for unit testing, React Native Testing Library for component testing, Detox for E2E
**Target Platform**: iOS 15+, Android API 23+, Web (via Expo Web)
**Project Type**: mobile - React Native Expo managed workflow
**Performance Goals**: <3s app startup, 60fps navigation, smooth list scrolling for large exercise databases
**Constraints**: <100MB memory usage, offline-first design, touch-optimized UI, cross-platform consistency
**Scale/Scope**: Personal fitness tracking app, ~15 screens, 500+ exercises database, unlimited workout history

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality Compliance**:
- [x] Solution design follows TypeScript strict mode requirements
- [x] ESLint and Prettier configuration planned for all code paths
- [x] Code review process defined with quality standards

**Test-First Development**:
- [x] TDD approach planned with Red-Green-Refactor methodology
- [x] Integration tests designed for user journey coverage
- [x] Contract tests planned for component/API interfaces

**User Experience Consistency**:
- [x] Design follows established UI patterns and accessibility standards
- [x] NativeWind styling approach ensures cross-platform consistency
- [x] Navigation patterns align with platform conventions

**Performance Requirements**:
- [x] Solution meets <3s startup time requirement on mid-range devices
- [x] 60fps navigation transitions planned and validated
- [x] Bundle size optimization strategy defined for web builds
- [x] Memory usage projected to stay under 100MB baseline

**Mobile-First Architecture**:
- [x] Components designed touch-first with web adaptation
- [x] Platform-specific code isolation strategy defined
- [x] Offline capability considerations documented

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Using existing Expo Router file-based structure with app/ directory for screens and components/ for reusable UI components

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Contract tests for WorkoutService, ExerciseService, ProgressService [P]
- Model creation for Workout, Exercise, Set, ProgressMetric entities [P]
- Component tests for WorkoutScreen, ExerciseLibrary, ProgressView [P]
- Integration tests for complete user journeys from quickstart scenarios
- Service implementation tasks to make contract tests pass
- UI implementation tasks following mobile-first design principles

**Ordering Strategy**:
- TDD order: Contract tests → Model tests → Component tests → Implementation
- Dependency order: Models → Services → Screens → Navigation
- Data layer before UI layer to ensure offline-first architecture
- Mark [P] for parallel execution (independent files and components)
- Group by feature area: Workout management, Exercise library, Progress tracking

**Estimated Output**: 35-40 numbered, ordered tasks covering:
- 8-10 test tasks (contract, model, component, integration)
- 15-20 implementation tasks (models, services, screens, components)
- 8-10 integration tasks (navigation, state management, persistence)
- 5-8 polish tasks (styling, performance, error handling)

**Key Implementation Areas**:
1. Data models and AsyncStorage persistence layer
2. Zustand store for workout session state management
3. Exercise database with categorization and search
4. Workout tracking screens with touch-optimized UI
5. Progress calculation and visualization components
6. Offline-first architecture with data sync preparation

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved (3 items remain in spec)
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
