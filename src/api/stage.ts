export async function getBackgroundImage(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = '/download.svg';

    image.onload = () => resolve(image);
    image.onerror = () => reject(image);
  });
}
