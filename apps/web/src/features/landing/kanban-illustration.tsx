const COLUMNS = [
  {
    name: 'À faire',
    cards: [
      { w: 'w-3/4', tag: 'bg-chart-2' },
      { w: 'w-2/3', tag: 'bg-chart-3' },
    ],
  },
  {
    name: 'En cours',
    cards: [
      { w: 'w-4/5', tag: 'bg-chart-1' },
      { w: 'w-1/2', tag: 'bg-chart-4' },
      { w: 'w-2/3', tag: 'bg-chart-2' },
    ],
  },
  { name: 'Terminé', cards: [{ w: 'w-3/5', tag: 'bg-chart-5' }] },
];

export function KanbanIllustration({ label }: { label: string }) {
  return (
    <figure
      role="img"
      aria-label={label}
      className="rounded-xl border border-border bg-card p-4 shadow-xl shadow-primary/5"
    >
      <div aria-hidden className="mb-4 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="ml-3 h-2.5 w-32 rounded-full bg-muted" />
      </div>
      <div aria-hidden className="grid grid-cols-3 gap-3">
        {COLUMNS.map((column) => (
          <div key={column.name} className="space-y-2 rounded-lg bg-muted p-2">
            <span className="block h-2.5 w-16 rounded-full bg-muted-foreground/30" />
            {column.cards.map((card, index) => (
              <div key={index} className="space-y-2 rounded-md border border-border bg-card p-2.5">
                <span className={`block h-1.5 w-8 rounded-full ${card.tag}`} />
                <span className={`block h-2 rounded-full bg-foreground/15 ${card.w}`} />
                <span className="block h-2 w-1/3 rounded-full bg-foreground/10" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </figure>
  );
}
