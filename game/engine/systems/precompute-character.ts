import fs from 'fs';
import path from 'path';
import { CharacterConfig } from '../../character/default';

const characterConfigPath = process.argv[2];
const characterName = path.basename(characterConfigPath, '.ts');

if (!characterConfigPath) {
  console.error('Please provide the path to the character config file.');
  process.exit(1);
}

const configModule = require(path.resolve(characterConfigPath));
const configName = Object.keys(configModule)[0];
const characterConfig = new configModule[configName]() as CharacterConfig;

const replacer = (key: any, value: any) => {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()),
    };
  }
  if (value.constructor.name === 'FixedPoint') {
    return {
      dataType: 'FixedPoint',
      value: value.AsNumber,
    };
  }
  return value;
};

const json = JSON.stringify(characterConfig, replacer, 2);

const outputDir = path.resolve(process.cwd(), 'public', 'characters');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, `${characterName}.json`), json);

console.log(`Successfully pre-computed character config for ${characterName}`);
