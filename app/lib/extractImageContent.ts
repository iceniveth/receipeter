export default async function extractImageContent(
  AI: Ai<AiModels>,
  object: R2ObjectBody,
) {
  const base64String = await arrayBufferToBase64(await object.arrayBuffer());
  const imageDataUri = `data:${object.httpMetadata?.contentType};base64,${base64String}`;

  const response = await AI.run(
    "@cf/google/gemma-3-12b-it",
    {
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
You are an expert at understanding receipts.

## Tasks
1.  You will be given a data and you have to analyze whether it is a receipt or not.
    If it is not a receipt, you immediately stop on this process and return a JSON: { "isReceipt": false, "data": null }

2.  You analyze the contents of a receipt and extract relevant information:
    - The date of purchase. Please analyze carefully because there are so many dates in a receipt. Most uses the Philippine date format.
    - The total amount spent.
    - The category of the receipt whether it is "Food", "Medical", or "Fuel".

3.  After you have extract the relevant information you return a JSON object example: 
    { "isReceipt": true, "data":  { "date": "2023-03-15", "total": 29.99, "category": "Food" } }

## Constraints
- Do not use any markdown formatting, code fences, or conversational text.
- Return only the JSON object.
          `,
        },
        {
          role: "user",
          content: [{ type: "image_url", image_url: { url: imageDataUri } }],
        },
      ],
    },
    { gateway: { id: "receipeter-ai-gateway" } },
  );

  console.log(response.response);

  return JSON.parse(response.response) as {
    isReceipt: boolean;
    data: {
      date: string;
      total: number;
      category: string;
    } | null;
  };
}

// Utility function to convert an ArrayBuffer to a Base64-encoded string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
