import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import { topics } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { mastery, status } from "../lib/engine";

import { Heading } from "./Heading";
import { SourceNote } from "./SourceNote";
export function Library({ map = false }: { map?: boolean }) {
  const { p } = useProgress();
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("Все темы");
  const list = topics.filter(
    (t) =>
      (group === "Все темы" || t.group === group) &&
      `${t.title} ${t.rule}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow={map ? "ТВОЯ ТРАЕКТОРИЯ" : "БИБЛИОТЕКА ТЕОРИИ"}
        title={
          map ? "Карта маленьких открытий" : "Сначала понять. Потом запомнить."
        }
      >
        {map
          ? "Все темы открыты. Выбирай то, что сейчас нужнее."
          : "Короткие объяснения, наглядные примеры и практика с разбором."}
      </Heading>
      <div className="filters">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Поиск темы"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти тему или правило"
          />
        </label>
        <select
          aria-label="Раздел программы"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          {["Все темы", ...new Set(topics.map((t) => t.group))].map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>
      <div className={map ? "learning-map" : "topic-grid"}>
        {list.map((t, i) => (
          <Link
            to={"/lesson/" + t.id}
            className={"topic-card " + (map ? "map-node" : "")}
            key={t.id}
          >
            {map && (
              <span className="node-number">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            <div className="section-line">
              <span className="eyebrow">{t.group}</span>
              <ArrowUpRight size={18} />
            </div>
            <h2>{t.title}</h2>
            <p>{t.description}</p>
            <div className="progress-track">
              <i style={{ width: mastery(p, t.id) + "%" }} />
            </div>
            <div className="section-line small muted">
              <span
                className={status(p, t.id) === "Освоено" ? "green-text" : ""}
              >
                {status(p, t.id)}
              </span>
              <span>
                {t.minutes} мин · № {t.exam}*
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!list.length && (
        <p className="panel">
          Тем по этому запросу нет. Попробуй другое слово.
        </p>
      )}
      <SourceNote />
    </>
  );
}
