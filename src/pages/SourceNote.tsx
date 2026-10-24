import { requirements } from "../data/curriculum";

export function SourceNote() {
  return (
    <details className="source-note">
      <summary>Об источниках и требованиях ЕГЭ-2027</summary>
      <p>{requirements.note}</p>
      <a href={requirements.source} target="_blank" rel="noreferrer">
        Документы ФИПИ ↗
      </a>
      <p>
        Материалы — оригинальные учебные упражнения, не задания ФИПИ. Нумерация
        отмечена звёздочкой как непроверенный ориентир. Перед экзаменом
        требуется сверка с опубликованной спецификацией.
      </p>
    </details>
  );
}
