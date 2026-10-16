const COLUMNS = [
  {
    key: 'todo',
    cards: [
      { w: 'w-3/4', tag: 'var(--brand-3)' },
      { w: 'w-2/3', tag: 'var(--brand-1)' },
    ],
  },
  {
    key: 'doing',
    cards: [
      { w: 'w-4/5', tag: 'var(--brand-6)' },
      { w: 'w-1/2', tag: 'var(--brand-2)' },
      { w: 'w-2/3', tag: 'var(--brand-9)' },
    ],
  },
  { key: 'done', cards: [{ w: 'w-3/5', tag: 'var(--brand-5)' }] },
];

export function KanbanIllustration({ label }: { label: string }) {
  return (
    <figure
      role="img"
      aria-label={label}
      className="relative rounded-2xl border border-line bg-surface p-4 shadow-2xl shadow-[var(--brand-7)]/15"
    >
      <div aria-hidden className="mb-4 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-line" />
        <span className="size-2.5 rounded-full bg-line" />
        <span className="size-2.5 rounded-full bg-line" />
        <span className="ml-3 h-2.5 w-32 rounded-full bg-sunken" />
      </div>
      <div aria-hidden className="grid grid-cols-3 gap-3">
        {COLUMNS.map((column) => (
          <div key={column.key} className="space-y-2 rounded-lg bg-sunken p-2">
            <span className="block h-2.5 w-16 rounded-full bg-muted/30" />
            {column.cards.map((card, index) => (
              <div key={index} className="space-y-2 rounded-md border border-line bg-surface p-2.5">
                <span
                  className="block h-1.5 w-8 rounded-full"
                  style={{ backgroundColor: card.tag }}
                />
                <span className={`block h-2 rounded-full bg-ink/15 ${card.w}`} />
                <span className="block h-2 w-1/3 rounded-full bg-ink/10" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </figure>
  );
}
