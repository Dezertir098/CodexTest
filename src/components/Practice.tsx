import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HelpCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { topics, type Exercise } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { check, record, diagnose } from "../lib/engine";
import { AnswerInput } from "./AnswerInput";
import { Help } from "./Help";
import { Character } from "./Character";
export function Practice({
  questions,
  mode = "practice",
  onDone,
  guided = false,
}: {
  questions: Exercise[];
  guided?: boolean;
  mode?: "practice" | "diagnostic";
  onDone?: () => void;
}) {
  const { set } = useProgress();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [assisted, setAssisted] = useState(guided);
  const [help, setHelp] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[index];
  if (!questions.length)
    return (
      <div className="panel empty">
        <CheckCircle2 />
        <h2>Здесь пока спокойно</h2>
        <p>
          Неисправленных ошибок нет. Новая практика поможет закрепить знания.
        </p>
        <Link className="btn primary" to="/practice">
          К тренировке
        </Link>
      </div>
    );
  if (done)
    return (
      <div className="panel finish">
        <span className="eyebrow">Занятие завершено</span>
        <h2>Ещё один шаг вперёд.</h2>
        <p>
          Верных ответов:{" "}
          <strong>
            {score} из {questions.length}
          </strong>
          . Результаты сохранены в этом браузере.
        </p>
        <p>
          Повторение: после ошибки — через 10 минут, с помощью — через день,
          самостоятельно — через 1, 2, 4, 8, 16 и 30 дней.
        </p>
        <Character who="susie">
          Ошибки уже в списке повторения. Теперь можно передохнуть.
        </Character>
        {onDone ? (
          <button className="btn primary" onClick={onDone}>
            Продолжить урок <ArrowRight size={18} />
          </button>
        ) : (
          <Link className="btn primary" to="/">
            На главную
          </Link>
        )}
      </div>
    );
  const submit = () => {
    if (!answer.trim() || submitted) return;
    const ok = check(q, answer);
    set((p) => record(p, q, answer, assisted, mode));
    if (ok) setScore((s) => s + 1);
    setSubmitted(true);
  };
  const next = () => {
    if (index === questions.length - 1) {
      setDone(true);
      if (mode === "diagnostic") set((p) => ({ ...p, diagnosed: true }));
    } else {
      setIndex((i) => i + 1);
      setAnswer("");
      setSubmitted(false);
      setAssisted(false);
      setHelp(false);
    }
  };
  return (
    <div className="practice">
      <div className="section-line">
        <span className="eyebrow">
          {mode === "diagnostic" ? "Диагностика" : "Практика"} · {index + 1} /{" "}
          {questions.length}
        </span>
        <span className="tag">
          {q.difficulty === 1
            ? "Основа"
            : q.difficulty === 2
              ? "Закрепление"
              : "Сложнее"}
        </span>
      </div>
      <div className="progress-track">
        <i style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <section className="panel exercise">
        <span className="small muted">
          {topics.find((t) => t.id === q.topic)?.title} · учебное задание
        </span>
        <h2>{q.prompt}</h2>
        {q.text && <p className="sentence">{q.text}</p>}
        <AnswerInput
          q={q}
          value={answer}
          onChange={setAnswer}
          disabled={submitted}
        />
        <div className="actions">
          {!submitted ? (
            <button
              className="btn primary"
              disabled={!answer.trim() || answer.includes("_")}
              onClick={submit}
            >
              Проверить ответ <ArrowRight size={17} />
            </button>
          ) : (
            <button className="btn primary" onClick={next}>
              {index === questions.length - 1
                ? "Завершить практику"
                : "Следующее задание"}{" "}
              <ArrowRight size={17} />
            </button>
          )}
          <button
            className="btn ghost"
            onClick={() => {
              setHelp(true);
              if (!submitted) setAssisted(true);
            }}
          >
            <HelpCircle size={17} /> Не понял
          </button>
        </div>
        {assisted && !submitted && (
          <p className="small muted">
            Решение с помощью — это тоже полезная практика.
          </p>
        )}
        {submitted && (
          <div
            className={
              "feedback " + (check(q, answer) ? "correct" : "incorrect")
            }
            aria-live="polite"
          >
            <h3>
              {check(q, answer)
                ? "Верно. Разберём почему."
                : "Посмотрим, где возникла трудность."}
            </h3>
            {!check(q, answer) && <p>{diagnose(q, answer)}</p>}
            <p>{q.explanation}</p>
            {!check(q, answer) && (
              <>
                <p>
                  <strong>Правильный ответ:</strong>{" "}
                  {q.answer.replaceAll("|", ", ")}
                </p>
                <ul>
                  {q.mistakes.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <button
                  className="btn ghost"
                  onClick={() => {
                    setAnswer("");
                    setSubmitted(false);
                    setAssisted(true);
                  }}
                >
                  <RotateCcw size={16} /> Повторить с разбором
                </button>
              </>
            )}
            <Link to={"/lesson/" + q.topic}>Открыть связанную теорию →</Link>
          </div>
        )}
      </section>
      <p className="small muted">
        {q.source} · {q.version}
      </p>
      {help && (
        <Help
          topic={topics.find((t) => t.id === q.topic)!}
          q={q}
          answer={submitted ? answer : undefined}
          onClose={() => setHelp(false)}
          onHint={() => {
            if (!submitted) setAssisted(true);
          }}
        />
      )}
    </div>
  );
}
