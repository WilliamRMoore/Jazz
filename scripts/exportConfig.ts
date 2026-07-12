import * as fs from 'fs';
import * as path from 'path';
import { DefaultCharacterConfig } from '../game/character/default';
import { serializeCharacterConfig } from '../game/character/configSerializer';

// 1. Serialize the default character config
const configInstance = new DefaultCharacterConfig();
const jsonOutput = serializeCharacterConfig(configInstance, 2);

// 2. Determine output path
const outDir = path.join(__dirname, '..', 'game', 'character', 'source');
const outFile = path.join(outDir, 'default.json');

// 3. Ensure the output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 4. Save the file
fs.writeFileSync(outFile, jsonOutput, 'utf-8');

console.log(`Successfully exported DefaultCharacterConfig to ${outFile}`);
