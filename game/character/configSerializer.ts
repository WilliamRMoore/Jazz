import { CharacterConfig } from './shared';

/**
 * Serializes a CharacterConfig object into a JSON string.
 * Safely handles ES6 Maps which are ignored by standard JSON.stringify.
 */
export function serializeCharacterConfig(config: CharacterConfig): string {
  return JSON.stringify(config, mapReplacer);
}

/**
 * Hydrates a CharacterConfig object from a JSON string.
 * Restores ES6 Maps to their proper prototype.
 */
export function hydrateCharacterConfig(jsonString: string): CharacterConfig {
  return JSON.parse(jsonString, mapReviver) as CharacterConfig;
}

// Custom replacer to convert Map to a recognizable JSON structure
function mapReplacer(key: string, value: any) {
  if (value instanceof Map) {
    return {
      __dataType: 'Map',
      value: Array.from(value.entries()),
    };
  }
  return value;
}

// Custom reviver to restore the recognizable JSON structure back into a Map
function mapReviver(key: string, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.__dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}
