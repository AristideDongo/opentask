import { clsx } from 'clsx';
import { Link, type LinkProps } from 'react-router';

export function TextLink({ className, ...props }: LinkProps) {
  return (
    <Link
      {...props}
      className={clsx('font-semibold text-accent underline-offset-4 hover:underline', className)}
    />
  );
}
