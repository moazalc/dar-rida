/**
 * Payload gives upload URLs with the site's address in front
 * ("http://…/api/media/file/x.jpg"). The site serves them itself, so keep just
 * the path: next/image then treats them as local files.
 */
export function mediaPath(url: string): string {
  if (!/^https?:\/\//.test(url)) return url;
  const { pathname, search } = new URL(url);
  return pathname + search;
}
