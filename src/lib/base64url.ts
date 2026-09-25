export function base64UrlFromBytes(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlFromString(input: string): string {
  return base64UrlFromBytes(new TextEncoder().encode(input));
}

export function bytesFromBase64Url(input: string): Uint8Array {
  const padded = input + '==='.slice((input.length + 3) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function jsonFromBase64Url<T>(input: string): T {
  return JSON.parse(new TextDecoder().decode(bytesFromBase64Url(input))) as T;
}
