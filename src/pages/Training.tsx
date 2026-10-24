import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { topics } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { selectQuestions } from "../lib/engine";
import { Character } from "../components/Character";
import { Practice } from "../components/Practice";

import { Heading } from "./Heading";
export function Training({
  diagnostic = false,
  errors = false,
}: {
  diagnostic?: boolean;
  errors?: boolean;
}) {
  const { p } = useProgress();
  const [params, setParams] = useSearchParams();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState(() =>
    selectQuestions(
      p,
      diagnostic ? "diagnostic" : errors ? "errors" : "adaptive",
      params.get("topic") || undefined,
    ),
  );
  return (
    <>
      <Heading
        eyebrow={diagnostic ? "ПЕРВЫЙ ШАГ" : errors ? "ПОВТОРЕНИЕ" : "ТРЕНАЖЁР"}
        title={
          diagnostic
            ? "Узнаем, с чего начать."
            : errors
              ? "Ошибки — подсказки для маршрута."
              : "Меньше угадывать. Больше понимать."
        }
      >
        {diagnostic
          ? "13 коротких вопросов: по одному на каждый блок. Результат поможет выбрать темы, а не оценить тебя."
          : errors
            ? "Здесь задания, в которых пока не получилось разобраться самостоятельно."
            : "Подборка учитывает трудные темы, срок повторения и выбранную сложность."}
      </Heading>
      {!started ? (
        <section className="panel">
          <Character who="susie">
            {diagnostic
              ? "Не знаешь ответ — так и бывает. После проверки разберём правило."
              : "Выбирай тему или доверься подборке. Пять заданий — хороший старт."}
          </Character>
          {!diagnostic && (
            <label className="field">
              Тема
              <select
                value={params.get("topic") || ""}
                onChange={(e) =>
                  setParams(e.target.value ? { topic: e.target.value } : {})
                }
              >
                <option value="">Все темы · адаптивная подборка</option>
                {topics.map((t) => (
                  <option value={t.id} key={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <p>
            {diagnostic
              ? "Диагностика без таймера. Её можно пропустить и сразу открыть библиотеку."
              : errors
                ? "После самостоятельного верного решения задание уйдёт из этого списка. Повторный просмотр с помощью не считается самостоятельным освоением."
                : `Сессия до ${p.settings.minutes} минут: ${Math.min(Math.max(3, Math.floor(p.settings.minutes / 2)), 10)} заданий или меньше, если банк по теме короче.`}
          </p>
          <div className="actions">
            <button
              className="btn primary"
              onClick={() => {
                setQuestions(
                  selectQuestions(
                    p,
                    diagnostic ? "diagnostic" : errors ? "errors" : "adaptive",
                    params.get("topic") || undefined,
                  ).slice(
                    0,
                    diagnostic
                      ? 13
                      : Math.min(
                          10,
                          Math.max(3, Math.floor(p.settings.minutes / 2)),
                        ),
                  ),
                );
                setStarted(true);
              }}
            >
              Начать {diagnostic ? "диагностику" : "тренировку"}{" "}
              <ArrowRight size={16} />
            </button>
            {diagnostic && (
              <Link className="btn ghost" to="/library">
                Пропустить
              </Link>
            )}
          </div>
        </section>
      ) : (
        <Practice
          questions={questions}
          mode={diagnostic ? "diagnostic" : "practice"}
        />
      )}
    </>
  );
}
