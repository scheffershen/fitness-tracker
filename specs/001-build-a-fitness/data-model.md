# Data Model: Fitness Tracker Application

## Core Entities

### Exercise
Represents a fitness exercise definition from the static exercise database.

**Fields**:
- `id`: string (unique identifier)
- `name`: string (exercise name, e.g., "Bench Press")
- `muscleGroups`: string[] (primary and secondary muscles)
- `equipment`: string[] (required equipment types)
- `category`: string (exercise category: strength, cardio, flexibility)
- `instructions`: string (optional execution instructions)
- `imageUrl`: string (optional exercise demonstration image)

**Validation Rules**:
- `id` must be unique across exercise database
- `name` must be non-empty string
- `muscleGroups` must contain at least one muscle group
- `equipment` can be empty for bodyweight exercises

### Workout
Represents a single workout session with metadata and exercises performed.

**Fields**:
- `id`: string (UUID for unique identification)
- `name`: string (user-defined workout name)
- `startTime`: Date (when workout began)
- `endTime`: Date (when workout completed, null if in progress)
- `exercises`: WorkoutExercise[] (exercises performed in this workout)
- `notes`: string (optional workout notes)

**Validation Rules**:
- `startTime` must be valid date
- `endTime` must be after `startTime` if present
- `exercises` array can be empty for incomplete workouts
- `name` defaults to date format if not provided

**State Transitions**:
- Created → In Progress (user starts adding exercises)
- In Progress → Completed (user saves workout with endTime)
- In Progress → Abandoned (user exits without saving)

### WorkoutExercise
Links an exercise to a workout with the sets performed.

**Fields**:
- `exerciseId`: string (reference to Exercise.id)
- `sets`: Set[] (all sets performed for this exercise)
- `restTime`: number (rest time between sets in seconds)
- `notes`: string (exercise-specific notes)

**Validation Rules**:
- `exerciseId` must reference valid exercise
- `sets` must contain at least one set
- `restTime` must be non-negative number

### Set
Individual set data within a workout exercise.

**Fields**:
- `reps`: number (repetitions performed)
- `weight`: number (weight used in kg or lbs)
- `completed`: boolean (whether set was completed)
- `restTime`: number (actual rest time after this set)

**Validation Rules**:
- `reps` must be positive integer
- `weight` must be non-negative number
- `completed` defaults to true
- `restTime` must be non-negative

### ExerciseCategory
Hierarchical categorization system for exercises.

**Fields**:
- `id`: string (category identifier)
- `name`: string (display name)
- `type`: 'muscle' | 'equipment' | 'movement' (category type)
- `parentId`: string (optional parent category for hierarchy)

**Validation Rules**:
- `id` must be unique within category type
- `type` must be one of defined enum values
- `parentId` must reference valid category if present

### ProgressMetric
Calculated metrics for tracking user progress over time.

**Fields**:
- `userId`: string (user identifier for future multi-user support)
- `exerciseId`: string (exercise being tracked)
- `date`: Date (date of metric calculation)
- `oneRepMax`: number (calculated 1RM)
- `totalVolume`: number (total weight × reps for time period)
- `frequency`: number (workout frequency per week)
- `personalRecord`: boolean (whether this represents a PR)

**Validation Rules**:
- `date` must be valid date
- Numeric fields must be non-negative
- `oneRepMax` calculated using standard formulas

## Relationships

### Exercise ← WorkoutExercise
- One exercise can be used in many workout exercises
- WorkoutExercise references Exercise via `exerciseId`

### Workout → WorkoutExercise
- One workout contains many workout exercises
- Cascade delete: removing workout removes associated workout exercises

### WorkoutExercise → Set
- One workout exercise contains many sets
- Ordered collection maintained for set sequence

### Exercise ← ExerciseCategory
- Many-to-many relationship via category matching
- Exercises match categories based on muscle groups and equipment

### Exercise ← ProgressMetric
- One exercise can have many progress metrics over time
- Time-series data for trend analysis

## Data Storage Schema

### AsyncStorage Keys
- `workouts`: Workout[] (all completed workouts)
- `currentWorkout`: Workout (in-progress workout)
- `exercises`: Exercise[] (static exercise database)
- `categories`: ExerciseCategory[] (categorization data)
- `userPreferences`: UserPreferences (app settings)

### JSON Structure Example
```json
{
  "workouts": [
    {
      "id": "uuid-1",
      "name": "Push Day",
      "startTime": "2025-09-21T10:00:00Z",
      "endTime": "2025-09-21T11:30:00Z",
      "exercises": [
        {
          "exerciseId": "bench-press",
          "sets": [
            {"reps": 10, "weight": 80, "completed": true, "restTime": 120},
            {"reps": 8, "weight": 85, "completed": true, "restTime": 120}
          ],
          "restTime": 120,
          "notes": "Felt strong today"
        }
      ],
      "notes": "Great workout"
    }
  ]
}
```

## Migration Strategy

### Version 1.0 (MVP)
- Basic entity structure
- Local AsyncStorage persistence
- No user accounts or cloud sync

### Future Versions
- User authentication and multi-device sync
- Enhanced progress tracking with charts
- Social features and workout sharing
- Template workouts and programs