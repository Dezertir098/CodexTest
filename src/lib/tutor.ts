import type { Exercise, Topic } from "../data/curriculum";
export interface TutorContext {
  topic: Pick<Topic, "title" | "basics" | "rule" | "steps">;
  exercise?: Pick<Exercise, "prompt" | "text" | "hints">;
  submittedAnswer?: string;
  question: string;
  shownExplanations: string[];
}
export interface TutorProvider {
  ask(context: TutorContext, signal?: AbortSignal): Promise<string>;
}
// No API keys or provider credentials belong in this client module.
export const serverTutor: TutorProvider = {
  async ask(context, signal) {
    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
      signal,
    });
    if (!response.ok)
      throw Error(
        response.status === 503 || response.status === 404
          ? "ИИ-сервер не подключён. Готовые объяснения выше работают без него."
          : "Не удалось получить ответ наставника. Попробуй локальные подсказки.",
      );
    const data = await response.json();
    if (typeof data.answer !== "string" || !data.answer.trim())
      throw Error("Сервер вернул пустой ответ.");
    return data.answer;
  },
};
