# Type Safe Storage
A type-safe wrapper around React Native's Async Storage that re-implements the entire API. 

Using this library *all* `AsyncStorage` API methods provide typescript type-validation for all setters and merges, as well as typed-return values for all getters.

## Getting Started
```bash
npm i -S @figliolia/type-safe-storage
# or
yarn add @figliolia/type-safe-storage
```

## Basic Usage
```typescript
import { TypeSafeStorage } from "@figliolia/type-safe-storage";

export const AsyncStorage = new TypeSafeStorage<{
  userID: number;
  username: string;
  friendsList: number[];
  connections: Record<string, number>;
}>();

const userID = await AsyncStorage.getItem("userID");
// number | null

const unknown = await AsyncStorage.getItem("unknown-key");
// Fails typescript validation

const [userID, friendsList] = await AsyncStorage.multiGet([
  "userID",
  "friendsList"
]);
// [number | null, number[] | null]
const [userID, unknown] = await AsyncStorage.multiGet([
  "userID",
  "unknown"
]);
// Fails typescript validation

```
### API
#### `clear`

Erases *all* `AsyncStorage` for all clients, libraries, etc. You probably don't want to call this; use `removeItem` or `multiRemove` to clear only your app's keys.

#### `flushGetRequests`
Flushes any pending requests using a single batch call to get the data

#### `getAllKeys`

Gets *all* keys known to your app; for all callers, libraries, etc.

#### `getItem`

Fetches an item for a `key` and invokes a callback upon completion.

#### `mergeItem`

Merges an existing `key` value with an input value, assuming both values are valid JSON.

#### `multiGet`

This allows you to batch the fetching of items given an array of `key` inputs. Your callback will be invoked with an array of corresponding
key-value pairs found.

#### `multiMerge`

Batch operation to merge in existing and new values for a given set of keys. This assumes that the values are valid JSON.

#### `multiRemove`

Deletes each of the keys provided to the method

#### `multiSet`

Use this as a batch operation for storing multiple key-value pairs. When
the operation completes you'll get a single callback with any errors.

#### `removeItem`

Removes an item for a `key` and invokes the provided callback upon completion.


#### `setItem`

Sets the value for a `key` and invokes the provided callback upon completion.
