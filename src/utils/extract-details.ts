export const extractTitle = (title: string | { text: string; id?: string } | { text: string }[]): string => {
  if (typeof title === 'string') {
    return title;
  }

  if (Array.isArray(title)) {
    return title.length > 0 ? title[0].text : '';
  }

  return title.text || '';
};



export const extractCreator = (creator: string | { text: string; id?: string } | { text: string }[]): string => {
  if (typeof creator === 'string') {
    return creator;
  }

  if (Array.isArray(creator)) {
    return creator.length > 0 ? creator[0].text : '';
  }

  return creator.text || '';
};

