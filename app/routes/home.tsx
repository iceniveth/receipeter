import extractImageContent from "~/lib/extractImageContent";
import type { Route } from "./+types/home";
import { Form, useNavigation } from "react-router";
import doSomethingFromVertexAI from "~/lib/vertex";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return null;
  }

  await context.cloudflare.env.BUCKET.put(file.name, file);
  const object = await context.cloudflare.env.BUCKET.get(file.name);

  const aiResponse = object
    ? await extractImageContent(context.cloudflare.env.AI, object)
    : null;

  return {
    object,
    aiResponse,
  };
}

export async function loader({ context }: Route.LoaderArgs) {
  await doSomethingFromVertexAI(context.cloudflare.env.GCP_API_KEY);

  return {
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
  };
}

export default function Home({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <div className="w-100 m-auto my-4">
        {actionData?.object && (
          <img src={`/uploads?key=${actionData.object.key}`} />
        )}

        {actionData?.aiResponse && (
          <>
            {actionData?.aiResponse.isReceipt ? (
              <p>is a receipt</p>
            ) : (
              <p>is not a receipt</p>
            )}

            <ul>
              <li>Date: {actionData?.aiResponse.data?.date}</li>
              <li>Category: {actionData?.aiResponse.data?.category}</li>
              <li>Total: {actionData?.aiResponse.data?.total}</li>
            </ul>
          </>
        )}

        <Form method="POST" encType="multipart/form-data">
          <div className="flex flex-col">
            <input type="file" name="file" />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </Form>
      </div>
    </>
  );
}
