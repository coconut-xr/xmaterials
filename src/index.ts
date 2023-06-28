export type Constructor<T> = new (...args: any[]) => T;
export type FirstConstructorParameter<T extends new (...args: any[]) => any> = T extends new (
  property: infer P,
  ...args: any[]
) => any
  ? P
  : never;
export type InstanceOf<T extends Constructor<any>> = T extends Constructor<infer C> ? C : never;

export * from "./border.js";
export * from "./fade.js";
export * from "./cursor.js";
export * from "./highlight.js";
