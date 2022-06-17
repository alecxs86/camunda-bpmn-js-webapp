'use strict';

const { ExtensionElementsHelper } = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');

const { BpmnFactory } = require('bpmn-js/lib/features/modeling/BpmnFactory');

export default class CustomPalette {
constructor(create, elementFactory, palette, translate) {
  this.create = create;
  this.elementFactory = elementFactory;
  this.translate = translate;

  palette.registerProvider(this);
}

getPaletteEntries(element) {
  const {
    create,
    elementFactory,
    translate
  } = this


  function createGetWeightTask(event) {
    
    const shape = elementFactory.createShape({ type: 'bpmn:Task' });
    shape.businessObject.name = 'Get Weight';

    // console.log(shape.businessObject);
    // console.log(element);
    // console.log(this._bpmnFactory);

    // ExtensionElementsHelper.addEntry(shape.businessObject, null, { 'suitable': '0.7' }, BpmnFactory);
    // const property = moddle.create("camunda:properties");

    // create the custom element (according to our json config)
    // const pocUser = moddle.create("poc:User");
    // pocUser.name = "Max";

    // put the custom element into the extensionElements
    // extensionElements.set("values", property);
    // console.log(extensionElements);

    // shape.businessObject.set("extensionElements", extensionElements);

    // console.log(shape.businessObject.extensionElements.get("values"));

    create.start(event, shape);
  }

  return {
    'create.get-weight-task': {
      group: 'activity',
      className: 'bpmn-icon-task',
      title: translate('Create GetWeightTask'),
      action: {
        dragstart: createGetWeightTask,
        click: createGetWeightTask
      }
    },
  }
}
}

CustomPalette.$inject = [
  'create',
  'elementFactory',
  'palette',
  'translate'
];