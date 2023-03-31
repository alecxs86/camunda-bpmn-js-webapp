'use strict';

export default class CustomPalette {
  constructor(bpmnFactory, create, elementFactory, palette, modeling, translate) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.modeling = modeling;
    this.translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const {
      bpmnFactory,
      create,
      elementFactory,
      modeling,
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

    function createClinicalPathwayTask(event) {

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
/*
      const errorBoundaryEvent = elementFactory.createShape({
        type: 'bpmn:BoundaryEvent',
        eventDefinitionType: 'bpmn:MessageEventDefinition'
      });    
**/
      create.start(event, shape);
      

      // modeling.createShape(errorBoundaryEvent, { x: 400, y: 140 }, shape, { attach: true });
      
    }

    return { 
      'create.clinical-pathway-task': {
        group: 'activity',
        className: 'bpmn-icon-task',
        title: translate('Create PathwayActionTask'),
        action: {
          dragstart: createClinicalPathwayTask,
          click: createClinicalPathwayTask
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
  'modeling',
  'translate'
];