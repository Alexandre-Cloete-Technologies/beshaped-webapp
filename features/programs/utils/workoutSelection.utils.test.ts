/**
 * Unit tests for workoutSelection.utils.ts
 *
 * Run with: npm test
 * Uses Node's built-in test runner (node:test) via tsx — no extra dependencies.
 *
 * Coverage:
 *  - normaliseWeekDay (tested indirectly through exported helpers):
 *    dayNumber 1, 7 (modern format), 8, 13, 14 (legacy > 7 format)
 *  - calculateAvailableWeeks with and without durationWeeks
 *  - findWorkoutByWeekDay with mixed old/new data shapes
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  calculateAvailableWeeks,
  findWorkoutByWeekDay,
  getWeekCount,
  hasWorkoutAt,
} from "./workoutSelection.utils.js";
import type { ProgramPhase, Workout } from "../types/programTypes.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWorkout(overrides: Partial<Workout>): Workout {
  return {
    workoutId: "w1",
    workoutName: "Test workout",
    description: "",
    dayNumber: 1,
    weekNumber: 1,
    estimatedDuration: 30,
    exercises: [],
    isRestDay: false,
    ...overrides,
  };
}

function makePhase(overrides: Partial<ProgramPhase> & { workouts: Workout[] }): ProgramPhase {
  return {
    phaseId: "phase-1",
    name: "Phase 1",
    description: "",
    durationWeeks: 1,
    order: 1,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// normaliseWeekDay — modern format (dayNumber 1–7, weekNumber present)
// ---------------------------------------------------------------------------

describe("normaliseWeekDay via hasWorkoutAt — modern format", () => {
  it("dayNumber 1, weekNumber 1 is found at (1, 1)", () => {
    const w = makeWorkout({ dayNumber: 1, weekNumber: 1 });
    assert.equal(hasWorkoutAt([w], 1, 1), true);
    assert.equal(hasWorkoutAt([w], 1, 2), false);
  });

  it("dayNumber 7, weekNumber 1 is found at (1, 7)", () => {
    const w = makeWorkout({ dayNumber: 7, weekNumber: 1 });
    assert.equal(hasWorkoutAt([w], 1, 7), true);
    assert.equal(hasWorkoutAt([w], 1, 6), false);
  });

  it("dayNumber 1, weekNumber 2 is found at (2, 1)", () => {
    const w = makeWorkout({ dayNumber: 1, weekNumber: 2 });
    assert.equal(hasWorkoutAt([w], 2, 1), true);
    assert.equal(hasWorkoutAt([w], 1, 1), false);
  });
});

// ---------------------------------------------------------------------------
// normaliseWeekDay — legacy format (dayNumber > 7, weekNumber absent/0)
// Legacy day 8  → week 2, day 1   (ceil(8/7)=2, (8-1)%7+1=1)
// Legacy day 13 → week 2, day 6   (ceil(13/7)=2, (13-1)%7+1=6)
// Legacy day 14 → week 2, day 7   (ceil(14/7)=2, (14-1)%7+1=7)
// ---------------------------------------------------------------------------

describe("normaliseWeekDay via hasWorkoutAt — legacy format (dayNumber > 7)", () => {
  it("legacy dayNumber 8 (no weekNumber) maps to week 2, day 1", () => {
    // weekNumber is required in the type but legacy docs may have it missing;
    // we simulate that with a cast so we can test the undefined branch.
    const w = makeWorkout({ dayNumber: 8, weekNumber: undefined as unknown as number });
    assert.equal(hasWorkoutAt([w], 2, 1), true);
    assert.equal(hasWorkoutAt([w], 1, 8), false, "raw dayNumber 8 should NOT match week 1 day 8");
  });

  it("legacy dayNumber 13 maps to week 2, day 6", () => {
    const w = makeWorkout({ dayNumber: 13, weekNumber: undefined as unknown as number });
    assert.equal(hasWorkoutAt([w], 2, 6), true);
  });

  it("legacy dayNumber 14 maps to week 2, day 7", () => {
    const w = makeWorkout({ dayNumber: 14, weekNumber: undefined as unknown as number });
    assert.equal(hasWorkoutAt([w], 2, 7), true);
  });
});

// ---------------------------------------------------------------------------
// calculateAvailableWeeks
// ---------------------------------------------------------------------------

describe("calculateAvailableWeeks", () => {
  it("returns [1, 2] for a phase with durationWeeks 2", () => {
    const phase = makePhase({ durationWeeks: 2, workouts: [] });
    assert.deepEqual(calculateAvailableWeeks(phase), [1, 2]);
  });

  it("falls back to inferred weekCount when durationWeeks is 0 (missing/legacy)", () => {
    // durationWeeks: 0 — treated as absent; weekCount inferred from workouts
    const phase = makePhase({
      durationWeeks: 0,
      workouts: [
        makeWorkout({ dayNumber: 1, weekNumber: 1 }),
        makeWorkout({ dayNumber: 1, weekNumber: 3 }),
      ],
    });
    assert.deepEqual(calculateAvailableWeeks(phase), [1, 2, 3]);
  });

  it("returns [1] for a phase with no workouts and missing durationWeeks", () => {
    const phase = makePhase({ durationWeeks: 0, workouts: [] });
    assert.deepEqual(calculateAvailableWeeks(phase), [1]);
  });

  it("falls back via legacy dayNumber > 7 when durationWeeks is absent", () => {
    // Legacy workouts: dayNumber 8 = week 2 day 1, dayNumber 14 = week 2 day 7
    const phase = makePhase({
      durationWeeks: 0,
      workouts: [
        makeWorkout({ dayNumber: 1, weekNumber: undefined as unknown as number }),
        makeWorkout({ dayNumber: 8, weekNumber: undefined as unknown as number }),
      ],
    });
    // normaliseWeekDay(dayNumber=1) → stays in legacy branch? No: 1 <= 7, uses weekNumber ?? 1
    // normaliseWeekDay(dayNumber=8) → legacy branch: week 2, day 1
    assert.deepEqual(calculateAvailableWeeks(phase), [1, 2]);
  });
});

// ---------------------------------------------------------------------------
// getWeekCount — durationWeeks present vs absent
// ---------------------------------------------------------------------------

describe("getWeekCount", () => {
  it("prefers durationWeeks when positive", () => {
    const phase = makePhase({
      durationWeeks: 4,
      workouts: [makeWorkout({ dayNumber: 1, weekNumber: 1 })],
    });
    assert.equal(getWeekCount(phase), 4);
  });

  it("infers from workouts when durationWeeks is missing (0)", () => {
    const phase = makePhase({
      durationWeeks: 0,
      workouts: [
        makeWorkout({ dayNumber: 3, weekNumber: 2 }),
        makeWorkout({ dayNumber: 5, weekNumber: 2 }),
      ],
    });
    assert.equal(getWeekCount(phase), 2);
  });
});

// ---------------------------------------------------------------------------
// findWorkoutByWeekDay — mixed old/new data
// ---------------------------------------------------------------------------

describe("findWorkoutByWeekDay with mixed old/new data", () => {
  const modernW1D1 = makeWorkout({ workoutId: "modern-w1d1", dayNumber: 1, weekNumber: 1 });
  const modernW1D7 = makeWorkout({ workoutId: "modern-w1d7", dayNumber: 7, weekNumber: 1 });
  const legacyD8   = makeWorkout({ workoutId: "legacy-d8",   dayNumber: 8, weekNumber: undefined as unknown as number });
  const legacyD14  = makeWorkout({ workoutId: "legacy-d14",  dayNumber: 14, weekNumber: undefined as unknown as number });

  const workouts = [modernW1D1, modernW1D7, legacyD8, legacyD14];

  it("finds modern week 1 day 1", () => {
    assert.equal(findWorkoutByWeekDay(workouts, 1, 1)?.workoutId, "modern-w1d1");
  });

  it("finds modern week 1 day 7", () => {
    assert.equal(findWorkoutByWeekDay(workouts, 1, 7)?.workoutId, "modern-w1d7");
  });

  it("finds legacy dayNumber 8 as week 2 day 1", () => {
    assert.equal(findWorkoutByWeekDay(workouts, 2, 1)?.workoutId, "legacy-d8");
  });

  it("finds legacy dayNumber 14 as week 2 day 7", () => {
    assert.equal(findWorkoutByWeekDay(workouts, 2, 7)?.workoutId, "legacy-d14");
  });

  it("returns undefined for a (week, day) with no matching workout", () => {
    assert.equal(findWorkoutByWeekDay(workouts, 3, 1), undefined);
  });

  it("does not match legacy dayNumber 8 at its raw (1, 8) coordinates", () => {
    assert.equal(findWorkoutByWeekDay(workouts, 1, 8), undefined);
  });
});
