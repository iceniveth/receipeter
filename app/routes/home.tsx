import extractImageContent from "~/lib/extractImageContent";
import type { Route } from "./+types/home";
import { Form, useNavigation } from "react-router";

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
          <div className="flex flex-col gap-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Upload Receipt</legend>
              <input
                type="file"
                name="file"
                className="file-input file-input-bordered file-input-primary w-full"
                required
              />
              <label className="label text-sm opacity-70">
                Select an image of your receipt to analyze
              </label>
            </fieldset>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
            >
              {isSubmitting && <span className="loading loading-spinner" />}
              Upload
            </button>
          </div>
        </Form>
      </div>
    </>
  );
}
