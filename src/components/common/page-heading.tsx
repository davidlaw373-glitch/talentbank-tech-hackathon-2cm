type PageHeadingProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
};

/**
 * Standard page heading slot — keeps every role dashboard consistent.
 * Already in the original file imports across the project; built so the
 * employer dashboard, university dashboard, verification pipeline, and
 * dispute-resolution pages can resolve.
 *
 * Uses semantic typography per AGENTS.md. Layout-only Tailwind.
 */
export function PageHeading({ title, description, action, eyebrow }: PageHeadingProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1>{title}</h1>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </header>
  );
}
