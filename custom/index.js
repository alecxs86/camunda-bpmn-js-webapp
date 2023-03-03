import CustomContextPad from './provider/contextPad/CustomContextPad';
import CustomPalette from './provider/contextPad/CustomPalette';
import CustomRenderer from './provider/renderer/CustomRenderer';

export default {
  __init__: [ 'customContextPad', 'customPalette', 'customRenderer' ],
  customContextPad: [ 'type', CustomContextPad ],
  customPalette: [ 'type', CustomPalette ],
  customRenderer: [ 'type', CustomRenderer ]
};