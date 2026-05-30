export class HoldComponent {
  public heldPlayerId: number | undefined = undefined;

  public set ComptState(history: HoldHist) {
    this.heldPlayerId = history.heldPlayerId;
  }
}

export type HoldHist = {
  heldPlayerId: number | undefined;
};
