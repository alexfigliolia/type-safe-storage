import { createAsyncStorage } from "@react-native-async-storage/async-storage/jest";

import { TypeSafeStorage } from "./TypeSafeStorage";
import type { SerializationOptions } from "./types";

/**
 * Create Type Safe Storage
 *
 * Creates a `TypeSafeStorage` instance using a v3 `AsyncStorage` instance
 *
 * ```typescript
 * import { createTypeSafeStorage } from "@figliolia/type-safe-storage";
 *
 * const myStorage = createTypeSafeStorage<MySchema>("MyDataBase");
 * ```
 */
export const createTypeSafeStorage = <T extends Record<string, any>>(
  databaseName: string,
  options?: Omit<SerializationOptions<T>, "storage">,
) => {
  const AsyncStorage = createAsyncStorage(databaseName);
  return new TypeSafeStorage({ storage: AsyncStorage, ...options });
};
