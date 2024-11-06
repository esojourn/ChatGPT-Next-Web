export interface AttachFile {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
  date: number; // timestamp
  size?: number;
}
