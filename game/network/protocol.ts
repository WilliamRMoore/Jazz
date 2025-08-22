import { InputAction } from '../loops/Input';

const VERSION = 'V0.001';

export type MessageProtocol = {
  version: string;
  type: number;
  frame: number;
  frameAdvantage: number;
  inputAction: InputAction;
};

export const MessageTypes = {
  LOCAL_INPUT: 0,
  REMOTE_INPUT: 1,
  GAME_OVER: 2,
  PAUSE: 3,
  ADVANCE: 4,
  RESET: 5,
};

export function NewMessageFromLocalInput(
  InputAction: InputAction,
  frame: number
): MessageProtocol {
  return {
    version: VERSION,
    type: MessageTypes.LOCAL_INPUT,
    frame: frame,
    frameAdvantage: 0,
    inputAction: InputAction,
  } as MessageProtocol;
}
