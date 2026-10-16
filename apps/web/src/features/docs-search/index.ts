import { slugFromFile } from '../docs/mappers/doc-path.mapper';
import { toDocPageVM, toSearchText } from '../docs/mappers/markdown.mapper';
import { docSources } from '../docs/servers/docs.source';

export function loader() {
  const entries = docSources().map((doc) => ({
    slug: slugFromFile(doc.file),
    title: toDocPageVM(doc.file, doc.raw).title,
    text: toSearchText(doc.raw),
  }));
  return Response.json(entries);
}
