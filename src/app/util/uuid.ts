// This is AI-generated lol. CBA to make a function for this and I didn't want to import a new package.

export default function uuid(): string {
  let d = new Date().getTime();

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);

    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}