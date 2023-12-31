import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  Callback,
  CallbackWithResult,
  MultiCallback,
  MultiGetCallback,
} from "@react-native-async-storage/async-storage/lib/typescript/types";
import type {
  ExtendsObject,
  InputTuples,
  MultiGetReturnValue,
  ValidatedObjectTuples,
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
 *   userID: string;
 *   connections: string[];
 *   settings: Record<string, boolean>;
 * }>();
 * ```
 * ### Getters
 * ```typescript
 * import { MyStorage } from "./MyStorage";
 *
 * const userID = await MyStorage.getItem("userID");
 * // string | null
 * const someValue = await MyStorage.getItem("some-unknown-key");
 * // typescript type validation fails
 * const [userID, connections] = await MyStorage.multiGet(["userID", "connections"]);
 * // userID: string | null
 * // connections: string[] | null
 * const [userID, someUnknownKey] = await MyStorage.multiGet(["userID", "some-unknown-key"]);
 * // typescript type validation fails
 * ```
 * ### Setters
 * ```typescript
 * import { MyStorage } from "./MyStorage";
 *
 * await MyStorage.setItem("userID", "123");
 * // Passes validation
 * await MyStorage.setItem("userID", 123);
 * // typescript type validation fails
 * await MyStorage.setItem("some-unknown-key", "some-value");
 * // typescript type validation fails
 * await MyStorage.multiSet([
 *   ["userID", "123"],
 *   ["connections", ["1", "2", "3"]]
 * ]);
 * // Passes validation
 * ```
 */
export class TypeSafeStorage<T extends Record<string, any>> {
  /**
   * Erases *all* `AsyncStorage` for all clients, libraries, etc. You probably
   * don't want to call this; use `removeItem` or `multiRemove` to clear only
   * your app's keys.
   *
   * See https://react-native-async-storage.github.io/async-storage/docs/api#clear
   */
  public clear(callback?: Callback) {
    return AsyncStorage.clear(callback);
  }

  /**
   * Flushes any pending requests using a single batch call to get the data.
   *
   * See https://react-native-async-storage.github.io/async-storage/docs/api#flushgetrequests
   * */
  public flushGetRequests() {
    return AsyncStorage.flushGetRequests();
  }

  /**
   * Gets *all* keys known to your app; for all callers, libraries, etc.
   *
   * See https://react-native-async-storage.github.io/async-storage/docs/api#getallkeys
   */
  public getAllKeys(
    callback?: CallbackWithResult<readonly (keyof T)[]> | undefined
  ) {
    return AsyncStorage.getAllKeys(callback) as Promise<readonly (keyof T)[]>;
  }
  /**
   * Fetches an item for a `key` and invokes a callback upon completion.
   *
   * See https://react-native-async-storage.github.io/async-storage/docs/api#getitem
   */
  public async getItem<K extends Extract<keyof T, string>>(
    key: K,
    callback?: CallbackWithResult<string> | undefined
  ) {
    const value = await AsyncStorage.getItem(key, callback);
    return (value === null ? null : JSON.parse(value)) as T[K] | null;
  }

  /**
   * Merges an existing `key` value with an input value, assuming both values
   * are valid JSON.
   */
  public async mergeItem<K extends Extract<keyof T, string>, V extends T[K]>(
    key: ExtendsObject<K, V>,
    value: T[K],
    callback?: Callback | undefined
  ) {
    return AsyncStorage.mergeItem(key, JSON.stringify(value), callback);
  }

  /**
   * This allows you to batch the fetching of items given an array of `key`
   * inputs. Your callback will be invoked with an array of corresponding
   * key-value pairs found.
   */
  public async multiGet<K extends readonly Extract<keyof T, string>[]>(
    keys: K,
    callback?: MultiGetCallback
  ) {
    const values = await AsyncStorage.multiGet(keys, callback);
    return values.map(([key, value]) => [
      key,
      value === null ? null : JSON.parse(value),
    ]) as MultiGetReturnValue<T, K>;
  }

  /**
   * Batch operation to merge in existing and new values for a given set of
   * keys. This assumes that the values are valid JSON.
   */
  public multiMerge<
    K extends InputTuples<T>,
    V extends ValidatedObjectTuples<T, K>
  >(keyValuePairs: V, callback?: MultiCallback) {
    return AsyncStorage.multiMerge(
      keyValuePairs.map(([key, value]) => {
        return [key, this.stringify(value)];
      }),
      callback
    );
  }

  /**
   * Call this to batch the deletion of all keys in the `keys` array.
   *
   * See https://react-native-async-storage.github.io/async-storage/docs/api#multiremove
   */
  public multiRemove(
    keys: Extract<keyof T, string>[],
    callback?: MultiCallback
  ) {
    return AsyncStorage.multiRemove(keys, callback);
  }

  /**
   * Use this as a batch operation for storing multiple key-value pairs. When
   * the operation completes you'll get a single callback with any errors.
   */
  public multiSet<K extends InputTuples<T>, V extends ValidatedTuples<T, K>>(
    keyValuePairs: V,
    callback?: MultiCallback
  ) {
    return AsyncStorage.multiSet(
      keyValuePairs.map(([key, value]) => [key, this.stringify(value)]),
      callback
    );
  }

  /**
   * Removes an item for a `key` and invokes a callback upon completion.
   *
   * See https://react-native-async-storage.github.io/async-storage/docs/api#removeitem
   */
  public removeItem<K extends Extract<keyof T, string>>(
    key: K,
    callback?: Callback
  ) {
    return AsyncStorage.removeItem(key, callback);
  }

  /**
   * Sets the value for a `key` and invokes a callback upon completion.
   */
  public setItem<K extends Extract<keyof T, string>>(
    key: K,
    value: T[K],
    callback?: Callback
  ) {
    return AsyncStorage.setItem(key, this.stringify(value), callback);
  }

  /**
   * Returns the input value stringified. For inputs that
   * are already strings, the input value is returned
   */
  private stringify(value: any) {
    if (typeof value === "string") {
      return value;
    }
    return JSON.stringify(value);
  }
}
