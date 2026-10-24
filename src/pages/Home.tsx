import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Clock,
  Compass,
  Flame,
  Flower2,
  Leaf,
  Sparkles,
  Target,
} from "lucide-react";
import { topics } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { mastery, status } from "../lib/engine";
import { Character, Portrait } from "../components/Character";

import { Heading } from "./Heading";
export function Home() {
  const { p } = useProgress();
  const completed = p.completed.length;
  const attempts = p.attempts;
  const accuracy = attempts.length
    ? Math.round(
        (attempts.filter((a) => a.correct).length / attempts.length) * 100,
      )
    : 0;
  const due = Object.values(p.reviews).filter(
    (r) => r.due <= Date.now(),
  ).length;
  const weak = [...topics]
    .filter((t) => status(p, t.id) === "Требует повторения")
    .sort((a, b) => mastery(p, a.id) - mastery(p, b.id));
  const current = topics.find((t) => t.id === p.lastTopic)!;
  return (
    <>
      <div className="welcome-line">
        <span className="eyebrow">
          <span className="tiny-star">✦</span> ТВОЁ ТИХОЕ МЕСТО ДЛЯ БОЛЬШИХ
          ЦЕЛЕЙ
        </span>
        <span className="subtle-pill">
          <span /> В своём темпе
        </span>
      </div>
      <Heading
        eyebrow=""
        title={
          p.sessions.length
            ? "Рады видеть тебя снова."
            : "Твой путь начинается здесь."
        }
      >
        До больших результатов — маленькими понятными шагами.
      </Heading>
      <section className="hero">
        <div className="hero-copy">
          <span className="tag green">
            <Leaf size={13} /> ПУТЬ К ЕГЭ ПО РУССКОМУ
          </span>
          <h2>
            В тебе есть
            <br />
            сила <em>разобраться.</em>
          </h2>
          <p>
            Изучай правила, пробуй, ошибайся и находи ответы.
            <br className="desktop" /> Мы рядом — а темп выбираешь ты.
          </p>
          <Link className="btn primary" to={"/lesson/" + current.id}>
            {p.attempts.length ? "Продолжить обучение" : "Начать обучение"}{" "}
            <ArrowRight size={18} />
          </Link>
          <span className="small muted hero-note">
            <Clock size={13} /> Сегодня достаточно даже 10 минут
          </span>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="pixel-stars">
            ✧<span>✦</span>
            <b>✧</b>
          </div>
          <div className="moon" />
          <div className="mountain m1" />
          <div className="mountain m2" />
          <div className="castle">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="pixel-path" />
          <div className="art-portrait">
            <Portrait large />
          </div>
          <span className="art-caption">ПУТЕШЕСТВИЕ К ЗНАНИЯМ</span>
        </div>
      </section>
      <div className="stat-row">
        <div>
          <span className="stat-icon lavender">
            <BookOpen />
          </span>
          <div>
            <strong>
              {completed} <small>/ {topics.length}</small>
            </strong>
            <p>Тем изучено</p>
          </div>
        </div>
        <div>
          <span className="stat-icon green">
            <Target />
          </span>
          <div>
            <strong>{attempts.length ? accuracy + "%" : "—"}</strong>
            <p>Верных ответов</p>
          </div>
        </div>
        <div>
          <span className="stat-icon peach">
            <Flame />
          </span>
          <div>
            <strong>{p.sessions.length}</strong>
            <p>Занятий завершено</p>
          </div>
        </div>
        <div>
          <span className="stat-icon blue">
            <Clock />
          </span>
          <div>
            <strong>{due}</strong>
            <p>Заданий к повторению</p>
          </div>
        </div>
      </div>
      <div className="home-columns">
        <section>
          <div className="section-line">
            <h2>Твой следующий шаг</h2>
            <Link className="text-link" to="/map">
              Вся карта <ArrowUpRight size={15} />
            </Link>
          </div>
          <Link className="next-card" to={"/lesson/" + current.id}>
            <div className="topic-icon">
              <BookOpen />
            </div>
            <div>
              <span className="eyebrow">
                {current.group} · ориентир № {current.exam}
              </span>
              <h3>{current.title}</h3>
              <p>{current.description}</p>
              <div className="small muted">
                <Clock size={13} /> {current.minutes} минут <span>·</span>{" "}
                Теория и практика
              </div>
            </div>
            <ArrowRight className="next-arrow" />
          </Link>
          <div className="mini-grid">
            <Link className="mini-card" to="/practice">
              <span className="stat-icon lavender">
                <Sparkles />
              </span>
              <h3>
                Быстрая тренировка <ArrowUpRight size={16} />
              </h3>
              <p>Несколько заданий под твой уровень.</p>
              <span className="small muted">5–10 минут</span>
            </Link>
            <Link className="mini-card" to="/exam">
              <span className="stat-icon blue">
                <Compass />
              </span>
              <h3>
                Пробная работа <ArrowUpRight size={16} />
              </h3>
              <p>Проверь себя в спокойном режиме.</p>
              <span className="small muted">Учебный формат</span>
            </Link>
          </div>
        </section>
        <section>
          <div className="section-line">
            <h2>Немного заботы о знаниях</h2>
            <Flower2 size={20} className="muted" />
          </div>
          <div className="panel review-card">
            <span className="eyebrow">
              {weak.length ? "СТОИТ ПОВТОРИТЬ" : "ДЛЯ УВЕРЕННОГО СТАРТА"}
            </span>
            {(weak.length ? weak.slice(0, 2) : topics.slice(2, 4)).map((t) => (
              <Link className="review-topic" to={"/lesson/" + t.id} key={t.id}>
                <span className="dot" />
                <span>
                  {t.short}
                  <small>
                    {weak.length
                      ? "Вернёмся к трудным местам"
                      : "Начни с простого объяснения"}
                  </small>
                </span>
                <ArrowRight size={15} />
              </Link>
            ))}
            <Link
              className="btn ghost wide"
              to={p.diagnosed ? "/errors" : "/diagnostic"}
            >
              {p.diagnosed
                ? "Работа над ошибками"
                : "Пройти короткую диагностику"}{" "}
              <ArrowRight size={15} />
            </Link>
          </div>
          <Character>
            Не нужно знать всё сразу. Сегодня можно понять одно правило — и это
            уже движение вперёд.
          </Character>
        </section>
      </div>
      <div className="source-banner">
        <span>✧</span>
        <p>
          Здесь можно учиться без спешки.{" "}
          <span>Твой прогресс сохраняется в этом браузере.</span>
        </p>
        <Link to="/settings">
          Настроить под себя <ArrowUpRight size={14} />
        </Link>
      </div>
    </>
  );
}
