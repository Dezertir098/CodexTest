import { useProgress } from "../lib/store";
export function Portrait({
  who = "ralsei",
  large = false,
}: {
  who?: "ralsei" | "noelle" | "susie" | "kris" | "berdly";
  large?: boolean;
}) {
  const color = {
    ralsei: "#9adbb3",
    noelle: "#e9cfaa",
    susie: "#c5a0db",
    kris: "#a7c8f3",
    berdly: "#83bdd8",
  }[who];
  return (
    <svg
      role="img"
      aria-label={
        {
          ralsei: "Ральзей",
          noelle: "Ноэлль",
          susie: "Сьюзи",
          kris: "Крис",
          berdly: "Бёрдли",
        }[who]
      }
      className={`portrait ${large ? "large" : ""}`}
      viewBox="0 0 100 110"
      shapeRendering="crispEdges"
    >
      <path
        fill={color}
        d={
          who === "ralsei"
            ? "M20 40h60L58 4H43z"
            : who === "noelle"
              ? "M22 26h12V8h7v25h18V8h7v18h12v48H22z"
              : "M22 25h56v48H22z"
        }
      />
      <path
        fill="#e9e6e0"
        d="M25 40h50v35H25zM14 44h12v16H14zM75 44h12v16H75z"
      />
      <path
        fill="#1c2630"
        d="M32 48h14v10H32zM55 48h14v10H55zM45 51h11v3H45z"
      />
      <path fill="#d29dbb" d="M45 64h11v5H45z" />
      <path fill={color} d="M26 78h48l14 30H12z" />
      <path fill="#d68ca6" d="M25 74h50v10H25zM58 80h12v25H58z" />
      <path fill="#263a39" d="M46 88h8v5h5v6H41v-6h5z" />
      {who === "susie" && <path fill="#7f5a9b" d="M18 22h65v27H56v-9H18z" />}
      {who === "kris" && <path fill="#344473" d="M18 20h64v32H18z" />}
      {who === "berdly" && <path fill="#e3bf6f" d="M41 59h30v9H41z" />}
    </svg>
  );
}
export function Character({
  who = "ralsei",
  children,
}: {
  who?: "ralsei" | "noelle" | "susie" | "berdly";
  children: React.ReactNode;
}) {
  const { p } = useProgress();
  if (!p.settings.characters || p.settings.focus) return null;
  return (
    <aside className="character">
      <Portrait who={who} />
      <div>
        <span className="eyebrow">
          {
            {
              ralsei: "Ральзей · рядом с тобой",
              noelle: "Ноэлль · разберёмся вместе",
              susie: "Сьюзи · время практики",
              berdly: "Бёрдли · чуть глубже",
            }[who]
          }
        </span>
        <p>{children}</p>
      </div>
    </aside>
  );
}
