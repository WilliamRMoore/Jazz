import { hydrateCharacterConfig } from './configSerializer';
import { CharacterConfig } from './shared';

async function InitConfig(uri: string) {
  // read jso file and hydrate a character config object from it
  // return character config object
  const res = await fetch(uri);
  if (!res.ok) {
    throw new Error(`Failed to fetch character config from ${uri}`);
  }
  const jsonString = await res.text();

  return hydrateCharacterConfig(jsonString);
}

export class CharacterRepo {
  private readonly characters: Map<string, CharacterConfig> = new Map();

  public async Load(characterURI: string) {
    let cc: CharacterConfig;
    try {
      cc = await InitConfig(characterURI);
      this.characters.set(cc.Name, cc);
    } catch (e) {
      console.error('FAILED TO LOAD CHARACTER JSON');
      console.error(e);
    }
  }

  public GetCharacterConfig(name: string): CharacterConfig | undefined {
    return this.characters.get(name);
  }
}
