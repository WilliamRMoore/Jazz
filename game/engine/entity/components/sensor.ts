import { Command } from '../../command/command';
import { FixedPoint, NumberToRaw } from '../../math/fixedPoint';
import { Pool } from '../../pools/Pool';
import { PooledVector } from '../../pools/PooledVector';
import { IHistoryEnabled } from '../componentHistory';

class Sensor {
  private readonly xOffset: FixedPoint = new FixedPoint();
  private readonly yOffset: FixedPoint = new FixedPoint();
  private readonly radius: FixedPoint = new FixedPoint();
  private active: boolean = false;

  public GetGlobalPosition(
    vecPool: Pool<PooledVector>,
    globalX: FixedPoint,
    globalY: FixedPoint,
    facingRight: boolean,
  ): PooledVector {
    const xOffsetRaw = this.XOffset.Raw;
    const yOffsetRaw = this.YOffset.Raw;
    const globalXRaw = globalX.Raw;
    const globalYRaw = globalY.Raw;

    const xRaw = facingRight
      ? globalXRaw + xOffsetRaw
      : globalXRaw - xOffsetRaw;
    const yRaw = globalYRaw + yOffsetRaw;
    return vecPool.Rent().SetXYRaw(xRaw, yRaw);
  }

  public get Radius(): FixedPoint {
    return this.radius;
  }

  public get XOffset(): FixedPoint {
    return this.xOffset;
  }

  public get YOffset(): FixedPoint {
    return this.yOffset;
  }

  public get IsActive(): boolean {
    return this.active;
  }

  public Activate(): void {
    this.active = true;
  }

  public Deactivate(): void {
    this.xOffset.Zero();
    this.yOffset.Zero();
    this.radius.Zero();
    this.active = false;
  }
}

export type SensorSnapShot = {
  sensors:
    | Array<{
        xOffset: number;
        yOffset: number;
        radius: number;
      }>
    | undefined;
  reactor: Command | undefined;
};

export class SensorComponent implements IHistoryEnabled<SensorSnapShot> {
  private currentSensorIdx: number = 0;
  private readonly sensors: Array<Sensor> = new Array<Sensor>(25);
  public ReactCommand: Command | undefined;

  constructor() {
    for (let i = 0; i < this.sensors.length; i++) {
      this.sensors[i] = new Sensor();
    }
  }

  public ActivateSensor(
    xOffset: FixedPoint,
    yOffset: FixedPoint,
    radius: FixedPoint,
  ): SensorComponent {
    if (this.currentSensorIdx >= this.sensors.length) {
      throw new Error('No more sensors available to activate.');
    }
    this.ActivateSensorRaw(yOffset.Raw, xOffset.Raw, radius.Raw);
    return this;
  }

  public ActivateSensorRaw(
    xOffsetRaw: number,
    yOffsetRaw: number,
    radiusRaw: number,
  ): void {
    const sensor = this.sensors[this.currentSensorIdx];
    sensor.XOffset.SetFromRaw(xOffsetRaw);
    sensor.YOffset.SetFromRaw(yOffsetRaw);
    sensor.Radius.SetFromRaw(radiusRaw);
    sensor.Activate();
    this.currentSensorIdx++;
  }

  public DeactivateSensors(): void {
    const length = this.sensors.length;
    for (let i = 0; i < length; i++) {
      const sensor = this.sensors[i];
      if (sensor.IsActive) {
        sensor.Deactivate();
      }
    }
    this.currentSensorIdx = 0;
    this.ReactCommand = undefined;
  }

  public get Sensors(): Array<Sensor> {
    return this.sensors;
  }

  public get NumberActive(): number {
    return this.currentSensorIdx;
  }

  public SnapShot(): SensorSnapShot {
    const snapShot: SensorSnapShot = {
      sensors: undefined,
      reactor: undefined,
    };

    const length = this.sensors.length;
    if (length > 0) {
      snapShot.sensors = [];
    }
    for (let i = 0; i < length; i++) {
      const sensor = this.sensors[i];
      if (sensor.IsActive) {
        snapShot.sensors!.push({
          yOffset: sensor.YOffset.AsNumber,
          xOffset: sensor.XOffset.AsNumber,
          radius: sensor.Radius.AsNumber,
        });
      }
    }

    if (this.ReactCommand !== undefined) {
      snapShot.reactor = this.ReactCommand;
    }
    return snapShot;
  }

  public SetFromSnapShot(snapShot: SensorSnapShot): void {
    this.DeactivateSensors();
    const snapShotSensorLength = snapShot.sensors?.length ?? 0;
    for (let i = 0; i < snapShotSensorLength; i++) {
      const snapShotSensor = snapShot.sensors![i];
      this.ActivateSensorRaw(
        NumberToRaw(snapShotSensor.yOffset),
        NumberToRaw(snapShotSensor.xOffset),
        NumberToRaw(snapShotSensor.radius),
      );
    }
    if (snapShot.reactor !== undefined) {
      this.ReactCommand = snapShot.reactor;
    } else {
      this.ReactCommand = undefined;
    }
    this.currentSensorIdx = snapShot.sensors?.length ?? 0;
  }
}
