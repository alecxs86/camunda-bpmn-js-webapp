'use strict';

// const { ExtensionElementsHelper } = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');

// const { PropertiesProps } = require('bpmn-js-properties-panel/lib/provider/camunda/parts/PropertiesProps')

var findExtension = require('bpmn-js-properties-panel/lib/provider/camunda/element-templates/Helper').findExtension;

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

const WEIGHT_THRESHOLD = 55;

export default class CustomPalette {
  constructor(bpmnFactory, create, elementFactory, palette, translate) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const {
      bpmnFactory,
      create,
      elementFactory,
      translate
    } = this


    function createGetWeightTask(event) {

      var commands = [];

      const shape = elementFactory.createShape({ type: 'bpmn:Task' });
      shape.businessObject.name = 'Get Weight';

      var selectedProperty = bpmnFactory.create('camunda:Property', {
        name: 'absoluteWeightThreshold',
        value: WEIGHT_THRESHOLD
      });

      var properties = bpmnFactory.create('camunda:Properties', {
        values: [selectedProperty]
      });

      shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements');
      shape.businessObject.extensionElements.get('values').push(properties);

      var camundaProp = findExtension(shape.businessObject.extensionElements, 'camunda:Properties');

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
  'bpmnFactory',
  'create',
  'elementFactory',
  'palette',
  'translate'
];