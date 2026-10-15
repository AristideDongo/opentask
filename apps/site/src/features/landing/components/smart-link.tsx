import type { ReactNode } from 'react';
import { ExternalLink } from '../../../shared/components/external-link';
import type { SiteLinkKey } from '../../../shared/config/site.config';
import { isExternal, resolveHref } from '../../../shared/utils/href';

export function SmartLink({
  href,
  className,
  children,
}: {
  href: SiteLinkKey | `#${string}`;
  className?: string;
  children: ReactNode;
}) {
  const target = resolveHref(href);
  if (isExternal(target)) {
    return (
      <ExternalLink href={target} className={className}>
        {children}
      </ExternalLink>
    );
  }
  return (
    <a href={target} className={className}>
      {children}
    </a>
  );
}
