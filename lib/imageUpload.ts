const MAX_FILE_SIZE = 12 * 1024 * 1024;

export async function prepareImageUpload(file: File, maxDimension = 640): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a valid image file.");
  if (file.size > MAX_FILE_SIZE) throw new Error("Image must be smaller than 12 MB.");

  const source = await readFile(file);
  const image = await loadImage(source);
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the image.");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/webp", 0.78);
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Image could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be processed."));
    image.src = source;
  });
}
