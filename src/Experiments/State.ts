interface IState {
  name: string;
  onEnter?: () => void;
  onUpdate?: (dt: number) => void;
  onExit?: () => void;
  tranisitions?: string[];
}

export default IState;
