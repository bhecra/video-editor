/**
 * The URL map. There are only two shapes: the gallery of examples and one
 * example open in the editor.
 */
export const GALLERY_PATH = "/video-examples";

export const examplePath = (number: number) => `${GALLERY_PATH}/${number}`;

export type Route =
  | { name: "gallery" }
  | { name: "example"; number: number }
  | { name: "not-found"; path: string };

export const parsePath = (pathname: string): Route => {
  const path = pathname.replace(/\/+$/, "") || "/";

  // "/" is not a page of its own: the gallery is the home.
  if (path === "/" || path === GALLERY_PATH) return { name: "gallery" };

  const segments = path.slice(1).split("/");
  const [base, param, ...rest] = segments;

  if (`/${base}` === GALLERY_PATH && rest.length === 0 && /^\d+$/.test(param)) {
    return { name: "example", number: Number(param) };
  }

  return { name: "not-found", path };
};
