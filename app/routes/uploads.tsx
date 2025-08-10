import type { Route } from "./+types/uploads";

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const key = searchParams.get("key") || "";

  const object = await context.cloudflare.env.BUCKET.get(key, {});

  if (object === null) {
    return new Response("Object Not Found", { status: 404 });
  }

  const aWeek = 60 * 60 * 24 * 7;

  // Create response headers, setting the content type and ETag for caching
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", `public, max-age=${aWeek}, s-maxage=${aWeek}`);

  return new Response(object.body, {
    headers,
  });
}
