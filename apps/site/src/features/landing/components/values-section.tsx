import type { LandingContent } from '../landing.types';

export function ValuesSection({ content }: { content: LandingContent }) {
  return (
    <section aria-labelledby="values-title" className="border-y border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="values-title" className="sr-only">
          {content.values.title}
        </h2>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {content.values.items.map((item) => (
            <li key={item.title}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
