type TypeKind =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "function"
  | "null"
  | "undefined"
  | "unknown";

export function resolveType(value: unknown): TypeKind {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  const t = typeof value;
  if (["string", "number", "boolean", "function"].includes(t)) return t as TypeKind;
  if (t === "object") return "object";
  return "unknown";
}