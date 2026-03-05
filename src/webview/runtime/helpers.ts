export function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function injectBaseTag(html: string, baseUrl: string): string {
  if (/<base\s/i.test(html)) {
    return html;
  }

  const baseTag = `<base href="${baseUrl}/">`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}${baseTag}`);
  }

  return `<head>${baseTag}</head>${html}`;
}
