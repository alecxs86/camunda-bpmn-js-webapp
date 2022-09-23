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

    function createCheckMeasurementTask(event) { // change into get or check measurement

      const shape = elementFactory.createShape({ type: 'bpmn:ScriptTask' });
      shape.businessObject.name = 'Check Measurement';

      shape.businessObject.id = 'Activity_Check_Measurement_' + generateRandomString(7);

      var selectedProperty1 = bpmnFactory.create('camunda:Property', {
        name: 'measurementType',
        value: 'weight' //weight, blood pressure
      });

      var selectedProperty2 = bpmnFactory.create('camunda:Property', {
        name: 'measurementThreshold',
        value: '55' // assume kg
      });

      var selectedProperty3 = bpmnFactory.create('camunda:Property', {
        name: 'thresholdType',
        value: 'higher' // will output true for measurementType higher than measurementThreshold
      });

      var selectedProperty4 = bpmnFactory.create('camunda:Property', {
        name: 'measurementNoOfDays', // no of days for which the threshold should be compared against
        value: '3' //
      });

      var properties = bpmnFactory.create('camunda:Properties', {
        values: [selectedProperty1, selectedProperty2, selectedProperty3, selectedProperty4]
      });

      shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements', {
        values: [properties]
      });

      shape.businessObject.scriptFormat = "Javascript";
      shape.businessObject.script = // will modify this according to the variables taken from camunda:properties // or will we do this in the processor code?
        'execution.setVariable("measurementType","nothing");';

//         var modelInstance = execution.getBpmnModelInstance();
//   var elementInstance = modelInstance.getModelElementById('Activity_Check_Measurement_kqAHFPp'); // have to figure out how to replace this with the actual name
//   var extensionElements = elementInstance.getExtensionElements().getElementsQuery().filterByType(Java.type('org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperties').class).singleResult().getCamundaProperties().toArray();

// var measurementThr = extensionElements[0].getCamundaValue().toString();
// if(measurementThr == 55) { // some condition here
// execution.setVariable("changeState",true);
// } else {
// execution.setVariable("changeState",false);
// }

      create.start(event, shape);
    }

    
    // function createGetWeightTask(event) { // change into get or check measurement

    //   const shape = elementFactory.createShape({ type: 'bpmn:ScriptTask' });
    //   shape.businessObject.name = 'Get Weight';

    //   shape.businessObject.id = 'Activity_Get_Weight_' + generateRandomString(7);

    //   var selectedProperty1 = bpmnFactory.create('camunda:Property', {
    //     name: 'absoluteWeightThreshold',
    //     value: WEIGHT_THRESHOLD
    //   });

    //   var selectedProperty2 = bpmnFactory.create('camunda:Property', {
    //     name: 'noOfDaysHigherThreshold',
    //     value: NO_DAYS_THRESHOLD
    //   });

    //   var properties = bpmnFactory.create('camunda:Properties', {
    //     values: [selectedProperty1, selectedProperty2]
    //   });

    //   shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements', {
    //     values: [properties]
    //   });

    //   shape.businessObject.scriptFormat = "Javascript";
    //   shape.businessObject.script =
    //     'execution.setVariable("weightOver",true);';

    //   create.start(event, shape);
    // }

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
      'create.check-measurement-task': {
        group: 'activity',
        className: 'bpmn-icon-task',
        title: translate('Create CheckMeasurementTask'),
        action: {
          dragstart: createCheckMeasurementTask,
          click: createCheckMeasurementTask
        }
      },
      // 'create.get-weight-task': {
      //   group: 'activity',
      //   className: 'bpmn-icon-task',
      //   title: translate('Create GetWeightTask'),
      //   action: {
      //     dragstart: createGetWeightTask,
      //     click: createGetWeightTask
      //   }
      // },
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