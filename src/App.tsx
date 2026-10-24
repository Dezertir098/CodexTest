import { topics } from "./data/curriculum";
import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation, Link } from "react-router-dom";
import {
  Home as HomeIcon,
  Map,
  LibraryBig,
  Dumbbell,
  NotebookPen,
  ChartNoAxesCombined,
  Settings,
  Menu,
  X,
  GraduationCap,
  PanelLeftClose,
  PenLine,
} from "lucide-react";
import {
  Home,
  Library,
  Lesson,
  Training,
  Essay,
  Statistics,
  Preferences,
} from "./pages";
import { ExamPage } from "./Exam";
import { useProgress } from "./lib/store";
const nav = [
  ["/", "Главная", HomeIcon],
  ["/map", "Карта обучения", Map],
  ["/library", "Библиотека теории", LibraryBig],
  ["/practice", "Тренажёр", Dumbbell],
  ["/errors", "Работа над ошибками", NotebookPen],
  ["/exam", "Пробная работа", GraduationCap],
  ["/essay", "Мастерская сочинения", PenLine],
  ["/statistics", "Мой прогресс", ChartNoAxesCombined],
] as const;
export default function App() {
  const { p, saveError, recovery, resumeSaving } = useProgress();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const exam = location.pathname === "/exam" && p.exam && !p.exam.finished;
  useEffect(() => {
    window.scrollTo(0, 0);
    setOpen(false);
  }, [location.pathname]);
  return (
    <div
      className={`app motion-${p.settings.motion} ${p.settings.focus ? "focus-mode" : ""} ${!p.settings.characters ? "characters-hidden" : ""} ${exam ? "exam-mode" : ""}`}
      style={
        { "--learning-size": `${p.settings.font}px` } as React.CSSProperties
      }
    >
      <a className="skip-link" href="#main">
        К содержимому
      </a>
      <button
        className="mobile-menu icon-button"
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && <div className="mobile-shade" onClick={() => setOpen(false)} />}
      <aside className={"sidebar " + (open ? "open" : "")}>
        <Link to="/" className="brand">
          <span className="brand-soul">♥</span>
          <div>
            ПУТЬ К ЕГЭ<span>ТЁМНЫЙ МИР ЗНАНИЙ</span>
          </div>
        </Link>
        <div className="sidebar-caption">ТВОЁ ПУТЕШЕСТВИЕ</div>
        <nav aria-label="Основная навигация">
          {nav.map(([href, title, Icon]) => (
            <NavLink end={href === "/"} to={href} key={href}>
              <Icon size={19} />
              <span>{title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="goal">
            <span>ТВОЯ ЦЕЛЬ</span>
            <strong>Русский язык · 2027</strong>
            <p>Понимать. Пробовать. Расти.</p>
            <div className="progress-track">
              <i
                style={{
                  width: (p.completed.length / topics.length) * 100 + "%",
                }}
              />
            </div>
            <small>
              {p.completed.length} из {topics.length} тем пройдено
            </small>
          </div>
          <NavLink to="/settings">
            <Settings size={18} /> Настройки
          </NavLink>
          <div className="user">
            <span className="user-avatar">К</span>
            <div>
              Твоё путешествие<small>В собственном темпе</small>
            </div>
            <PanelLeftClose size={16} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <div className="topbar">
          <span>
            Тёмный мир <span className="muted">/</span>{" "}
            {nav.find((n) => n[0] === location.pathname)?.[1] ||
              (location.pathname.startsWith("/lesson")
                ? "Урок"
                : location.pathname === "/settings"
                  ? "Настройки"
                  : "Диагностика")}
          </span>
          <span className="topbar-right">
            <span className="tiny-star">✦</span> Знания остаются с тобой
          </span>
        </div>
        {recovery !== null && (
          <div role="alert" className="storage-warning">
            <p>
              Сохранение повреждено или относится к несовместимой версии.
              Исходные данные пока не перезаписаны. Экспортируй их перед
              продолжением.
            </p>
            <div className="actions">
              <button
                className="btn"
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([recovery], { type: "application/json" }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "progress-recovery.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Скачать исходное сохранение
              </button>
              <button
                className="btn"
                onClick={() => {
                  if (
                    window.confirm(
                      "Разрешить заменить несовместимое сохранение текущим прогрессом?",
                    )
                  )
                    resumeSaving();
                }}
              >
                Сохранять текущий прогресс
              </button>
            </div>
          </div>
        )}
        {saveError && (
          <div role="alert" className="storage-warning">
            Не удалось сохранить данные в браузере. Экспортируй прогресс в
            настройках, прежде чем закрывать страницу.
          </div>
        )}
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Library map />} />
            <Route path="/library" element={<Library />} />
            <Route
              path="/lesson/:id"
              element={<Lesson key={location.pathname} />}
            />
            <Route path="/practice" element={<Training key="practice" />} />
            <Route path="/errors" element={<Training errors key="errors" />} />
            <Route
              path="/diagnostic"
              element={<Training diagnostic key="diagnostic" />}
            />
            <Route path="/essay" element={<Essay />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Preferences />} />
            <Route path="/exam" element={<ExamPage />} />
            <Route
              path="*"
              element={
                <div className="panel">
                  <h1>Здесь пока нет тропинки.</h1>
                  <Link to="/">На главную</Link>
                </div>
              }
            />
          </Routes>
        </main>
        <footer>
          <span>♥</span> Неофициальный фанатский образовательный инструмент.
          DELTARUNE — Toby Fox.
          <br />
          Оригинальные упрощённые иллюстрации. Музыка и спрайты игры не
          используются.
        </footer>
      </div>
    </div>
  );
}
