export type MultiGetReturnValue<
  S extends Record<string, any>,
  T extends readonly Extract<keyof S, string>[]
> = {
  [I in keyof T]: [key: T[I], value: S[T[I]] | null];
};

export type InputTuples<S extends Record<string, any>> = [
  key: Extract<keyof S, string>,
  value: S[Extract<keyof S, string>]
][];

export type AvailableTuples<S extends Record<string, any>> = {
  [K in Extract<keyof S, string>]: [key: K, value: S[K]];
};

export type ValidatedTuples<
  S extends Record<string, any>,
  K extends InputTuples<S>
> = {
  [I in keyof K]: AvailableTuples<S>[K[I][0]];
};

export type ValidatedObjectTuples<
  S extends Record<string, any>,
  K extends InputTuples<S>
> = {
  [I in keyof K]: [
    key: ExtendsObject<K[I][0], S[K[I][0]]>,
    value: ForceObjectType<S[K[I][0]]>
  ];
};

export type ExtendsObject<K extends string, V> = V extends Record<string, any>
  ? K
  : V extends any[]
  ? K
  : never;

export type ForceObjectType<T> = T extends Record<string, any>
  ? T
  : T extends any[]
  ? T
  : never;
