import type { Route } from "./+types/uploads";

export async function loader({ context }: Route.LoaderArgs) {
  const object = await context.cloudflare.env.BUCKET.get("UMID.png", {});

  if (object === null) {
    return new Response("Object Not Found", { status: 404 });
  }

  // Create response headers, setting the content type and ETag for caching
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);

  return new Response(object.body, {
    headers,
  });
}
