import { describe, it, expect } from "vitest";
import {
  check,
  fresh,
  parseProgress,
  record,
  schedule,
  selectQuestions,
  mastery,
  status,
  wordCount,
} from "./engine";
import { exercises, topics } from "../data/curriculum";
describe("Учебный банк", () => {
  it("содержит полные материалы и уникальные задания", () => {
    expect(new Set(exercises.map((q) => q.id)).size).toBe(exercises.length);
    for (const t of topics) {
      expect(t.steps.length).toBeGreaterThan(2);
      expect(t.rule.length).toBeGreaterThan(100);
      expect(
        exercises.filter((q) => q.topic === t.id).length,
      ).toBeGreaterThanOrEqual(2);
    }
    for (const q of exercises) {
      expect(check(q, q.answer)).toBe(true);
      expect(check(q, "")).toBe(false);
      expect(q.explanation.length).toBeGreaterThan(70);
      expect(q.hints.length).toBeGreaterThan(0);
      expect(q.mistakes.length).toBeGreaterThan(0);
    }
  });
  it("проверяет набор цифр независимо от порядка, отвергает дубликаты", () => {
    const q = exercises[0];
    expect(check(q, "21")).toBe(true);
    expect(check(q, "1, 2")).toBe(true);
    expect(check(q, "112")).toBe(false);
    expect(check(q, "1")).toBe(false);
    expect(check(q, "12x")).toBe(false);
  });
  it("проверяет несколько ответов как множество", () => {
    const q = exercises.find((q) => q.format === "multi")!;
    expect(check(q, q.answer.split("|").reverse().join("|"))).toBe(true);
    expect(check(q, q.answer + "|" + q.answer.split("|")[0])).toBe(false);
  });
  it("нормализует регистр, ё и пробелы, не принимает другой смысл", () => {
    const q = exercises.find((q) => q.answer === "эффективный")!;
    expect(check(q, " ЭФФЕКТИВНЫЙ ")).toBe(true);
    expect(check(q, "эффектный")).toBe(false);
  });
  it("сохраняет порядок в заданиях на соответствие", () => {
    const q = exercises.find((q) => q.format === "matching")!;
    expect(check(q, "123")).toBe(true);
    expect(check(q, "321")).toBe(false);
  });
});
describe("Прогресс и повторение", () => {
  it("различает помощь и самостоятельное решение", () => {
    let p = fresh();
    const q = exercises[0];
    p = record(p, q, "12", true, "practice", 1000);
    expect(mastery(p, q.topic)).toBe(50);
    expect(p.reviews[q.id].interval).toBe(1);
    p = record(p, q, "12", false, "practice", 2000);
    expect(mastery(p, q.topic)).toBe(75);
    expect(p.attempts).toHaveLength(2);
  });
  it("сбрасывает интервал после ошибки и расширяет при успехе", () => {
    const r = schedule(undefined, true, false, 0);
    expect(r.due).toBe(86400000);
    const r2 = schedule(r, true, false, 1000);
    expect(r2.interval).toBe(2);
    expect(schedule(r2, false, false, 2000).due).toBe(602000);
    expect(schedule(r2, true, true, 2000).streak).toBe(0);
    let s = r;
    for (let i = 0; i < 10; i++) s = schedule(s, true, false, 0);
    expect(s.interval).toBe(30);
  });
  it("выбирает ошибочные задания, удаляет их после самостоятельного решения", () => {
    const q = exercises[0];
    let p = record(fresh(), q, "1", false);
    expect(selectQuestions(p, "errors").map((q) => q.id)).toContain(q.id);
    p = record(p, q, "12", true);
    expect(selectQuestions(p, "errors").map((q) => q.id)).toContain(q.id);
    p = record(p, q, "12", false);
    expect(selectQuestions(p, "errors").map((q) => q.id)).not.toContain(q.id);
  });
  it("не сообщает освоение пустой темы", () => {
    expect(status(fresh(), "participles")).toBe("Не изучено");
    expect(mastery(fresh(), "participles")).toBe(0);
    expect(selectQuestions(fresh(), "diagnostic")).toHaveLength(topics.length);
  });
  it("экспорт импорт восстанавливает содержимое и отклоняет повреждения", () => {
    const p = record(fresh(), exercises[0], "12", false);
    p.essay = "Текст";
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
    expect(() => parseProgress("{")).toThrow();
    expect(() =>
      parseProgress(JSON.stringify({ ...p, settings: {} })),
    ).toThrow();
    expect(() =>
      parseProgress(
        JSON.stringify({ ...p, reviews: { q1: { due: "tomorrow" } } }),
      ),
    ).toThrow();
    expect(() => parseProgress(JSON.stringify({ ...p, exam: {} }))).toThrow();
  });
  it("считает слова с дефисом единым словом", () => {
    expect(wordCount("Кто-то сказал: «Это добрый поступок».")).toBe(5);
    expect(wordCount("  \n ")).toBe(0);
  });
});
