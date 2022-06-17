const { ExtensionElementsHelper } = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');

const { BpmnFactory } = require('bpmn-js/lib/features/modeling')

export default class CustomContextPad {
  constructor(config, contextPad, create, elementFactory, injector, translate) {
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
      create,
      elementFactory,
      translate
    } = this;

    function appendGetWeightTask(event, element) {
      if (autoPlace) {
        
        const shape = elementFactory.createShape({ type: 'bpmn:Task' });
        shape.businessObject.name = 'Get Weight';
        
        autoPlace.append(element, shape);
      } else {
        appendGetWeightTaskStart(event, element);
      }
    }

    function appendGetWeightTaskStart(event) {
      const shape = elementFactory.createShape({ type: 'bpmn:Task' });
      shape.businessObject.name = 'Get Weight';
        
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
  'config',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate'
];