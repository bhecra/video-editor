import { RENDER_SERVER_URL } from "./config";

// Media picked from the machine is uploaded to the render server, which hands
// back a URL. Both the preview player and the renderer can fetch that URL —
// unlike a blob: URL, which only exists in this tab, or a base64 data URL,
// which would have to travel inside every render payload.
export const uploadMedia = async (file: File): Promise<string> => {
  let response: Response;

  try {
    response = await fetch(
      `${RENDER_SERVER_URL}/api/upload?name=${encodeURIComponent(file.name)}`,
      {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      },
    );
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor de render. Inícialo con «npm run render-server».",
    );
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(
      detail?.error ?? `El servidor de render respondió ${response.status}.`,
    );
  }

  const { url } = (await response.json()) as { url: string };
  return url;
};
