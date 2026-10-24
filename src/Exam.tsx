import { useEffect, useState } from "react";
import { Flag, Clock, ArrowRight } from "lucide-react";
import { exercises, topics } from "./data/curriculum";
import { useProgress } from "./lib/store";
import { check, record, selectQuestions } from "./lib/engine";
import { AnswerInput } from "./components/AnswerInput";
import { Heading, SourceNote } from "./pages";
export function ExamPage() {
  const { p, set } = useProgress();
  const [index, setIndex] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [now, setNow] = useState(Date.now());
  const e = p.exam;
  useEffect(() => {
    if (!e || e.finished) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [e?.started, e?.finished]);
  const finish = () => {
    set((s) => {
      if (!s.exam || s.exam.recorded) return s;
      let result = s;
      for (const id of s.exam.ids) {
        const q = exercises.find((q) => q.id === id)!;
        result = record(result, q, s.exam.answers[id] || "", false, "exam");
      }
      return { ...result, exam: { ...s.exam, finished: true, recorded: true } };
    });
    setConfirm(false);
  };
  useEffect(() => {
    if (e && !e.finished && now >= e.deadline) finish();
  }, [now, e?.deadline, e?.finished]);
  if (!e)
    return (
      <>
        <Heading
          eyebrow="ПРОБНАЯ РАБОТА"
          title="Попробуй собрать знания вместе."
        >
          Без подсказок. С возможностью вернуться к любому вопросу.
        </Heading>
        <SourceNote />
        <section className="panel lesson-text">
          <h2>Учебная работа, не официальный пробник ЕГЭ-2027</h2>
          <p>
            26 авторских упражнений, 60 минут, по одному условному учебному
            баллу за ответ. Состав упражнений и шкала не воспроизводят
            неподтверждённую спецификацию. Сочинение доступно отдельно в
            мастерской и не входит в таймер.
          </p>
          <ul>
            <li>
              Ответы и абсолютный срок окончания сохраняются при перезагрузке.
            </li>
            <li>Можно пропускать вопросы и ставить отметки.</li>
            <li>Подсказки и объяснения откроются после завершения.</li>
            <li>Персонажи и декоративные анимации скрыты.</li>
          </ul>
          <button
            className="btn primary"
            onClick={() => {
              const selected = topics.flatMap((t) =>
                selectQuestions(p, "adaptive", t.id).slice(0, 2),
              );
              set((s) => ({
                ...s,
                exam: {
                  ids: selected.map((q) => q.id),
                  answers: {},
                  flags: [],
                  started: Date.now(),
                  deadline: Date.now() + 3600000,
                  finished: false,
                  recorded: false,
                },
              }));
              setIndex(0);
            }}
          >
            Начать учебную работу <ArrowRight size={16} />
          </button>
        </section>
      </>
    );
  if (e.finished) {
    const score = e.ids.filter((id) =>
      check(
        exercises.find((q) => q.id === id)!,
        e.answers[id] || "",
      ),
    ).length;
    return (
      <>
        <Heading
          eyebrow="РАБОТА ЗАВЕРШЕНА"
          title="Результат — отправная точка."
        >
          Разбор доступен для каждого ответа.
        </Heading>
        <section className="panel">
          <h2>
            {score} из {e.ids.length} учебных баллов
          </h2>
          <p>
            Это количество верных ответов в авторской работе, а не первичный или
            тестовый балл ЕГЭ. Сочинение не оценивалось.
          </p>
          <button
            className="btn"
            onClick={() => {
              set((s) => ({ ...s, exam: null }));
              setConfirm(false);
              setIndex(0);
            }}
          >
            Новая работа
          </button>
        </section>
        <div className="exam-results">
          {e.ids.map((id, i) => {
            const q = exercises.find((q) => q.id === id)!;
            const ok = check(q, e.answers[id] || "");
            return (
              <details
                className={"panel " + (ok ? "correct" : "incorrect")}
                key={id}
              >
                <summary>
                  {i + 1}. {topics.find((t) => t.id === q.topic)?.short} —{" "}
                  {ok ? "верно" : "нужно разобрать"}
                </summary>
                <h3>{q.prompt}</h3>
                <p>{q.text}</p>
                <p>
                  Твой ответ: {e.answers[id]?.replaceAll("|", ", ") || "не дан"}
                </p>
                <p>Правильный ответ: {q.answer.replaceAll("|", ", ")}</p>
                <p>{q.explanation}</p>
              </details>
            );
          })}
        </div>
      </>
    );
  }
  const q = exercises.find(
    (q) => q.id === e.ids[Math.min(index, e.ids.length - 1)],
  )!;
  const seconds = Math.max(0, Math.floor((e.deadline - now) / 1000));
  return (
    <>
      <Heading
        eyebrow="УЧЕБНАЯ РАБОТА · БЕЗ ПОДСКАЗОК"
        title="Один вопрос за другим."
      />
      <div className="exam-toolbar">
        <strong role="timer">
          <Clock size={17} /> {Math.floor(seconds / 60)}:
          {String(seconds % 60).padStart(2, "0")}
        </strong>
        <span className="muted">
          Заполнено {Object.values(e.answers).filter((v) => v.trim()).length} /{" "}
          {e.ids.length}
        </span>
        <button className="btn" onClick={() => setConfirm(true)}>
          Завершить работу
        </button>
      </div>
      <nav className="exam-nav" aria-label="Задания пробной работы">
        {e.ids.map((id, i) => (
          <button
            key={id}
            aria-label={`Задание ${i + 1}${e.flags.includes(id) ? ", отмечено" : ""}`}
            aria-current={index === i ? "step" : undefined}
            className={
              (index === i ? "selected " : "") +
              (e.answers[id] ? "answered " : "") +
              (e.flags.includes(id) ? "flagged" : "")
            }
            onClick={() => setIndex(i)}
          >
            {i + 1}
            {e.flags.includes(id) && "⚑"}
          </button>
        ))}
      </nav>
      <section className="panel exercise">
        <div className="section-line">
          <span className="eyebrow">ЗАДАНИЕ {index + 1}</span>
          <button
            className="btn ghost"
            aria-pressed={e.flags.includes(q.id)}
            onClick={() =>
              set((s) => ({
                ...s,
                exam: {
                  ...s.exam!,
                  flags: s.exam!.flags.includes(q.id)
                    ? s.exam!.flags.filter((id) => id !== q.id)
                    : [...s.exam!.flags, q.id],
                },
              }))
            }
          >
            <Flag size={16} />
            {e.flags.includes(q.id) ? "Снять отметку" : "Вернуться позже"}
          </button>
        </div>
        <h2>{q.prompt}</h2>
        {q.text && <p className="sentence">{q.text}</p>}
        <AnswerInput
          q={q}
          value={e.answers[q.id] || ""}
          onChange={(value) =>
            set((s) => ({
              ...s,
              exam: {
                ...s.exam!,
                answers: { ...s.exam!.answers, [q.id]: value },
              },
            }))
          }
        />
        <div className="actions">
          <button
            className="btn"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            Назад
          </button>
          {index < e.ids.length - 1 ? (
            <button
              className="btn primary"
              onClick={() => setIndex((i) => i + 1)}
            >
              Дальше <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn primary" onClick={() => setConfirm(true)}>
              Завершить
            </button>
          )}
        </div>
      </section>
      {confirm && (
        <div className="help-shade">
          <section
            className="confirm-dialog panel"
            role="dialog"
            aria-modal="true"
            aria-label="Завершение работы"
          >
            <h2>Завершить работу?</h2>
            <p>
              Ответов сохранено:{" "}
              {Object.values(e.answers).filter((v) => v.trim()).length} из{" "}
              {e.ids.length}. После завершения менять ответы нельзя.
            </p>
            <div className="actions">
              <button autoFocus className="btn primary" onClick={finish}>
                Да, завершить
              </button>
              <button className="btn" onClick={() => setConfirm(false)}>
                Вернуться
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
