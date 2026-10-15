import type { SiteLinkKey } from '../../shared/config/site.config';
import type { FeatureStatus, Locale } from '../../shared/types/locale.types';

export interface LinkContent {
  label: string;
  href: SiteLinkKey | `#${string}`;
}

export interface FeatureContent {
  title: string;
  body: string;
  status: FeatureStatus;
}

export interface QuestionContent {
  question: string;
  answer: string;
}

export interface LandingContent {
  locale: Locale;
  meta: { title: string; description: string };
  skipLink: string;
  nav: {
    features: string;
    selfHost: string;
    mcp: string;
    docs: string;
    github: string;
    menu: string;
    language: string;
  };
  status: Record<FeatureStatus, string>;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
    facts: string[];
    illustrationLabel: string;
  };
  values: { title: string; items: { title: string; body: string }[] };
  features: { title: string; intro: string; items: FeatureContent[] };
  selfHost: {
    title: string;
    intro: string;
    points: string[];
    responsibilities: string;
    cta: string;
    backup: string;
  };
  mcp: {
    title: string;
    intro: string;
    examples: string[];
    guarantees: string[];
    clients: { name: string; status: FeatureStatus; detail: string }[];
    cta: string;
  };
  install: {
    title: string;
    intro: string;
    prerequisites: string[];
    copy: string;
    copied: string;
    cta: string;
  };
  community: { title: string; intro: string; links: LinkContent[] };
  faq: { title: string; items: QuestionContent[] };
  footer: { tagline: string; privacy: string; columns: { title: string; links: LinkContent[] }[] };
}
