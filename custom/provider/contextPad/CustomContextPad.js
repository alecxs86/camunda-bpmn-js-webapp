


export default class CustomContextPad {
  constructor(bpmnFactory, config, contextPad, create, elementFactory, injector, modeling, translate) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.modeling = modeling;
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
      modeling,
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

    function appendClinicalPathwayTask(event, element) {
      if (autoPlace) {

        const shape = elementFactory.createShape({ type: 'bpmn:ServiceTask' });
        shape.businessObject.name = 'Pathway Action';

        shape.businessObject.id = 'Activity_Clinical_Pathway_' + generateRandomString(7);

        shape.businessObject['class'] = 'com.healthentia.camunda.programme1.SendQuestionnaire';
        
        var selectedProperty1 = bpmnFactory.create('camunda:Property', {
          name: 'clinicalPathwayTaskType',
          value: 'Send Questionnaire'
        });
  
        var selectedProperty2 = bpmnFactory.create('camunda:Property', {
          name: 'clinicalPathwayTaskOption',
          value: 'DAILYSYMPTOMQUEST'
        });

        var selectedProperty3 = bpmnFactory.create('camunda:Property', {
          name: 'clinicalPathwayTaskID',
          value: 'fQ6n0l5'
        });
  
        var properties = bpmnFactory.create('camunda:Properties', {
          values: [selectedProperty1, selectedProperty2, selectedProperty3]
        });

        shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements', {
          values: [properties]
        });


        autoPlace.append(element, shape);
      } else {
        appendClinicalPathwayTaskStart(event, element);
      }
    }

    

    function appendClinicalPathwayTaskStart(event) {

      const shape = elementFactory.createShape({ type: 'bpmn:ServiceTask' });
      shape.businessObject.name = 'Pathway Action';

      shape.businessObject.id = 'Activity_Clinical_Pathway_' + generateRandomString(7);

      shape.businessObject['class'] = 'com.healthentia.camunda.programme1.SendQuestionnaire';
      // shape.businessObject['type'] = 'class';
      // shape.businessObject['topic'] = 'com.healthentia.camunda.programme1.SendQuestionnaire'; //this will be updated dynamically when selecting other type of box behaviour

      var selectedProperty1 = bpmnFactory.create('camunda:Property', {
        name: 'clinicalPathwayTaskType',
        value: 'Send Questionnaire'
      });

      var selectedProperty2 = bpmnFactory.create('camunda:Property', {
        name: 'clinicalPathwayTaskOption',
        value: 'DAILYSYMPTOMQUEST'
      });

      var selectedProperty3 = bpmnFactory.create('camunda:Property', {
        name: 'clinicalPathwayTaskID',
        value: 'fQ6n0l5'
      });

      var properties = bpmnFactory.create('camunda:Properties', {
        values: [selectedProperty1, selectedProperty2, selectedProperty3]
      });

      shape.businessObject.extensionElements = shape.businessObject.extensionElements || bpmnFactory.create('bpmn:ExtensionElements', {
        values: [properties]
      });

      create.start(event, shape, element);
    }

    return {
      'append.clinicalpathway-task': {
        group: 'model',
        className: 'bpmn-icon-task',
        title: translate('Append PathwayActionTask'),
        action: {
          click: appendClinicalPathwayTask,
          dragstart: appendClinicalPathwayTaskStart
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
  'modeling',
  'translate'
];