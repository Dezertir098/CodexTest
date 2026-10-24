import { useRef, useState } from "react";

import { Download, Upload, Trash2 } from "lucide-react";

import { useProgress } from "../lib/store";
import { fresh, status, parseProgress, type Settings } from "../lib/engine";

import { Heading } from "./Heading";
import { SourceNote } from "./SourceNote";
export function Preferences() {
  const { p, set } = useProgress();
  const [message, setMessage] = useState("");
  const [reset, setReset] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    set((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
  const exportData = () => {
    const blob = new Blob([JSON.stringify(p, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "put-k-ege-progress.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Файл прогресса экспортирован.");
  };
  return (
    <>
      <Heading
        eyebrow="НАСТРОЙКИ КОМФОРТА"
        title="Пусть здесь будет удобно тебе."
      >
        Всё сохраняется локально. Учись в своём темпе.
      </Heading>
      <div className="settings-grid">
        <section className="panel">
          <h2>Пространство</h2>
          <label className="setting-row">
            Размер учебного текста
            <select
              value={p.settings.font}
              onChange={(e) => update("font", Number(e.target.value))}
            >
              {[16, 18, 20, 22].map((n) => (
                <option key={n} value={n}>
                  {n} px
                </option>
              ))}
            </select>
          </label>
          <label className="setting-row">
            Анимации
            <select
              value={p.settings.motion}
              onChange={(e) =>
                update("motion", e.target.value as Settings["motion"])
              }
            >
              <option value="full">Обычные</option>
              <option value="reduced">Уменьшенные</option>
              <option value="off">Полностью отключены</option>
            </select>
          </label>
          <label className="setting-row">
            Показывать персонажей
            <input
              type="checkbox"
              checked={p.settings.characters}
              onChange={(e) => update("characters", e.target.checked)}
            />
          </label>
          <label className="setting-row">
            Режим концентрации
            <input
              type="checkbox"
              checked={p.settings.focus}
              onChange={(e) => update("focus", e.target.checked)}
            />
          </label>
          <p className="small muted">
            В концентрации скрыты персонажи и декоративная иллюстрация. В
            пробной работе они скрываются автоматически.
          </p>
        </section>
        <section className="panel">
          <h2>Твой ритм</h2>
          <label className="setting-row">
            Длительность сессии
            <select
              value={p.settings.minutes}
              onChange={(e) => update("minutes", Number(e.target.value))}
            >
              {[10, 20, 30, 45, 60].map((n) => (
                <option key={n} value={n}>
                  {n} минут
                </option>
              ))}
            </select>
          </label>
          <label className="setting-row">
            Сложность
            <select
              value={p.settings.difficulty}
              onChange={(e) =>
                update("difficulty", e.target.value as Settings["difficulty"])
              }
            >
              <option value="adaptive">Подбирать по результатам</option>
              <option value="easy">Сначала основы</option>
              <option value="hard">Сначала сложные</option>
            </select>
          </label>
          <p className="small muted">
            Интервалы повторения: 1 → 2 → 4 → 8 → 16 → 30 дней. Ошибка
            возвращает задание через 10 минут. Подсказка оставляет интервал в
            один день.
          </p>
          <h3>ИИ-наставник</h3>
          <p className="muted">
            По умолчанию выключен. Реализован отдельный серверный адаптер;
            настройка описана в README. Все базовые объяснения доступны без
            ключей и сервера. Ответы ИИ могут ошибаться.
          </p>
        </section>
        <section className="panel">
          <h2>Твои данные</h2>
          <p>
            Прогресс, настройки и черновик хранятся в localStorage этого
            браузера. Экспортируй копию перед сменой устройства или очисткой
            данных.
          </p>
          <div className="actions">
            <button className="btn" onClick={exportData}>
              <Download size={16} /> Экспорт
            </button>
            <button className="btn" onClick={() => input.current?.click()}>
              <Upload size={16} /> Импорт
            </button>
          </div>
          <input
            ref={input}
            type="file"
            accept="application/json,.json"
            className="file-input"
            aria-label="Файл прогресса"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 5000000) throw Error("Файл больше 5 МБ.");
                const data = parseProgress(await file.text());
                if (
                  !window.confirm("Заменить текущий прогресс данными из файла?")
                )
                  return;
                set(data);
                setMessage("Прогресс восстановлен.");
              } catch (err) {
                setMessage(
                  err instanceof Error
                    ? err.message
                    : "Не удалось импортировать файл.",
                );
              }
              e.target.value = "";
            }}
          />
          <p role="status">{message}</p>
        </section>
        <section className="panel">
          <h2>Начать заново</h2>
          <p>
            Сброс удалит историю, план повторения, настройки и черновик. Сначала
            можно экспортировать копию.
          </p>
          {!reset ? (
            <button className="btn danger" onClick={() => setReset(true)}>
              <Trash2 size={16} /> Сбросить прогресс
            </button>
          ) : (
            <div className="note">
              <p>Удалить все данные на этом устройстве?</p>
              <div className="actions">
                <button
                  className="btn danger"
                  onClick={() => {
                    set(fresh());
                    setReset(false);
                    setMessage("Прогресс сброшен.");
                  }}
                >
                  Да, удалить
                </button>
                <button className="btn" onClick={() => setReset(false)}>
                  Отмена
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      <SourceNote />
    </>
  );
}
