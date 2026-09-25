export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const data = r.result as string;
      const i = data.indexOf(",");
      resolve(i >= 0 ? data.slice(i + 1) : data);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export function approxBytesFromBase64(b64: string): number {
  return Math.round((b64.length * 3) / 4);
}
