
var ColorPickerFactory = require('./colorPicker/ColorPickerFactory.js');
var BpmnRenderUtil = require('bpmn-js/lib/draw/BpmnRenderUtil.js');


 module.exports = function (group, element, modeling, translate) {
  group.entries.push(ColorPickerFactory(modeling, translate, {
    id: 'fill-' + element.id,
    label: translate('Fill'),
    fillOrStroke: 'fill',
    value: BpmnRenderUtil.getFillColor(element, "#ffffff")
  }));
  
  group.entries.push(ColorPickerFactory(modeling, translate, {
    id: 'stroke-' + element.id,
    label: translate('Stroke'),
    fillOrStroke: 'stroke',
    value: BpmnRenderUtil.getStrokeColor(element, "#000000")
  }));
}
