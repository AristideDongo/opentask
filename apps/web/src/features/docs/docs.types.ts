export interface DocHeadingVM {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface DocPageVM {
  slug: string;
  title: string;
  description: string;
  html: string;
  headings: DocHeadingVM[];
  sourcePath: string;
}

export interface DocNavItem {
  text: string;
  slug: string;
}

export interface DocNavSection {
  title: string;
  items: DocNavItem[];
}

export interface DocSearchEntry {
  slug: string;
  title: string;
  text: string;
}
