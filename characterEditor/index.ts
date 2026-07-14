const getMainWindow = () => {
  const window = document.getElementById('main-editor-window');
  if (window == undefined) {
    throw new Error('Could not find main editor window');
  }
  return window;
};

const getLeftPanel = () => {
  const panel = document.getElementById('left-panel');
  if (panel == undefined) {
    throw new Error('Could not find left panel');
  }
  return panel;
};

const getRightPanel = () => {
  const panel = document.getElementById('right-panel');
  if (panel == undefined) {
    throw new Error('Could not find right panel');
  }
  return panel;
};

const getBottomPanel = () => {
  const panel = document.getElementById('bottom-panel');
  if (panel == undefined) {
    throw new Error('Could not find bottom panel');
  }
  return panel;
};

const getCanvas = () => {
  const canvas = document.getElementById('canvas');
  if (canvas == undefined) {
    throw new Error('Could not find canvas');
  }
  return canvas;
};
