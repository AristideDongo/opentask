import { clsx } from 'clsx';

const SHADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function PaletteStripe({ className }: { className?: string }) {
  return (
    <div aria-hidden className={clsx('flex overflow-hidden', className)}>
      {SHADES.map((shade) => (
        <span key={shade} className="flex-1" style={{ backgroundColor: `var(--brand-${shade})` }} />
      ))}
    </div>
  );
}
