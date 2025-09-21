# Tasks: Fitness Tracker Application

**Input**: Design documents from `/specs/001-build-a-fitness/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Mobile Expo**: `app/`, `components/`, `store/` at repository root
- Tests in `__tests__/` directories alongside source files
- Existing VibeCoded structure: Expo Router with NativeWind styling

## Phase 3.1: Setup & Data Foundation
- [x] T001 Create fitness tracker data models in store/fitness/models.ts
- [x] T002 [P] Create exercise database JSON file in assets/data/exercises.json
- [x] T003 [P] Create exercise categories JSON file in assets/data/categories.json
- [x] T004 [P] Initialize Zustand fitness store in store/fitness/workoutStore.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [x] T005 [P] Contract test WorkoutService in __tests__/services/WorkoutService.test.ts
- [x] T006 [P] Contract test ExerciseService in __tests__/services/ExerciseService.test.ts
- [x] T007 [P] Contract test ProgressService in __tests__/services/ProgressService.test.ts

### Component Tests
- [x] T008 [P] Component test WorkoutScreen in app/(tabs)/workout/__tests__/WorkoutScreen.test.tsx
- [x] T009 [P] Component test ExerciseLibrary in components/exercise/__tests__/ExerciseLibrary.test.tsx
- [x] T010 [P] Component test ProgressView in app/(tabs)/progress/__tests__/ProgressView.test.tsx
- [x] T011 [P] Component test SetEntry in components/workout/__tests__/SetEntry.test.tsx

### Integration Tests
- [x] T012 [P] Integration test "Create and Complete Workout" in __tests__/integration/workout-flow.test.ts
- [x] T013 [P] Integration test "Exercise Library Navigation" in __tests__/integration/exercise-library.test.ts
- [x] T014 [P] Integration test "Progress Tracking" in __tests__/integration/progress-tracking.test.ts
- [x] T015 [P] Integration test "Offline Functionality" in __tests__/integration/offline-functionality.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Models & Types
- [x] T016 [P] Implement Exercise model with validation in store/fitness/models/Exercise.ts
- [x] T017 [P] Implement Workout model with validation in store/fitness/models/Workout.ts
- [x] T018 [P] Implement Set model with validation in store/fitness/models/Set.ts
- [x] T019 [P] Implement ProgressMetric model in store/fitness/models/ProgressMetric.ts

### Services Layer
- [x] T020 [P] Implement WorkoutService with AsyncStorage in store/fitness/services/WorkoutService.ts
- [x] T021 [P] Implement ExerciseService with JSON database in store/fitness/services/ExerciseService.ts
- [x] T022 [P] Implement ProgressService with calculations in store/fitness/services/ProgressService.ts
- [x] T023 [P] Implement StorageService for AsyncStorage operations in store/fitness/services/StorageService.ts

### Zustand Store Implementation
- [x] T024 Create workout session store in store/fitness/workoutStore.ts
- [x] T025 [P] Create exercise library store in store/fitness/exerciseStore.ts
- [x] T026 [P] Create progress tracking store in store/fitness/progressStore.ts

### Core UI Components
- [x] T027 [P] Create ExerciseCard component in components/exercise/ExerciseCard.tsx
- [x] T028 [P] Create SetEntryForm component in components/workout/SetEntryForm.tsx
- [x] T029 [P] Create WorkoutSummary component in components/workout/WorkoutSummary.tsx
- [x] T030 [P] Create ProgressChart component in components/progress/ProgressChart.tsx
- [x] T031 [P] Create ExerciseFilter component in components/exercise/ExerciseFilter.tsx

## Phase 3.4: Screen Implementation

### Main Navigation Screens
- [x] T032 Create main workout screen in app/(tabs)/workout/index.tsx
- [x] T033 Create workout history screen in app/(tabs)/history/index.tsx
- [x] T034 Create progress tracking screen in app/(tabs)/progress/index.tsx
- [x] T035 Create exercise library screen in app/(tabs)/exercises/index.tsx

### Detailed Screens
- [x] T036 Create active workout screen in app/(tabs)/workout/active.tsx
- [x] T037 Create exercise selection screen in app/(tabs)/workout/select-exercise.tsx
- [x] T038 Create workout details screen in app/(tabs)/history/[id].tsx
- [x] T039 Create exercise details screen in app/(tabs)/exercises/[id].tsx
- [x] T040 Create exercise progress screen in app/(tabs)/progress/[exerciseId].tsx

### Navigation Layout
- [x] T041 Create tab navigation layout in app/(tabs)/_layout.tsx
- [x] T042 Update root layout for fitness tracker navigation in app/_layout.tsx

## Phase 3.5: Integration & Data Flow

### Data Persistence
- [x] T043 Implement AsyncStorage persistence middleware for workout store
- [x] T044 Implement data migration and versioning in store/fitness/services/MigrationService.ts
- [x] T045 Add offline data synchronization preparation in store/fitness/services/SyncService.ts

### State Management Integration
- [x] T046 Connect workout screens to Zustand store
- [x] T047 Connect exercise library to store with filtering
- [x] T048 Connect progress tracking to calculation services

### Performance Optimization
- [x] T049 [P] Implement FlatList virtualization for exercise lists
- [x] T050 [P] Add React.memo optimization for exercise cards
- [ ] T051 [P] Implement lazy loading for exercise images

## Phase 3.6: Polish & Validation

### Input Validation & Error Handling
- [x] T052 [P] Add form validation for set entry (reps, weight)
- [ ] T053 [P] Add error boundaries for workout screens
- [x] T054 [P] Implement user feedback for save operations

### Performance & Accessibility
- [x] T055 [P] Add accessibility labels for all interactive elements
- [ ] T056 [P] Optimize bundle size with selective imports
- [ ] T057 [P] Add performance monitoring for large data sets

### Testing & Validation
- [ ] T058 [P] Run quickstart manual testing scenarios
- [ ] T059 [P] Performance testing with 500+ exercises database
- [ ] T060 [P] Memory usage testing with 50+ completed workouts
- [x] T061 Lint and format all fitness tracker code (npm run lint && npm run format)

## Dependencies

### Critical Path Dependencies
- Setup (T001-T004) before all other tasks
- Tests (T005-T015) before implementation (T016-T061)
- Models (T016-T019) before Services (T020-T023)
- Services (T020-T023) before Store (T024-T026)
- Store (T024-T026) before UI Components (T027-T031)
- UI Components (T027-T031) before Screens (T032-T042)

### Specific Dependencies
- T024 requires T016, T017, T020 (workout models and service)
- T025 requires T016, T021 (exercise model and service)
- T026 requires T019, T022 (progress model and service)
- T032-T042 require T024-T026 (store implementations)
- T046-T048 require all screen and store implementations

## Parallel Execution Examples

### Phase 3.2: Test Creation (can run all in parallel)
```
Task: "Contract test WorkoutService in __tests__/services/WorkoutService.test.ts"
Task: "Contract test ExerciseService in __tests__/services/ExerciseService.test.ts"
Task: "Contract test ProgressService in __tests__/services/ProgressService.test.ts"
Task: "Component test WorkoutScreen in app/(tabs)/workout/__tests__/WorkoutScreen.test.tsx"
Task: "Component test ExerciseLibrary in components/exercise/__tests__/ExerciseLibrary.test.tsx"
```

### Phase 3.3: Model Creation (can run in parallel)
```
Task: "Implement Exercise model with validation in store/fitness/models/Exercise.ts"
Task: "Implement Workout model with validation in store/fitness/models/Workout.ts"
Task: "Implement Set model with validation in store/fitness/models/Set.ts"
Task: "Implement ProgressMetric model in store/fitness/models/ProgressMetric.ts"
```

### Phase 3.3: Service Implementation (can run in parallel after models)
```
Task: "Implement WorkoutService with AsyncStorage in store/fitness/services/WorkoutService.ts"
Task: "Implement ExerciseService with JSON database in store/fitness/services/ExerciseService.ts"
Task: "Implement ProgressService with calculations in store/fitness/services/ProgressService.ts"
Task: "Implement StorageService for AsyncStorage operations in store/fitness/services/StorageService.ts"
```

### Phase 3.4: Component Creation (can run in parallel)
```
Task: "Create ExerciseCard component in components/exercise/ExerciseCard.tsx"
Task: "Create SetEntryForm component in components/workout/SetEntryForm.tsx"
Task: "Create WorkoutSummary component in components/workout/WorkoutSummary.tsx"
Task: "Create ProgressChart component in components/progress/ProgressChart.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task or logical group
- Use existing VibeCoded NativeWind styling patterns
- Follow constitutional TDD requirements strictly
- Maintain <3s startup time and 60fps navigation
- Ensure offline-first architecture throughout

## Validation Checklist

### Contract Coverage
- [x] WorkoutService contract has test (T005)
- [x] ExerciseService contract has test (T006)
- [x] ProgressService contract has test (T007)

### Entity Coverage
- [x] Exercise entity has model task (T016)
- [x] Workout entity has model task (T017)
- [x] Set entity has model task (T018)
- [x] ProgressMetric entity has model task (T019)

### User Journey Coverage
- [x] Create/Complete workout journey has integration test (T012)
- [x] Exercise library navigation has integration test (T013)
- [x] Progress tracking has integration test (T014)
- [x] Offline functionality has integration test (T015)

### Implementation Completeness
- [x] All contracts have service implementations
- [x] All models have validation logic
- [x] All screens have component structure
- [x] All user flows have end-to-end coverage
- [x] Performance requirements addressed in polish phase