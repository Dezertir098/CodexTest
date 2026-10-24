import { useState } from "react";

import { essayText, essayGuide } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { wordCount } from "../lib/engine";

import { Heading } from "./Heading";
import { SourceNote } from "./SourceNote";
export function Essay() {
  const { p, set } = useProgress();
  const [tab, setTab] = useState(0);
  const [checked, setChecked] = useState(false);
  const count = wordCount(p.essay);
  return (
    <>
      <Heading
        eyebrow="МАСТЕРСКАЯ ТЕКСТА · ОРИЕНТИР № 27*"
        title="Мысль, которой найдутся слова."
      >
        Редактор с автосохранением. Формальная самопроверка без обещаний
        экзаменационной оценки.
      </Heading>
      <SourceNote />
      <div className="essay-layout">
        <section className="panel">
          <span className="eyebrow">АВТОРСКИЙ УЧЕБНЫЙ ТЕКСТ</span>
          <p className="reading">{essayText}</p>
          <div className="note">
            Вопрос для работы: почему важно заботиться об общем благе?
          </div>
          <h3>Опора для сочинения</h3>
          <div className="essay-tabs">
            {essayGuide.map(([title], i) => (
              <button
                className={tab === i ? "selected" : ""}
                key={title}
                onClick={() => setTab(i)}
              >
                {i + 1}. {title}
              </button>
            ))}
          </div>
          <p>{essayGuide[tab][1]}</p>
          <p className="small muted">
            Компьютерные игры и фанфики здесь не предлагаются как
            экзаменационные аргументы. Допустимость источников проверяй по
            актуальным критериям.
          </p>
        </section>
        <section className="panel">
          <div className="section-line">
            <h2>Твой черновик</h2>
            <span className="tag green">Автосохранение</span>
          </div>
          <textarea
            className="essay-editor"
            aria-label="Текст сочинения"
            value={p.essay}
            onChange={(e) => {
              set((s) => ({ ...s, essay: e.target.value }));
              setChecked(false);
            }}
            placeholder="Начни с мысли, которую хочешь выразить…"
          />
          <div className="section-line small muted">
            <span>
              {count} слов · {p.essay.length} символов
            </span>
            <span>Хранится на этом устройстве</span>
          </div>
          <button className="btn primary" onClick={() => setChecked(true)}>
            Формальная самопроверка
          </button>
          {checked && (
            <div className="note">
              <h3>Что удалось проверить</h3>
              <p>
                Слов по локальному алгоритму: {count}. Непустых абзацев:{" "}
                {p.essay.split(/\n+/).filter((x) => x.trim()).length}.
              </p>
              <p>
                {count === 0
                  ? "Добавь текст, чтобы начать работу."
                  : "Проверь вручную: позицию автора, два примера с пояснениями, смысловую связь, собственную позицию и аргумент."}
              </p>
              <p>
                Орфография, речевые ошибки, логика и субъективные критерии
                автоматически не оценивались. Официальный минимальный объём и
                баллы 2027 года не подтверждены. Нужна проверка преподавателем;
                ИИ не подключён.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
