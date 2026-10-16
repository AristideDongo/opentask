import type { LandingContent } from '../landing.types';

export function ValuesSection({ content }: { content: LandingContent }) {
  return (
    <section aria-labelledby="values-title" className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 id="values-title" className="sr-only">
          {content.values.title}
        </h2>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {content.values.items.map((item, index) => (
            <li key={item.title}>
              <span
                aria-hidden
                className="mb-3 block h-1 w-10 rounded-full"
                style={{ backgroundColor: `var(--brand-${index * 2 + 1})` }}
              />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
