export class HoldComponent {
  private heldPlayerId: number | undefined = undefined;

  public SetHeldPlayerId(playerId: number) {
    this.heldPlayerId = playerId;
  }

  public get HeldPlayerId(): number | undefined {
    return this.heldPlayerId;
  }

  public ClearHeldPlayerId() {
    this.heldPlayerId = undefined;
  }
}
