# Type Safe Storage

A type-safe wrapper around React Native's Async Storage.

Using this library _all_ `AsyncStorage` API methods provide typescript type-validation for all setters and getters. Value parsing and serialization occurs internally using JSON.stringify by default,

## Getting Started

```bash
npm i -S @figliolia/type-safe-storage @react-native-async-storage/async-storage
```

## Basic Usage

```typescript
import { TypeSafeStorage } from "@figliolia/type-safe-storage";

export const MyStorage = new TypeSafeStorage<{
  user: { id: string; friendIds: string[] };
  auth: { token: string; refreshToken: string };
  settings: Record<string, boolean>;
}>(config);
```

### Configuration

A configuration can be passed to `TypeSafeStorage` to customize how
values are serialized and deserialized. When a config object is
omitted, `JSON.stringify()` and `JSON.parse()` will be used to
serialize and deserialize incoming and outgoing values from storage

```typescript
import { TypeSafeStorage } from "@figliolia/type-safe-storage";
export const MyStorage = new TypeSafeStorage<MySchema>({
  serializer: (value: any) => {
    // custom serialization logic
    // return a string
  },
  deserializer: (value: string) => {
    // custom deserialization logic
    // return a runtime value
  },
});
```

### Getters

Values can be retrieved by key and may return `null` if no value is set.

```typescript
import { MyStorage } from "./MyStorage";

const user = await MyStorage.getItem("user");
// { id: string, friendIds: string[] } | null
const someValue = await MyStorage.getItem("some-unknown-key");
// typescript type validation fails
const [user, auth] = await MyStorage.getMany(["user", "auth"]);
// user: { id: string, friendIds: string[] } | null
// auth: { token: string, refreshToken: string } | null
const [user, someUnknownKey] = await MyStorage.getMany([
  "user",
  "some-unknown-key",
]);
// typescript type validation fails
```

### Setters

```typescript
import { MyStorage } from "./MyStorage";

await MyStorage.setItem("user", { id: "123", friendIds: [1, 2, 3, 4] });
// Passes validation
await MyStorage.setItem("user", 123);
// typescript type validation fails
await MyStorage.setItem("some-unknown-key", "some-value");
// typescript type validation fails
await MyStorage.setMany([
  ["user", { id: "123", friendIds: [1, 2, 3, 4] }],
  ["auth", { token: "api-token", refreshToken: "refresh-api-token" }],
]);
// Passes validation
await MyStorage.setMany({
  user: { id: "123", friendIds: [1, 2, 3, 4] },
  auth: { token: "api-token", refreshToken: "refresh-api-token" },
});
// Passes validation
```

### V3

Version 3 of `AsyncStorage` allows for more than one instance to exist in a single application. To have more than one instance of `TypeSafeStorage` scoped to separate storage instances, you can use `createTypeSafeStorage`

```typescript
import { createTypeSafeStorage } from "@figliolia/type-safe-storage";

const myFirstDB = createTypeSafeStorage<Schema1>("myFirstDB" /* serializers */);

const mySecondDB = createTypeSafeStorage<Schema2>(
  "mySecondDB" /* serializers */,
);
```

Each database's API is identical to the examples above, but allow you to leverage multiple storage mechanisms.
