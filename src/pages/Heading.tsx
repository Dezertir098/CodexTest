export function Heading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {children && <p className="muted">{children}</p>}
    </header>
  );
}
