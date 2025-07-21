export function jsonFormat(obj: Record<string, unknown>, indent = 3): string {
  return JSON.stringify(obj, null, indent);
}
