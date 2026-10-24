import { exercises, topics, type Exercise } from "../data/curriculum";
export interface Attempt {
  id: string;
  question: string;
  topic: string;
  correct: boolean;
  assisted: boolean;
  answer: string;
  at: number;
  mode: "practice" | "diagnostic" | "exam";
}
export interface Review {
  due: number;
  interval: number;
  streak: number;
}
export interface Settings {
  font: number;
  motion: "full" | "reduced" | "off";
  characters: boolean;
  focus: boolean;
  minutes: number;
  difficulty: "adaptive" | "easy" | "hard";
}
export interface Exam {
  ids: string[];
  answers: Record<string, string>;
  flags: string[];
  started: number;
  deadline: number;
  finished: boolean;
  recorded: boolean;
}
export interface Progress {
  version: 1;
  attempts: Attempt[];
  completed: string[];
  reviews: Record<string, Review>;
  lastTopic: string;
  essay: string;
  settings: Settings;
  exam: Exam | null;
  diagnosed: boolean;
  sessions: { at: number; topic: string }[];
}
export const KEY = "dark-world-progress-v1";
export function fresh(): Progress {
  return {
    version: 1,
    attempts: [],
    completed: [],
    reviews: {},
    lastTopic: "participles",
    essay: "",
    settings: {
      font: 18,
      motion: "reduced",
      characters: true,
      focus: false,
      minutes: 20,
      difficulty: "adaptive",
    },
    exam: null,
    diagnosed: false,
    sessions: [],
  };
}
export function normalize(s: string) {
  return s
    .trim()
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ");
}
export function check(q: Exercise, answer: string): boolean {
  if (q.format === "written") return false;
  if (["digits", "punctuation"].includes(q.format)) {
    const a = answer.replace(/[\s,]/g, "");
    return (
      /^\d+$/.test(a) &&
      new Set(a).size === a.length &&
      [...a].sort().join("") === [...q.answer].sort().join("")
    );
  }
  if (q.format === "multi")
    return (
      answer.split("|").map(normalize).sort().join("|") ===
      q.answer.split("|").map(normalize).sort().join("|")
    );
  if (q.format === "correction")
    return (
      normalize(answer).replace(/[.,!?]/g, "") ===
      normalize(q.answer).replace(/[.,!?]/g, "")
    );
  return normalize(answer) === normalize(q.answer);
}
export function schedule(
  previous: Review | undefined,
  correct: boolean,
  assisted: boolean,
  now = Date.now(),
): Review {
  const streak = correct && !assisted ? (previous?.streak ?? 0) + 1 : 0;
  const days =
    correct && !assisted
      ? Math.min(30, 2 ** Math.min(streak - 1, 5))
      : correct
        ? 1
        : 0;
  return {
    due: now + (days ? days * 86400000 : 600000),
    interval: days,
    streak,
  };
}
export function record(
  p: Progress,
  q: Exercise,
  answer: string,
  assisted: boolean,
  mode: Attempt["mode"] = "practice",
  now = Date.now(),
): Progress {
  const correct = check(q, answer);
  return {
    ...p,
    lastTopic: q.topic,
    attempts: [
      ...p.attempts,
      {
        id: crypto.randomUUID(),
        question: q.id,
        topic: q.topic,
        correct,
        assisted,
        answer,
        at: now,
        mode,
      },
    ],
    reviews: {
      ...p.reviews,
      [q.id]: schedule(p.reviews[q.id], correct, assisted, now),
    },
  };
}
export function mastery(p: Progress, topic: string) {
  const a = p.attempts.filter((a) => a.topic === topic).slice(-12);
  return a.length
    ? Math.round(
        (a.reduce((n, a) => n + (a.correct ? (a.assisted ? 0.5 : 1) : 0), 0) /
          a.length) *
          100,
      )
    : 0;
}
export function status(p: Progress, topic: string) {
  const a = p.attempts.filter((a) => a.topic === topic);
  if (a.length && a.slice(-3).some((x) => !x.correct))
    return "Требует повторения";
  if (p.completed.includes(topic) && mastery(p, topic) >= 80) return "Освоено";
  return a.length || p.completed.includes(topic) ? "Изучается" : "Не изучено";
}
export function selectQuestions(
  p: Progress,
  mode: "adaptive" | "errors" | "diagnostic",
  topic?: string,
): Exercise[] {
  let pool = exercises.filter((q) => !topic || q.topic === topic);
  if (mode === "diagnostic")
    return topics
      .map((t) => exercises.find((q) => q.topic === t.id)!)
      .filter(Boolean);
  if (mode === "errors") {
    const ids = new Set(
      p.attempts.filter((a) => !a.correct).map((a) => a.question),
    );
    pool = pool.filter(
      (q) =>
        ids.has(q.id) && (!p.reviews[q.id] || p.reviews[q.id].streak === 0),
    );
  }
  return [...pool].sort((a, b) => {
    const priority = (q: Exercise) => {
      const r = p.reviews[q.id];
      const seen = p.attempts.filter((a) => a.question === q.id).length;
      const difficulty =
        p.settings.difficulty === "easy"
          ? 1
          : p.settings.difficulty === "hard"
            ? 3
            : mastery(p, q.topic) >= 75
              ? 3
              : 1;
      return (
        (r && r.due <= Date.now() ? 100 : 0) +
        (100 - mastery(p, q.topic)) / 5 -
        seen * 3 -
        Math.abs(q.difficulty - difficulty) * 4
      );
    };
    return priority(b) - priority(a);
  });
}
function obj(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}
const finite = (x: unknown) =>
  typeof x === "number" && Number.isFinite(x) && x >= 0;
