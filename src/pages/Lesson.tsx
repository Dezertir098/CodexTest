import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, HelpCircle, Play, Check } from "lucide-react";
import { topics, exercises } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { mastery } from "../lib/engine";
import { Character } from "../components/Character";
import { Practice } from "../components/Practice";
import { Help } from "../components/Help";
import { Heading } from "./Heading";
export function Lesson() {
  const { id } = useParams();
  const { p, set } = useProgress();
  const [stage, setStage] = useState(0);
  const [help, setHelp] = useState(false);
  const [chosen, setChosen] = useState("");
  const [checked, setChecked] = useState(false);
  const t = topics.find((t) => t.id === id);
  const qs = useMemo(() => exercises.filter((q) => q.topic === id), [id]);
  if (!t)
    return (
      <div className="panel">
        <h1>Тема не найдена</h1>
        <Link to="/library">В библиотеку</Link>
      </div>
    );
  const finish = () => {
    set((s) => ({
      ...s,
      lastTopic: t.id,
      completed: [...new Set([...s.completed, t.id])],
      sessions: [...s.sessions, { at: Date.now(), topic: t.id }],
    }));
    setStage(6);
  };
  const parts = t.example.split(t.marked);
  return (
    <>
      <Link className="text-link" to="/library">
        ← Все темы
      </Link>
      <Heading eyebrow={`${t.group} · ${t.minutes} МИНУТ`} title={t.title}>
        {t.description}
      </Heading>
      <nav className="lesson-steps" aria-label="Этапы урока">
        {[
          "Понять",
          "Пример",
          "Алгоритм",
          "Практика",
          "Самостоятельно",
          "Проверка",
        ].map((s, i) => (
          <button
            key={s}
            aria-current={stage === i ? "step" : undefined}
            className={stage === i ? "active" : stage > i ? "done" : ""}
            onClick={() => {
              if (i <= stage) setStage(i);
            }}
            disabled={i > stage}
          >
            <span>{stage > i ? <Check size={13} /> : i + 1}</span>
            {s}
          </button>
        ))}
      </nav>
      {stage === 0 && (
        <>
          <Character>
            Начнём с основы, затем посмотрим пример. Если встретится незнакомое
            слово, открой «Не понял».
          </Character>
          <section className="panel lesson-text">
            <span className="eyebrow">01 · ПРОСТОЕ ОБЪЯСНЕНИЕ</span>
            <h2>Что здесь важно понять?</h2>
            <p>{t.basics}</p>
            <div className="rule-box">{t.rule}</div>
            <div className="actions">
              <button
                className="btn primary"
                onClick={() => {
                  set((s) => ({ ...s, lastTopic: t.id }));
                  setStage(1);
                }}
              >
                Посмотреть пример <ArrowRight size={17} />
              </button>
              <button className="btn ghost" onClick={() => setHelp(true)}>
                <HelpCircle size={17} /> Не понял
              </button>
            </div>
          </section>
        </>
      )}
      {stage === 1 && (
        <section className="panel lesson-text">
          <span className="eyebrow">02 · НАГЛЯДНЫЙ ПРИМЕР</span>
          <h2>Разберём на предложении</h2>
          <p className="sentence">
            {parts[0]}
            <mark>{t.marked}</mark>
            {parts[1]}
          </p>
          <p>{t.exampleExplanation}</p>
          <div className="note">{t.difference}</div>
          <div className="actions">
            <button className="btn primary" onClick={() => setStage(2)}>
              Как решать самому <ArrowRight size={17} />
            </button>
            <button className="btn ghost" onClick={() => setHelp(true)}>
              Не понял
            </button>
          </div>
        </section>
      )}
      {stage === 2 && (
        <section className="panel lesson-text">
          <span className="eyebrow">03 · АЛГОРИТМ РЕШЕНИЯ</span>
          <h2>Действуй по шагам</h2>
          <ol className="algorithm">
            {t.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="note">Частая ловушка: {t.trap}</p>
          <div className="actions">
            <button className="btn primary" onClick={() => setStage(3)}>
              Попробовать вместе <Play size={16} />
            </button>
            <button className="btn ghost" onClick={() => setHelp(true)}>
              Не понял
            </button>
          </div>
        </section>
      )}
      {stage === 3 && (
        <>
          <Character>
            Первое упражнение — с опорой на алгоритм. Подсказка поможет сделать
            первый шаг.
          </Character>
          <div className="note">Первый шаг: {qs[0].hints[0]}</div>
          <Practice
            key={`${id}-guided`}
            questions={qs.slice(0, 1)}
            guided
            onDone={() => setStage(4)}
          />
        </>
      )}
      {stage === 4 && (
        <>
          <div className="note">
            Теперь попробуй самостоятельно. При необходимости помощь всё равно
            доступна.
          </div>
          <Practice
            key={`${id}-independent`}
            questions={qs.slice(1)}
            onDone={() => setStage(5)}
          />
        </>
      )}
      {stage === 5 && (
        <section className="panel exercise">
          <span className="eyebrow">06 · ПРОВЕРКА ПОНИМАНИЯ</span>
          <h2>{t.understanding.question}</h2>
          <div className="answers">
            {t.understanding.options.map((o) => (
              <button
                key={o}
                disabled={checked}
                className={"answer " + (chosen === o ? "selected" : "")}
                onClick={() => setChosen(o)}
              >
                {o}
              </button>
            ))}
          </div>
          {checked && (
            <div className="note" aria-live="polite">
              {t.understanding.explanation}
            </div>
          )}
          <div className="actions">
            {!checked ? (
              <button
                className="btn primary"
                disabled={!chosen}
                onClick={() => setChecked(true)}
              >
                Проверить объяснение
              </button>
            ) : chosen === t.understanding.answer ? (
              <button className="btn primary" onClick={finish}>
                Завершить урок
              </button>
            ) : (
              <button
                className="btn"
                onClick={() => {
                  setChosen("");
                  setChecked(false);
                }}
              >
                Попробовать ещё раз
              </button>
            )}
            <button className="btn ghost" onClick={() => setHelp(true)}>
              Не понял
            </button>
          </div>
        </section>
      )}
      {stage === 6 && (
        <section className="panel finish">
          <span className="eyebrow">УРОК ЗАВЕРШЁН</span>
          <h2>Теперь у тебя есть опора.</h2>
          <p>Тема сохранена. Твои упражнения уже в плане повторений.</p>
          <p className="muted">
            Текущий показатель самостоятельности: {mastery(p, t.id)}%. Он
            учитывает подсказки и последние ответы, а не прогнозирует балл ЕГЭ.
          </p>
          <div className="actions">
            <Link className="btn primary" to="/">
              На главную
            </Link>
            <Link className="btn" to="/practice">
              Ещё немного практики
            </Link>
          </div>
        </section>
      )}
      {help && <Help topic={t} onClose={() => setHelp(false)} />}
    </>
  );
}
