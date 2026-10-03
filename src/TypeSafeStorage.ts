import AsyncStorage, {
  type AsyncStorage as AsyncStorageType,
} from "@react-native-async-storage/async-storage";

import type {
  GetManyResult,
  InputTuples,
  SerializationOptions,
  ValidatedTuples,
} from "./types";

/**
 * ## Type Safe Storage
 *
 * A re-implementation of the `AsyncStorage` API that implements
 * type-safe getters, setters, and merges.
 *
 * ### Initialization
 * ```typescript
 * import { TypeSafeStorage } from "@figliolia/type-safe-storage";
 *
 * export const MyStorage = new TypeSafeStorage<{
 *   user: { id: string, friendIds: string[] },
 *   auth: { token: string, refreshToken: string },
 *   settings: Record<string, boolean>;
 * }>(config);
 * ```
 * ### Configuration
 * A configuration can be passed to `TypeSafeStorage` to customize how
 * values are serialized and deserialized. When a config object is
 * omitted, `JSON.stringify()` and `JSON.parse()` will be used to
 * serialize and deserialize incoming and outgoing values from storage
 * ```typescript
 * import { TypeSafeStorage } from "@figliolia/type-safe-storage";
 *
 * export const MyStorage = new TypeSafeStorage<MySchema>({
 *   serializer: (value: any) => {
 *     // custom serialization logic
 *     // return a string
 *   },
 *   deserializer: (value: string) => {
 *     // custom deserialization logic
 *     // return a runtime value
 *   },
 * });
 * ```
 *
 * ### Getters
 * ```typescript
 * import { MyStorage } from "./MyStorage";
 *
 * const user = await MyStorage.getItem("user");
 * // { id: string, friendIds: string[] } | null
 * const someValue = await MyStorage.getItem("some-unknown-key");
 * // typescript type validation fails
 * const [user, auth] = await MyStorage.getMany(["user", "auth"]);
 * // user: { id: string, friendIds: string[] } | null
 * // auth: { token: string, refreshToken: string } | null
 * const [user, someUnknownKey] = await MyStorage.getMany(["user", "some-unknown-key"]);
 * // typescript type validation fails
 * ```
 * ### Setters
 * ```typescript
 * import { MyStorage } from "./MyStorage";
 *
 * await MyStorage.setItem("user", { id: "123", friendIds: [1, 2, 3, 4] });
 * // Passes validation
 * await MyStorage.setItem("user", 123);
 * // typescript type validation fails
 * await MyStorage.setItem("some-unknown-key", "some-value");
 * // typescript type validation fails
 * await MyStorage.setMany([
 *   ["user", { id: "123", friendIds: [1, 2, 3, 4] }],
 *   ["auth", { token: "api-token", refreshToken: "refresh-api-token" }]
 * ]);
 * // Passes validation
 * await MyStorage.setMany({
 *   user: { id: "123", friendIds: [1, 2, 3, 4] },
 *   auth: { token: "api-token", refreshToken: "refresh-api-token" }
 * });
 * // Passes validation
 * ```
 */
export class TypeSafeStorage<T extends Record<string, any>> {
  private readonly storage: AsyncStorageType;
  private readonly options?: SerializationOptions<T>;
  constructor(options?: SerializationOptions<T>) {
    this.options = options;
    this.storage = options?.storage ?? AsyncStorage;
  }
  /**
   * Clears all data from the storage.
   * @returns A Promise that resolves once the storage has been cleared.
   * @throws {@link AsyncStorageError} if clearing fails.
   */
  public clear() {
    return this.storage.clear();
  }

  /**
   * Retrieves all keys currently stored.
   * @returns A Promise resolving to an array of keys.
   * @throws {@link AsyncStorageError} if retrieval fails.
   */
  public getAllKeys() {
    return this.storage.getAllKeys() as Promise<readonly (keyof T)[]>;
  }

  /**
   * Retrieves a single item from storage.
   * @param key - The key identifying the stored value.
   * @returns A Promise resolving to the stored value,
   *          or `null` if the key does not exist.
   * @throws {@link AsyncStorageError}
   */
  public async getItem<K extends Extract<keyof T, string>>(key: K) {
    const value = await this.storage.getItem(key);
    return this.parseValue(value) as T[K] | null;
  }

  /**
   * Retrieves multiple items from storage.
   * @param keys - An array of keys to retrieve.
   * @returns A Promise resolving to an object mapping each key to its stored value,
   *          or `null` for keys that do not exist.
   * @throws {@link AsyncStorageError} if retrieval fails.
   */
  public async getMany<K extends readonly Extract<keyof T, string>[]>(keys: K) {
    const values = await this.storage.getMany(keys as unknown as string[]);
    for (const key in values) {
      values[key] = this.parseValue(values[key]);
    }
    return values as GetManyResult<T, K>;
  }

  /**
   * Removes multiple items from storage.
   * @param keys - An array of keys to remove.
   * @returns A Promise that resolves once all keys have been removed.
   * @throws {@link AsyncStorageError} if removal fails.
   */
  public multiRemove(keys: Extract<keyof T, string>[]) {
    return this.storage.removeMany(keys);
  }

  /**
   * Stores multiple items in storage.
   * @param keyValuePairs - An object or tuple array containing key-value pairs to store.
   * @returns A Promise that resolves once all items have been written.
   * @throws {@link AsyncStorageError} if writing fails.
   */
  public setMany<K extends InputTuples<T>, V extends ValidatedTuples<T, K>>(
    keyValuePairs: V | Partial<T>,
  ) {
    let input: Record<string, string>;
    if (Array.isArray(keyValuePairs)) {
      input = keyValuePairs.reduce<Record<string, string>>((acc, next) => {
        const [key, value] = next;
        acc[key] = this.serialize(value);
        return acc;
      }, {});
    } else {
      input = Object.keys(keyValuePairs).reduce<Record<string, string>>(
        (acc, next) => {
          acc[next] = this.serialize(keyValuePairs[next]);
          return acc;
        },
        {},
      );
    }
    return this.storage.setMany(input);
  }

  /**
   * Removes an item from storage.
   * @param key - The key of the item to remove.
   * @returns A Promise that resolves once the key has been removed.
   * @throws {@link AsyncStorageError} if removal fails.
   */
  public removeItem<K extends Extract<keyof T, string>>(key: K) {
    return this.storage.removeItem(key);
  }

  /**
   * Stores or updates an item in storage.
   * @param key - The key under which the value will be stored.
   * @param value - The value to store.
   * @returns A Promise that resolves once the value has been written.
   * @throws {@link AsyncStorageError} if writing fails.
   */
  public setItem<K extends Extract<keyof T, string>>(key: K, value: T[K]) {
    return this.storage.setItem(key, this.serialize(value));
  }

  /**
   * Serializes storage values to string using the specified serializer
   * or JSON.stringify
   */
  private serialize(value: any) {
    if (this.options?.serializer) {
      return this.options.serializer(value);
    }
    if (typeof value === "string") {
      return value;
    }
    return JSON.stringify(value);
  }

  /**
   * Attempts to parse incoming values via JSON.parse or the configured deserializer.
   * returns the input if any errors occur
   */
  private parseValue(value: any) {
    if (this.options?.deserializer) {
      return this.options.deserializer(value);
    }
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