export function parseProgress(input: string): Progress {
  const p: unknown = JSON.parse(input);
  if (
    !obj(p) ||
    p.version !== 1 ||
    !Array.isArray(p.attempts) ||
    !Array.isArray(p.completed) ||
    !obj(p.reviews) ||
    !obj(p.settings) ||
    typeof p.essay !== "string" ||
    p.essay.length > 200000 ||
    !Array.isArray(p.sessions) ||
    typeof p.diagnosed !== "boolean" ||
    !topics.some((t) => t.id === p.lastTopic)
  )
    throw Error("Неверный формат файла прогресса.");
  const ids = new Set(exercises.map((q) => q.id));
  for (const a of p.attempts) {
    if (
      !obj(a) ||
      typeof a.id !== "string" ||
      !ids.has(String(a.question)) ||
      !exercises.some((q) => q.id === a.question && q.topic === a.topic) ||
      typeof a.correct !== "boolean" ||
      typeof a.assisted !== "boolean" ||
      typeof a.answer !== "string" ||
      !finite(a.at) ||
      !["practice", "diagnostic", "exam"].includes(String(a.mode))
    )
      throw Error("Повреждена история ответов.");
  }
  if (
    new Set(p.completed).size !== p.completed.length ||
    !p.completed.every((t) => topics.some((x) => x.id === t))
  )
    throw Error("Неизвестная тема.");
  for (const [id, r] of Object.entries(p.reviews)) {
    if (
      !ids.has(id) ||
      !obj(r) ||
      !finite(r.due) ||
      !finite(r.interval) ||
      !finite(r.streak)
    )
      throw Error("Повреждён план повторений.");
  }
  const s = p.settings;
  if (
    ![16, 18, 20, 22].includes(s.font as number) ||
    !["full", "reduced", "off"].includes(String(s.motion)) ||
    typeof s.characters !== "boolean" ||
    typeof s.focus !== "boolean" ||
    ![10, 20, 30, 45, 60].includes(s.minutes as number) ||
    !["adaptive", "easy", "hard"].includes(String(s.difficulty))
  )
    throw Error("Повреждены настройки.");
  if (
    !p.sessions.every(
      (s) => obj(s) && finite(s.at) && topics.some((t) => t.id === s.topic),
    )
  )
    throw Error("Повреждена история занятий.");
  if (p.exam !== null) {
    const e = p.exam;
    if (
      !obj(e) ||
      !Array.isArray(e.ids) ||
      !e.ids.length ||
      new Set(e.ids).size !== e.ids.length ||
      !e.ids.every((id) => ids.has(String(id))) ||
      !obj(e.answers) ||
      !Object.entries(e.answers).every(
        ([id, a]) =>
          e.ids instanceof Array && e.ids.includes(id) && typeof a === "string",
      ) ||
      !Array.isArray(e.flags) ||
      !e.flags.every((id) => (e.ids as unknown[]).includes(id)) ||
      !finite(e.started) ||
      !finite(e.deadline) ||
      Number(e.deadline) < Number(e.started) ||
      typeof e.finished !== "boolean" ||
      typeof e.recorded !== "boolean" ||
      e.recorded !== e.finished
    )
      throw Error("Повреждено сохранение пробной работы.");
  }
  return p as unknown as Progress;
}
export function load(): Progress {
  try {
    const value = localStorage.getItem(KEY);
    return value ? parseProgress(value) : fresh();
  } catch {
    return fresh();
  }
}
export const wordCount = (s: string) =>
  (s.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu) || []).length;

/** Describe observable differences without inventing a linguistic diagnosis. */
export function diagnose(q: Exercise, answer: string): string {
  if (!answer.trim())
    return "Ответ не был дан. Начни с первого шага алгоритма.";
  if (check(q, answer))
    return "Ответ соответствует правилу и заданному формату.";
  if (["digits", "punctuation"].includes(q.format)) {
    const a = answer.replace(/[\s,]/g, "");
    if (!/^\d+$/.test(a) || new Set(a).size !== a.length)
      return "Введи только номера позиций, без повторов. Затем проверь границы конструкции.";
    const missing = [...q.answer].filter((n) => !a.includes(n));
    const extra = [...a].filter((n) => !q.answer.includes(n));
    return (
      [
        missing.length
          ? `Не отмечены нужные позиции: ${missing.join(", ")}.`
          : "",
        extra.length ? `Лишние позиции: ${extra.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" ") +
      " Сопоставь каждую позицию с границей оборота или части предложения."
    );
  }
  if (q.format === "multi") {
    const expected = q.answer.split("|"),
      actual = answer.split("|");
    const missed = expected.filter((x) => !actual.includes(x));
    const extra = actual.filter((x) => !expected.includes(x));
    return [
      missed.length ? `Пропущено верных вариантов: ${missed.length}.` : "",
      extra.length
        ? `Лишний выбор: ${extra.map((x) => "«" + x + "»").join(", ")}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  if (q.format === "highlight")
    return "Границы выделенного фрагмента не совпали с границами всей конструкции. Проверь зависимые слова и не включай сказуемое главной части.";
  if (q.format === "matching")
    return "В соответствии важна позиция каждой цифры. Проверь каждое предложение отдельно, а не набор цифр целиком.";
  return `Твой вариант «${answer}» не совпал с ответом в этом упражнении. Сравни его с объяснением ниже; затем попробуй аналогичный пример.`;
}
