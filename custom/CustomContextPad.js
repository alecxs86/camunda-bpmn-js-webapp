
const WEIGHT_THRESHOLD = 55;
const NO_DAYS_THRESHOLD = 3;

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
        const shape = elementFactory.createShape({ type: 'bpmn:Task' });
        shape.businessObject.name = 'Get Weight';

        shape.businessObject.id = 'Activity_Get_Weight_' + generateRandomString(7);
        var selectedProperty1 = bpmnFactory.create('camunda:Property', {
          name: 'absoluteWeightThreshold',
          value: WEIGHT_THRESHOLD
        });

        var selectedProperty2 = bpmnFactory.create('camunda:Property', {
          name: 'noOfDaysHigherThreshold',
          value: NO_DAYS_THRESHOLD
        });

        var properties = bpmnFactory.create('camunda:Properties', {
          values: [selectedProperty1, selectedProperty2]
        });

        shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements', {
          values: [properties]
        });

        autoPlace.append(element, shape);
      } else {
        appendGetWeightTaskStart(event, element);
      }
    }

    function appendSetUserStateTask(event, element) {
      if (autoPlace) {

        const shape = elementFactory.createShape({ type: 'bpmn:Task' });
        shape.businessObject.name = 'Set User State';

        shape.businessObject.id = 'Activity_Set_User_State_' + generateRandomString(7);

        var selectedProperty = bpmnFactory.create('camunda:Property', {
          name: 'userState',
          value: 'Healthy'
        });

        var properties = bpmnFactory.create('camunda:Properties', {
          values: [selectedProperty]
        });

        shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements', {
          values: [properties]
        });

        autoPlace.append(element, shape);
      } else {
        appendSetUserStateTaskStart(event, element);
      }
    }

    function appendGetWeightTaskStart(event) {

      const shape = elementFactory.createShape({ type: 'bpmn:Task' });
      shape.businessObject.name = 'Get Weight';

      shape.businessObject.id = 'Activity_Get_Weight_' + generateRandomString(7);
      var selectedProperty1 = bpmnFactory.create('camunda:Property', {
        name: 'absoluteWeightThreshold',
        value: WEIGHT_THRESHOLD
      });

      var selectedProperty2 = bpmnFactory.create('camunda:Property', {
        name: 'noOfDaysHigherThreshold',
        value: NO_DAYS_THRESHOLD
      });

      var properties = bpmnFactory.create('camunda:Properties', {
        values: [selectedProperty1, selectedProperty2]
      });

      shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements', {
        values: [properties]
      });

      create.start(event, shape, element);
    }

    function appendSetUserStateTaskStart(event) {

      const shape = elementFactory.createShape({ type: 'bpmn:Task' });
      shape.businessObject.name = 'Set User State';

      shape.businessObject.id = 'Activity_Set_User_State_' + generateRandomString(7);

      var selectedProperty = bpmnFactory.create('camunda:Property', {
        name: 'userState',
        value: 'Healthy'
      });

      var properties = bpmnFactory.create('camunda:Properties', {
        values: [selectedProperty]
      });

      shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements', {
        values: [properties]
      });

      create.start(event, shape);
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
      },
      'append.setuserstate-task': {
        group: 'model',
        className: 'bpmn-icon-task',
        title: translate('Append SetUserStateTask'),
        action: {
          click: appendSetUserStateTask,
          dragstart: appendSetUserStateTaskStart
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