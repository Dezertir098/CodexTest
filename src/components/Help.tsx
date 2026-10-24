import { diagnose } from "../lib/engine";
import { useEffect, useRef, useState } from "react";
import { X, Lightbulb } from "lucide-react";
import type { Topic, Exercise } from "../data/curriculum";
import { Character } from "./Character";
import { serverTutor } from "../lib/tutor";
const explanationHistory = new Map<string, string[]>();
const labels = [
  "Объясни проще",
  "Покажи другой пример",
  "Объясни пошагово",
  "Почему мой ответ неправильный?",
  "В чём разница?",
  "Я не понимаю с самого начала",
  "Задать свой вопрос",
];
export function Help({
  topic,
  q,
  answer,
  onClose,
  onHint,
}: {
  topic: Topic;
  q?: Exercise;
  answer?: string;
  onClose: () => void;
  onHint?: () => void;
}) {
  const [tab, setTab] = useState(0);
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState(false);
  const [ai, setAi] = useState("");
  const [busy, setBusy] = useState(false);
  const historyKey = q?.id ?? topic.id;
  const [shown, setShown] = useState<string[]>(
    () => explanationHistory.get(historyKey) ?? ["Объясни проще"],
  );
  useEffect(() => {
    explanationHistory.set(historyKey, shown);
  }, [historyKey, shown]);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const askAI = async () => {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setBusy(true);
    setAi("");
    try {
      const reply = await serverTutor.ask(
        {
          topic: {
            title: topic.title,
            basics: topic.basics,
            rule: topic.rule,
            steps: topic.steps,
          },
          exercise: q
            ? { prompt: q.prompt, text: q.text, hints: q.hints }
            : undefined,
          submittedAnswer: answer,
          question,
          shownExplanations: shown,
        },
        c.signal,
      );
      setAi(reply);
      onHint?.();
    } catch (e) {
      if (!c.signal.aborted)
        setAi(e instanceof Error ? e.message : "Ошибка подключения.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="help-shade" onClick={onClose}>
      <section
        className="help-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Помощь по теме"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "Tab") {
            const els = e.currentTarget.querySelectorAll<HTMLElement>(
              "button,input,textarea,a[href]",
            );
            const first = els[0],
              last = els[els.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <button
          autoFocus
          className="icon-button close"
          aria-label="Закрыть помощь"
          onClick={onClose}
        >
          <X />
        </button>
        <span className="eyebrow">
          <Lightbulb size={16} /> Давай разберёмся
        </span>
        <h2>Можно с самого начала.</h2>
        <p className="muted">{topic.title} · помощь без ИИ</p>
        <Character who="noelle">
          Выбери, что именно вызывает трудность. Начнём с одного понятного шага.
        </Character>
        <div className="help-options">
          {labels.map((l, i) => (
            <button
              key={l}
              className={tab === i ? "selected" : ""}
              onClick={() => {
                setTab(i);
                setShown((s) => [...new Set([...s, labels[i]])]);
                onHint?.();
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="help-content" aria-live="polite">
          {tab === 0 && (
            <>
              <h3>Представь это так</h3>
              <p>{topic.simple}</p>
              <p className="note">
                Попробуй объяснить правило одним предложением своими словами.
              </p>
            </>
          )}
          {tab === 1 && (
            <>
              <h3>Другой пример</h3>
              <p>{topic.otherExample}</p>
              <p className="note">
                Сравни этот пример с исходным: что изменилось?
              </p>
            </>
          )}
          {tab === 2 && (
            <>
              <h3>Один шаг за другим</h3>
              <ol>
                {(q ? q.hints : topic.steps).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p>Сначала выполни первый шаг, затем вернись к условию.</p>
            </>
          )}
          {tab === 3 && (
            <>
              <h3>Разбираем твой ответ</h3>
              {q && answer ? (
                <>
                  <p>
                    Твой ответ: <strong>{answer.replaceAll("|", ", ")}</strong>
                  </p>
                  <p>{diagnose(q, answer)}</p>
                  <p>{q.explanation}</p>
                  <ul>
                    {q.mistakes.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>
                  Сначала отправь ответ на упражнение. Тогда здесь появится
                  разбор именно этого задания. Пока проверь частую ловушку:{" "}
                  {topic.trap}
                </p>
              )}
            </>
          )}
          {tab === 4 && (
            <>
              <h3>Похожие случаи</h3>
              <p>{topic.difference}</p>
            </>
          )}
          {tab === 5 && (
            <>
              <h3>Базовые понятия</h3>
              <p>{topic.basics}</p>
              <p>{topic.simple}</p>
            </>
          )}
          {tab === 6 && (
            <>
              <h3>Твой вопрос</h3>
              <p>
                Локальный поиск подбирает готовый материал по словам вопроса.
                Для свободного диалога можно отдельно подключить сервер ИИ: ключ
                хранится только на сервере.
              </p>
              <textarea
                aria-label="Вопрос наставнику"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  setAsked(false);
                }}
                placeholder="Например: чем отличаются эти случаи?"
              />
              <button
                className="btn"
                disabled={!question.trim()}
                onClick={() => {
                  setAsked(true);
                  onHint?.();
                }}
              >
                Найти в материалах
              </button>
              <p className="small muted">
                При запросе к ИИ вопрос и контекст урока отправятся настроенному
                внешнему провайдеру.
              </p>
              <button
                className="btn ghost"
                disabled={!question.trim() || busy}
                onClick={askAI}
              >
                {busy ? "Ждём наставника…" : "Спросить подключённого ИИ"}
              </button>
              {ai && (
                <div className="note" role="status">
                  <span className="eyebrow">
                    Ответ сервера ИИ · может содержать ошибки
                  </span>
                  <p style={{ whiteSpace: "pre-wrap" }}>{ai}</p>
                </div>
              )}
              {asked && (
                <div className="note">
                  {/разниц|отлич/i.test(question)
                    ? topic.difference
                    : /пример/i.test(question)
                      ? topic.otherExample
                      : /почему|ошиб/i.test(question)
                        ? (q?.explanation ?? topic.trap)
                        : topic.basics}
                  <p>
                    Если это не отвечает на вопрос, выбери пошаговый разбор.
                    Ответ ИИ не генерировался.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <p className="small muted">
          Помощь учитывает тему{q ? " и текущее задание" : ""}. Использование
          подсказок отмечается в прогрессе.
        </p>
      </section>
    </div>
  );
}
