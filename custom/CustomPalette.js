'use strict';

const WEIGHT_THRESHOLD = 55;
const NO_DAYS_THRESHOLD = 3;

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

    function createGetWeightTask(event) {

      const shape = elementFactory.createShape({ type: 'bpmn:ScriptTask' });
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

      shape.businessObject.scriptFormat = "Javascript";
      shape.businessObject.script =
        'execution.setVariable("weightOver",true);';

      create.start(event, shape);
    }

    function createSetUserStateTask(event) {

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
      'create.get-weight-task': {
        group: 'activity',
        className: 'bpmn-icon-task',
        title: translate('Create GetWeightTask'),
        action: {
          dragstart: createGetWeightTask,
          click: createGetWeightTask
        }
      },
      'create.set-user-state-task': {
        group: 'activity',
        className: 'bpmn-icon-task',
        title: translate('Create SetUserStateTask'),
        action: {
          dragstart: createSetUserStateTask,
          click: createSetUserStateTask
        }
      }
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