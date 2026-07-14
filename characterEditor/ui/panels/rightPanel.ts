import { CharacterConfig } from '../../../game/character/shared';
import { sections } from './leftPanel';

export class RightPanel {
  private container: HTMLElement;
  private currentConfig: CharacterConfig;
  private updateCallback: (config: CharacterConfig) => void;

  constructor(
    containerId: string,
    initialConfig: CharacterConfig,
    onUpdate: (config: CharacterConfig) => void
  ) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Could not find container ${containerId}`);
    this.container = el;
    this.currentConfig = initialConfig;
    this.updateCallback = onUpdate;
  }

  public updateConfig(config: CharacterConfig) {
    this.currentConfig = config;
  }

  public renderSection(sectionName: string) {
    this.container.innerHTML = ''; // clear

    const title = document.createElement('h2');
    title.innerText = sectionName;
    title.style.marginTop = '0';
    this.container.appendChild(title);

    const sectionMap = sections.get(sectionName);
    if (!sectionMap) {
      this.container.innerHTML += '<p>Section not found.</p>';
      return;
    }

    // Iterate over the fields in the section and generate form inputs
    sectionMap.forEach((traitType, key) => {
      const fieldContainer = document.createElement('div');
      fieldContainer.className = 'form-group';

      const label = document.createElement('label');
      label.innerText = key as string;
      fieldContainer.appendChild(label);

      switch (traitType) {
        case 'num':
          fieldContainer.appendChild(this.createNumInput(key));
          break;
        case 'string':
          fieldContainer.appendChild(this.createStringInput(key));
          break;
        case 'flatvec':
          fieldContainer.appendChild(this.createFlatVecInput(key));
          fieldContainer.className = 'form-group flatvec-group';
          break;
        case 'ecbshape':
        case 'hurtcapsule':
        case 'attack':
        case 'grab':
        case 'throw':
          fieldContainer.appendChild(this.createComingSoonPlaceholder(traitType));
          break;
        default:
          fieldContainer.innerHTML += `<p>Unknown trait type: ${traitType}</p>`;
      }

      this.container.appendChild(fieldContainer);
    });
  }

  private createNumInput(key: keyof CharacterConfig): HTMLElement {
    const input = document.createElement('input');
    input.type = 'number';
    // @ts-ignore
    input.value = this.currentConfig[key] !== undefined ? this.currentConfig[key].toString() : '0';
    input.addEventListener('change', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value) || 0;
      // @ts-ignore
      this.currentConfig[key] = val;
      this.updateCallback(this.currentConfig);
    });
    return input;
  }

  private createStringInput(key: keyof CharacterConfig): HTMLElement {
    const input = document.createElement('input');
    input.type = 'text';
    // @ts-ignore
    input.value = this.currentConfig[key] !== undefined ? this.currentConfig[key].toString() : '';
    input.addEventListener('change', (e) => {
      const val = (e.target as HTMLInputElement).value;
      // @ts-ignore
      this.currentConfig[key] = val;
      this.updateCallback(this.currentConfig);
    });
    return input;
  }

  private createFlatVecInput(key: keyof CharacterConfig): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '10px';

    const currentVal = (this.currentConfig[key] as unknown as {x: number, y: number}) || { x: 0, y: 0 };

    // X Input
    const divX = document.createElement('div');
    const labelX = document.createElement('label');
    labelX.innerText = 'X:';
    const inputX = document.createElement('input');
    inputX.type = 'number';
    inputX.value = currentVal.x.toString();
    inputX.addEventListener('change', (e) => {
      currentVal.x = parseFloat((e.target as HTMLInputElement).value) || 0;
      // @ts-ignore
      this.currentConfig[key] = currentVal;
      this.updateCallback(this.currentConfig);
    });
    divX.appendChild(labelX);
    divX.appendChild(inputX);

    // Y Input
    const divY = document.createElement('div');
    const labelY = document.createElement('label');
    labelY.innerText = 'Y:';
    const inputY = document.createElement('input');
    inputY.type = 'number';
    inputY.value = currentVal.y.toString();
    inputY.addEventListener('change', (e) => {
      currentVal.y = parseFloat((e.target as HTMLInputElement).value) || 0;
      // @ts-ignore
      this.currentConfig[key] = currentVal;
      this.updateCallback(this.currentConfig);
    });
    divY.appendChild(labelY);
    divY.appendChild(inputY);

    wrapper.appendChild(divX);
    wrapper.appendChild(divY);
    return wrapper;
  }

  private createComingSoonPlaceholder(traitType: string): HTMLElement {
    const placeholder = document.createElement('div');
    placeholder.style.padding = '10px';
    placeholder.style.backgroundColor = 'var(--border-color)';
    placeholder.style.borderRadius = '3px';
    placeholder.style.color = '#888';
    placeholder.style.fontStyle = 'italic';
    placeholder.innerText = `Editor for '${traitType}' is coming soon.`;
    return placeholder;
  }
}
