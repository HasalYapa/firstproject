declare module 'qrcode.js' {
  export function toDataURL(text: string): Promise<string>;
  export default {
    toDataURL
  };
} 