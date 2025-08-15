import extractImageContent from "~/lib/extractImageContent";
import type { Route } from "./+types/home";
import { Form, useNavigation } from "react-router";
import { drizzle } from "drizzle-orm/d1";
import { useEffect, useRef } from "react";

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
  const db = drizzle(context.cloudflare.env.DB);
  // await db.select().from()

  return {
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
  };
}

export default function Home({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const width = 320; // We will scale the photo width to this
  let height = 0; // This will be computed based on the input stream

  let streaming = false;

  const videoRef = useRef<HTMLVideoElement>(null);

  // https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos
  useEffect(() => {}, []);

  return (
    <>
      <div className="w-100 m-auto my-4">
        {actionData?.object && (
          <img src={`/uploads?key=${actionData.object.key}`} />
        )}

        <canvas id="canvas"></canvas>
        <div className="camera">
          <video id="video">Video stream not available.</video>
          <button
            id="start-button"
            className="btn"
            onClick={() => {
              navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                  videoRef?.current?.srcObject = stream;
                  video.play();
                })
                .catch((err) => {
                  console.error(`An error occurred: ${err}`);
                });
            }}
          >
            Capture photo
          </button>
        </div>

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
