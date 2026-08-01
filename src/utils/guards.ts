export function isFn<T>(a: unknown): a is (arg: T) => boolean {
  return typeof a === "function";
}
