import type { Exercise } from "../data/curriculum";
export function AnswerInput({
  q,
  value,
  onChange,
  disabled = false,
}: {
  q: Exercise;
  value: string;
  onChange: (s: string) => void;
  disabled?: boolean;
}) {
  const toggle = (s: string) => {
    const a = value ? value.split("|") : [];
    onChange(
      a.includes(s) ? a.filter((x) => x !== s).join("|") : [...a, s].join("|"),
    );
  };
  if (q.format === "single" || q.format === "multi")
    return (
      <div className="answers">
        {q.options!.map((o, i) => (
          <button
            key={o}
            type="button"
            disabled={disabled}
            aria-pressed={
              q.format === "multi" ? value.split("|").includes(o) : value === o
            }
            className={
              "answer " +
              ((
                q.format === "multi"
                  ? value.split("|").includes(o)
                  : value === o
              )
                ? "selected"
                : "")
            }
            onClick={() => (q.format === "single" ? onChange(o) : toggle(o))}
          >
            <span>{String.fromCharCode(1040 + i)}</span>
            {o}
          </button>
        ))}
      </div>
    );
  if (q.format === "matching")
    return (
      <div className="matching">
        <p className="small">
          1 — деепричастный оборот · 2 — управление · 3 — согласование
        </p>
        {q.options!.map((o, i) => (
          <label key={o}>
            {o}
            <select
              disabled={disabled}
              aria-label={o}
              value={value[i] || ""}
              onChange={(e) => {
                const a = [...value.padEnd(q.options!.length, "_")];
                a[i] = e.target.value || "_";
                onChange(a.join(""));
              }}
            >
              <option value="">—</option>
              {[1, 2, 3].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    );
  if (q.format === "highlight")
    return (
      <div className="word-buttons" aria-label="Выделение слов">
        {q.options!.map((o) => (
          <button
            disabled={disabled}
            aria-pressed={value.split(" ").includes(o)}
            className={value.split(" ").includes(o) ? "selected" : ""}
            key={o}
            onClick={() => {
              const a = value.split(" ").filter(Boolean);
              const next = a.includes(o) ? a.filter((x) => x !== o) : [...a, o];
              onChange(q.options!.filter((x) => next.includes(x)).join(" "));
            }}
          >
            {o}
          </button>
        ))}
      </div>
    );
  if (q.format === "punctuation") {
    const positions = [...(q.text || "").matchAll(/\((\d)\)/g)].map(
      (m) => m[1],
    );
    return (
      <div className="word-buttons">
        {positions.map((n) => (
          <button
            disabled={disabled}
            aria-pressed={value.includes(n)}
            key={n}
            className={value.includes(n) ? "selected" : ""}
            onClick={() =>
              onChange(value.includes(n) ? value.replace(n, "") : value + n)
            }
          >
            Запятая {n}
          </button>
        ))}
      </div>
    );
  }
  return (
    <label className="field">
      {q.format === "digits"
        ? "Последовательность цифр"
        : q.format === "correction"
          ? "Исправленное предложение"
          : "Твой ответ"}
      <input
        autoComplete="off"
        disabled={disabled}
        value={value}
        inputMode={q.format === "digits" ? "numeric" : "text"}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.format === "digits" ? "Например: 12" : "Введи ответ"}
      />
    </label>
  );
}
