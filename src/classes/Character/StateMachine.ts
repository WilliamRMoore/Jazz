import IState from './State';

let idCount = 0;

export default class StateMachine {
  private states = new Map<string, IState>();
  private currentState?: IState;
  private id = (++idCount).toString();
  private context?: object;
  private isChangingState: boolean = false;

  constructor(context?: object, id?: string) {
    this.id = id ?? this.id;
    this.context = context;
  }

  addState(
    name: string,
    config?: {
      onEnter?: () => void;
      onUpdate?: (dt: number) => void;
      onExit?: () => void;
      transitions?: string[];
    }
  ) {
    const context = this.context;
    this.states.set(name, {
      name,
      onEnter: config?.onEnter?.bind(context),
      onUpdate: config?.onUpdate?.bind(context),
      onExit: config?.onExit?.bind(context),
      tranisitions: config?.transitions,
    });
    return this;
  }

  setState(name: string) {
    // unknown state name
    if (!this.states.has(name)) {
      console.warn('Unknown State');
    }
    // current state name
    if (this.currentState?.name === name) {
      return;
    }

    //if state has transitions

    if (
      this.currentState?.tranisitions != undefined &&
      this.currentState.tranisitions.length > 0
    ) {
      if (this.currentState.tranisitions.find((t) => t === name)) {
        console.log('passed check');
        //if current state has an on exit method, run it
        if (this.currentState && this.currentState.onExit) {
          this.currentState.onExit();
        }
        this.currentState = this.states.get(name)!;
        //if state has an onEnter method, run it.
        if (this.currentState.onEnter) {
          this.currentState.onEnter();
        }
      }
    } else {
      console.log(this.currentState?.tranisitions);
      //if state does not have transions
      console.log(
        `[StateMachine (${this.id})] change from ${
          this.currentState?.name ?? 'none'
        } to ${name}`
      );
      if (this.currentState && this.currentState.onExit) {
        this.currentState.onExit();
      }
      this.currentState = this.states.get(name)!;
      if (this.currentState.onEnter) {
        this.currentState.onEnter();
      }
    }
    // if (
    //   this.currentState?.tranisitions //&&
    //   //this.currentState.tranisitions.find((t) => t == name)
    // ) {
    //   console.log(
    //     `[StateMachine (${this.id})] change from ${
    //       this.currentState?.name ?? 'none'
    //     } to ${name}`
    //   );
    //   if (this.currentState && this.currentState.onExit) {
    //     this.currentState.onExit();
    //   }
    //   this.currentState = this.states.get(name)!;
    //   if (this.currentState.onEnter) {
    //     this.currentState.onEnter();
    //   }
    // }
    // console.log(
    //   `[StateMachine (${this.id})] change from ${
    //     this.currentState?.name ?? 'none'
    //   } to ${name}`
    // );
    // if (this.currentState && this.currentState.onExit) {
    //   this.currentState.onExit();
    // }
    // this.currentState = this.states.get(name)!;
    // if (this.currentState.onEnter) {
    //   this.currentState.onEnter();
    // }
  }

  forceState(name: string) {
    // unknown state name
    if (!this.states.has(name)) {
      console.warn('Unknown State');
    }
    // current state name
    if (this.currentState?.name === name) {
      return;
    }
    console.log(
      `[StateMachine (${this.id})] change from ${
        this.currentState?.name ?? 'none'
      } to ${name}`
    );
    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit();
    }
    this.currentState = this.states.get(name)!;
    if (this.currentState.onEnter) {
      this.currentState.onEnter();
    }
  }

  update(dt: number) {
    if (this.currentState && this.currentState.onUpdate) {
      this.currentState.onUpdate(dt);
    }
  }
}
