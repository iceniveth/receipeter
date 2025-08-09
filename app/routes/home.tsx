import type { Route } from "./+types/home";
import { Form } from "react-router";
import { S3Client, GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

  const putResponse = await context.cloudflare.env.BUCKET.put(file.name, file);

  console.log(file);
  console.log(putResponse);

  // Process the file upload
  return null;
}

export async function loader({ context }: Route.LoaderArgs) {
  // displaying image: https://thethirdswan.com/blog/how-to-display-images-stored-in-cloudflare-r2
  // https://developers.cloudflare.com/r2/api/tokens/

  const object = await context.cloudflare.env.BUCKET.get("blank.png", {});
  console.log();

  const { env } = context.cloudflare;

  // const s3 = new S3Client({
  //   region: "auto",
  //   endpoint: env.R2_S3_ENDPOINT,
  //   credentials: {
  //     accessKeyId: env.ACCESS_KEY_ID,
  //     secretAccessKey: env.SECRET_ACCESS_KEY,
  //   },
  // });

  // const cmd = new GetObjectCommand({ Bucket: "receipeter", Key: "blank.png" });
  // const url = await getSignedUrl(s3, cmd, {
  //   expiresIn: 3600,
  // });

  return {
    url: "",
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
  };
}

export default async function Home({ loaderData }: Route.ComponentProps) {
  // console.log({ url });
  return (
    <>
      <div className="w-100 m-auto my-4">
        <Form method="POST" encType="multipart/form-data">
          <div className="flex flex-col">
            <input type="file" name="file" />
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Upload
            </button>
          </div>
        </Form>
      </div>
    </>
  );
}
