import type { AsyncStorage } from "@react-native-async-storage/async-storage";

export type GetManyResult<
  S extends Record<string, any>,
  T extends readonly Extract<keyof S, string>[],
> = {
  [K in T[number]]: S[K] | null;
};

export type InputTuples<S extends Record<string, any>> = [
  key: Extract<keyof S, string>,
  value: S[Extract<keyof S, string>],
][];

export type AvailableTuples<S extends Record<string, any>> = {
  [K in Extract<keyof S, string>]: [key: K, value: S[K]];
};

export type ValidatedTuples<
  S extends Record<string, any>,
  K extends InputTuples<S>,
> = {
  [I in keyof K]: AvailableTuples<S>[K[I][0]];
};

export interface SerializationOptions<T extends Record<string, any>> {
  storage?: AsyncStorage;
  serializer?: (value: any) => string;
  deserializer?: <K extends Extract<keyof T, string>>(value: string) => T[K];
}
