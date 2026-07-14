import { envConfig } from '../game/engine/config/main-config';
import { createEmptyHistoryData } from '../game/engine/world/stateModules';

jest.mock('../game/engine/config/main-config', () => ({
  envConfig: {
    get: jest.fn(),
  },
}));

describe('PlayerHistoryTable', () => {
  const BUFFER_SIZE = 10;

  beforeAll(() => {
    (envConfig.get as jest.Mock).mockReturnValue(BUFFER_SIZE);
  });

  test('should return the same object when index wraps around buffer size', () => {
    const historyTable = createEmptyHistoryData();

    // Get the first element
    const firstElement = historyTable.get(0);

    // Get the element at BUFFER_SIZE (should wrap to 0)
    const wrappedElement = historyTable.get(BUFFER_SIZE);

    expect(wrappedElement).toBe(firstElement);
  });

  test('should return distinct objects for indices within buffer size', () => {
    const historyTable = createEmptyHistoryData();

    const elementA = historyTable.get(0);
    const elementB = historyTable.get(1);

    expect(elementA).not.toBe(elementB);
  });

  test('should persist data when wrapping around', () => {
    const historyTable = createEmptyHistoryData();
    const index = 5;
    const wrappedIndex = index + BUFFER_SIZE;

    const element = historyTable.get(index);
    // Modify the element to verify we are accessing the same instance later
    element.stateFrame = 42;
    element.posXRaw = 100;

    // Access via wrapped index
    const wrappedElement = historyTable.get(wrappedIndex);

    expect(wrappedElement.stateFrame).toBe(42);
    expect(wrappedElement.posXRaw).toBe(100);
  });

  test('should handle multiple wraps', () => {
    const historyTable = createEmptyHistoryData();
    const index = 2;
    const element = historyTable.get(index);

    const wrappedOnce = historyTable.get(index + BUFFER_SIZE);
    const wrappedTwice = historyTable.get(index + BUFFER_SIZE * 2);

    expect(wrappedOnce).toBe(element);
    expect(wrappedTwice).toBe(element);
  });
});
