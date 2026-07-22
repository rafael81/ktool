const LEGACY_HOST = "k-document-tool.pages.dev";
const CANONICAL_ORIGIN = "https://kdoctool.kr";

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === LEGACY_HOST) {
    return Response.redirect(`${CANONICAL_ORIGIN}${url.pathname}${url.search}`, 301);
  }

  return context.next();
}
