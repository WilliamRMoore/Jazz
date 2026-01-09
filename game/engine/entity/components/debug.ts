import { IHistoryEnabled } from '../componentHistory';

export type DebugSnapShot = {
  db_grav_active: boolean;
};

export class DebugComponent implements IHistoryEnabled<DebugSnapShot> {
  public _db_grav_active = true;

  public SnapShot(): DebugSnapShot {
    throw new Error('Method not implemented.');
  }

  public SetFromSnapShot(snapShot: DebugSnapShot): void {
    throw new Error('Method not implemented.');
  }
}
