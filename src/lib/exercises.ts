import data from "@/data/exercises.json";
import type { Category, Exercise } from "./types";

export const EXERCISES = data as Exercise[];

const byKey = new Map(EXERCISES.map((e) => [`${e.category}-${e.day}`, e]));
const byId = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExercise(category: Category, day: number): Exercise | undefined {
  return byKey.get(`${category}-${day}`);
}

export function getExerciseById(id: string): Exercise | undefined {
  return byId.get(id);
}

export function getDayExercises(day: number): Exercise[] {
  return EXERCISES.filter((e) => e.day === day);
}
