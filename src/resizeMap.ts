export function resizeImage(file: File | Blob, scaleFactor: number): Promise<Blob>{
  return new Promise<Blob>((resolve, reject) => {
    const imageURL = URL.createObjectURL(file);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if(ctx === null) return reject("Your browser does not support the HTML5 Canvas Rendering Context");

    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageURL);

      const scaledWidth = image.width * scaleFactor;
      const scaledHeight = image.height * scaleFactor;

      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
      canvas.toBlob(blob => {
        if(blob === null) return reject("Could not resize image. HTML5 canvas data could not be turned into blob");
        resolve(blob);
      }, "image/png", 1);
    }

    image.onerror = () => reject("Error resizing map. Maybe the uploaded image is invalid?");

    image.src = imageURL;
  })
}