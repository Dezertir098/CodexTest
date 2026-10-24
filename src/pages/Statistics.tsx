import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import { topics } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { mastery } from "../lib/engine";

import { Heading } from "./Heading";
export function Statistics() {
  const { p } = useProgress();
  const a = p.attempts;
  const correct = a.filter((a) => a.correct).length;
  let streak = 0,
    best = 0;
  for (const x of a) {
    streak = x.correct && !x.assisted ? streak + 1 : 0;
    best = Math.max(streak, best);
  }
  const independent = a.filter((x) => x.correct && !x.assisted).length;
  return (
    <>
      <Heading eyebrow="СТАТИСТИКА" title="Твой путь виден в деталях.">
        Здесь только реальные результаты. Пропущенные дни ничего не отнимают.
      </Heading>
      <div className="stat-row">
        <div>
          <span className="stat-icon lavender">
            <Target />
          </span>
          <div>
            <strong>{a.length}</strong>
            <p>Ответов</p>
          </div>
        </div>
        <div>
          <div>
            <strong>
              {a.length ? Math.round((correct / a.length) * 100) + "%" : "—"}
            </strong>
            <p>Верных</p>
          </div>
        </div>
        <div>
          <div>
            <strong>{independent}</strong>
            <p>Верно без помощи</p>
          </div>
        </div>
        <div>
          <div>
            <strong>{best}</strong>
            <p>Лучшая серия без помощи</p>
          </div>
        </div>
      </div>
      <div className="home-columns">
        <section className="panel">
          <h2>По темам</h2>
          {topics.map((t) => (
            <div className="topic-stat" key={t.id}>
              <div className="section-line">
                <Link to={"/lesson/" + t.id}>{t.short}</Link>
                <span className="small muted">
                  {a.some((a) => a.topic === t.id)
                    ? mastery(p, t.id) + "%"
                    : "Нет ответов"}
                </span>
              </div>
              <div className="progress-track">
                <i style={{ width: mastery(p, t.id) + "%" }} />
              </div>
            </div>
          ))}
          <p className="small muted">
            Показатель учитывает до 12 последних ответов: верный без помощи = 1,
            с помощью = 0,5. Это учебная метрика, не прогноз ЕГЭ.
          </p>
        </section>
        <section>
          <div className="panel">
            <h2>История занятий</h2>
            {!p.sessions.length && (
              <p className="muted">Заверши первый урок — он появится здесь.</p>
            )}
            {p.sessions
              .slice(-8)
              .reverse()
              .map((s, i) => (
                <div className="history-row" key={i}>
                  <span>{topics.find((t) => t.id === s.topic)?.short}</span>
                  <time>{new Date(s.at).toLocaleDateString("ru")}</time>
                </div>
              ))}
          </div>
          <div className="panel">
            <h2>Небольшие открытия</h2>
            <p className={p.completed.length ? "green-text" : "muted"}>
              ✦ Первый завершённый урок{" "}
              {p.completed.length ? "— получилось" : "— впереди"}
            </p>
            <p className={best >= 5 ? "green-text" : "muted"}>
              ✧ Пять самостоятельных ответов подряд{" "}
              {best >= 5 ? "— получилось" : "— впереди"}
            </p>
            <p className={p.diagnosed ? "green-text" : "muted"}>
              ❖ Знакомство со своим уровнем{" "}
              {p.diagnosed ? "— диагностика завершена" : "— впереди"}
            </p>
          </div>
          <div className="panel">
            <h2>Динамика ответов</h2>
            <div
              className="answer-history"
              aria-label="Последние двадцать ответов"
            >
              {a.slice(-20).map((x) => (
                <span
                  key={x.id}
                  className={x.correct ? "ok" : "bad"}
                  title={`${x.correct ? "Верно" : "Ошибка"}${x.assisted ? ", с помощью" : ""}`}
                >
                  {x.correct ? "✓" : "·"}
                </span>
              ))}
            </div>
            {!a.length && <p className="muted">Пока нет ответов.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
