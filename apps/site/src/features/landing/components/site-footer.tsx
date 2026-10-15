import { Logo } from '../../../shared/components/logo';
import { SITE } from '../../../shared/config/site.config';
import type { LandingContent } from '../landing.types';
import { SmartLink } from './smart-link';

export function SiteFooter({ content }: { content: LandingContent }) {
  const { footer } = content;
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-bold">
            <Logo className="size-6" />
            {SITE.name}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{footer.tagline}</p>
          <p className="mt-3 text-xs text-muted-foreground">{footer.privacy}</p>
        </div>
        {footer.columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-semibold">{column.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.label}>
                  <SmartLink
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
