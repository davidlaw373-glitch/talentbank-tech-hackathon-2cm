export function PageHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <section className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><h1>{title}</h1><p>{description}</p></div>{action}</section>;
}
