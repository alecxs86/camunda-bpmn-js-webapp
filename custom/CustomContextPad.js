// const { ExtensionElementsHelper } = require('bpmn-js-properties-panel/lib/provider/camunda/');

// const { PropertiesProps } = require('bpmn-js-properties-panel/lib/provider/camunda/parts/PropertiesProps')

// import { default as camundaModdleDescriptor } from 'camunda-bpmn-moddle/resources/camunda.json';


const WEIGHT_THRESHOLD = 55;

export default class CustomContextPad {
  constructor(bpmnFactory, config, contextPad, create, elementFactory, injector, translate) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    if (config.autoPlace !== false) {
      this.autoPlace = injector.get('autoPlace', false);
    }

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const {
      autoPlace,
      bpmnFactory,
      create,
      elementFactory,
      translate
    } = this;

    const generateRandomString = (myLength) => {
      const chars =
        "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
      const randomArray = Array.from(
        { length: myLength },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
      );
    
      const randomString = randomArray.join("");
      return randomString;
    };    

    function appendGetWeightTask(event, element) {
      if (autoPlace) {
        var commands = [];
        const shape = elementFactory.createShape({ type: 'bpmn:Task' });
        shape.businessObject.name = 'Get Weight';

        shape.businessObject.id = 'Activity_Get_Weight_' + generateRandomString(7);
        var selectedProperty = bpmnFactory.create('camunda:Property', {
          name: 'absoluteWeightThreshold',
          value: WEIGHT_THRESHOLD
        });

        var properties = bpmnFactory.create('camunda:Properties', {
          values: [selectedProperty]
        });

        shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements');
        shape.businessObject.extensionElements.get('values').push(properties);

        autoPlace.append(element, shape);
      } else {
        appendGetWeightTaskStart(event, element);
      }
    }

    function appendGetWeightTaskStart(event) {
      var commands = [];
      const shape = elementFactory.createShape({ type: 'bpmn:Task' });
      shape.businessObject.name = 'Get Weight';

      shape.businessObject.id = 'Activity_Get_Weight_' + generateRandomString(7); 
      var selectedProperty = bpmnFactory.create('camunda:Property', {
        name: 'absoluteWeightThreshold',
        value: WEIGHT_THRESHOLD
      });

      var properties = bpmnFactory.create('camunda:Properties', {
        values: [selectedProperty]
      });

      shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements');
      shape.businessObject.extensionElements.get('values').push(properties);

      create.start(event, shape, element);
    }

    return {
      'append.getweight-task': {
        group: 'model',
        className: 'bpmn-icon-task',
        title: translate('Append GetWeightTask'),
        action: {
          click: appendGetWeightTask,
          dragstart: appendGetWeightTaskStart
        }
      }
    };
  }
}

CustomContextPad.$inject = [
  'bpmnFactory',
  'config',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate'
];