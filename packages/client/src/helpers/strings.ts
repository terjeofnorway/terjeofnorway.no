export const stripTags = (html: string): string => {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
};
