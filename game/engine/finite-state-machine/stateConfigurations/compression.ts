import { InputAction } from '../../input/Input';

/**
 * Packs an InputAction object into a compact ArrayBuffer for network transmission.
 * This version uses 64-bit floats for analog inputs to preserve precision.
 * NOTE: This assumes your `FixedPoint` class has an `AsNumber` getter to retrieve the
 * floating-point value, based on its usage in other components.
 */
export function packInputAction(input: InputAction): ArrayBuffer {
  // 1 byte for Action, 6 * 8 bytes for axes/triggers, 1 byte for flags
  const buffer = new ArrayBuffer(50);
  const view = new DataView(buffer);
  let offset = 0;

  // Byte 0: Action ID
  view.setUint8(offset, input.Action);
  offset += 1;

  // Bytes 1-48: Axes and Triggers as Float64 (little-endian)
  view.setFloat64(offset, input.LXAxis.AsNumber, true);
  offset += 8;
  view.setFloat64(offset, input.LYAxis.AsNumber, true);
  offset += 8;
  view.setFloat64(offset, input.RXAxis.AsNumber, true);
  offset += 8;
  view.setFloat64(offset, input.RYAxis.AsNumber, true);
  offset += 8;
  view.setFloat64(offset, input.LTVal.AsNumber, true);
  offset += 8;
  view.setFloat64(offset, input.RTVal.AsNumber, true);
  offset += 8;

  // Byte 49: Boolean flags packed into a bitmask
  let flags = 0;
  if (input.Start) {
    flags |= 1 << 0; // bit 0
  }
  if (input.Select) {
    flags |= 1 << 1; // bit 1
  }
  view.setUint8(offset, flags);

  return buffer;
}

/** A plain object representation of InputAction, suitable for serialization. */
export type SerializableInputAction = {
  Action: number;
  LXAxis: number;
  LYAxis: number;
  RXAxis: number;
  RYAxis: number;
  LTVal: number;
  RTVal: number;
  Start: boolean;
  Select: boolean;
};

/**
 * Unpacks an ArrayBuffer back into a serializable, plain object
 * representation of an InputAction.
 */
export function unpackInputAction(
  buffer: ArrayBuffer,
  ia: InputAction,
): InputAction {
  const view = new DataView(buffer);
  let offset = 0;

  const action = view.getUint8(offset);
  offset += 1;

  const lx = view.getFloat64(offset, true);
  offset += 8;
  const ly = view.getFloat64(offset, true);
  offset += 8;
  const rx = view.getFloat64(offset, true);
  offset += 8;
  const ry = view.getFloat64(offset, true);
  offset += 8;

  const lt = view.getFloat64(offset, true);
  offset += 8;
  const rt = view.getFloat64(offset, true);
  offset += 8;

  const flags = view.getUint8(offset);
  const start = (flags & (1 << 0)) !== 0;
  const select = (flags & (1 << 1)) !== 0;

  ia.Action = action;
  ia.LXAxis.SetFromNumber(lx);
  ia.LYAxis.SetFromNumber(ly);
  ia.RXAxis.SetFromNumber(rx);
  ia.RYAxis.SetFromNumber(ry);
  ia.LTVal.SetFromNumber(lt);
  ia.RTVal.SetFromNumber(rt);
  ia.Start = start;
  ia.Select = select;

  return ia;
}
