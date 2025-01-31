export interface EpubBookMetadata {
  calibre?: string;
  contributor?: {
    role: string;
    text: string;
  };
  creator?:
    | {
    'file-as'?: string;
    role: string;
    text: string;
  }
    | string;
  date?: string;
  dc?: string;
  dcterms?: string;
  description?:
    | string
    | {
    text: string;
    xmlns?: string;
  };
  identifier?: {
    scheme?: string;
    id?: string;
    text: string | number;
  }[];
  language?: string;
  meta?: {
    content: string;
    name?: string;
    property?: string;
  }[];
  opf?: string;
  publisher?: string;
  subject?: string | string[];
  title?: string | { text: string };
  xsi?: string;
  format?: string | { text: string };
  rights?: string;
  type?: string;
}

export interface Metadata {
  [key: string]: unknown;
}

export interface EpubManifestItem {
  '@_id': string;
  '@_href': string;
  '@_media-type': string;
}

export interface ManifestItem {
  id: string;
  href: string;
  mediaType: string;
}
