/**
 * Value Parser
 *
 * The `TypeSafeStorage` class allows for passing strictly typed
 * values through it's API. This class provides the necessary
 * utilities required for converting unknown types to and from
 * strings
 */
export class ValueParser {
  /**
   * Returns the input value stringified. For inputs that
   * are already strings, the input value is returned
   */
  protected stringify(value: any) {
    if (typeof value === "string") {
      return value;
    }
    return JSON.stringify(value);
  }

  /**
   * Returns a parsed input value. The input is assumed to be
   * any stringified JavaScript primitive or null
   */
  protected parseValue(value: any) {
    if (typeof value === "string") {
      if (this.isNumber(value)) {
        return parseFloat(value);
      }
      if (this.isJSON(value)) {
        return JSON.parse(value);
      }
      return value;
    }
    return value;
  }

  /**
   * Returns true if the input value is a stringified number
   */
  protected isNumber(value: string) {
    const parsed = parseFloat(value);
    // @ts-ignore
    if (!isNaN(parsed) && parsed == value) {
      return true;
    }
    return false;
  }

  /**
   * Returns true if the input value is a stringified array
   * or object
   */
  protected isJSON(value: string) {
    const first = value[0];
    const last = value[value.length - 1];
    if (first === "{" && last === "}") {
      return true;
    }
    if (first === "[" && last === "]") {
      return true;
    }
    return false;
  }

  /**
   * Throws an error if the input value is falsy or its type
   * is not an object
   */
  protected validateJSON(value: any) {
    if (!value || typeof value !== "object") {
      throw new Error("AsyncStorage.mergeItem expects a JSON valid value");
    }
  }
}
