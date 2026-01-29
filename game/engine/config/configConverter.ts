export function objectToMap(
  obj: Record<string, any>,
  prefix = '',
  map: Map<string, number | string> = new Map(),
): Map<string, number | string> {
  // Iterate over each key in the object
  for (const key in obj) {
    // Ensure we are only iterating over the object's own properties
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Create the new key by appending the current key to the prefix
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // If the value is another object, recurse into it, passing the new key prefix
        objectToMap(value, newKey, map);
      } else if (typeof value === 'number' || typeof value === 'string') {
        // If the value is a number or string, add it to the map
        map.set(newKey, value);
      }
      // Other types (boolean, array, null, etc.) are ignored as per your request.
    }
  }
  return map;
}
