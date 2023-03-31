
'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');
var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var extensionElements = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements');
var is = require('bpmn-js/lib/util/ModelUtil').is;
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
var find = require('lodash/collection').find;

var selectValues = require('../../../model/clinicalPathwayTypeSelect.json'),
    selectQuestionnaireValues = require('../../../model/questionnaireSelect.json'),
    selectQuestionnaireAssessmentValues = require('../../../model/questionnaireAssessmentSelect.json'),
    selectActionValues = require('../../../model/actionSelect.json'),
    selectAssessQuestionnaireIdValues = require('../../../model/asessQuestionnaireIdSelect.json'),
    selectQuestionValues = require('../../../model/questionsSelect.json'),
    selectUserStateValues = require('../../../model/userStateSelect.json');


function findCamundaProperty(camundaProperties, binding) {
  return find(camundaProperties.get('values'), function (p) {
    return p.name === binding.name;
  });
}

function objectWithKey(key, value) {
  var obj = {};

  obj[key] = value;

  return obj;
}

function findExtension(element, type) {
  var bo = getBusinessObject(element);

  var extensionElements;

  if (is(bo, 'bpmn:ExtensionElements')) {
    extensionElements = bo;
  } else {
    extensionElements = bo.extensionElements;
  }

  if (!extensionElements) {
    return null;
  }

  return find(extensionElements.get('values'), function (e) {
    return is(e, type);
  });
}

module.exports = function (group, element, bpmnFactory, translate) {

  var getElementValue = function (element, node, propertyName) {
    var bo = getBusinessObject(element);
    var elements = bo.get('extensionElements');
    if (elements != null) {
      var camundaProperties = findExtension(elements, 'camunda:Properties');
      camundaProperties = camundaProperties.values.filter(function (element) {
        if (element.name === propertyName) {
          return element;
        }
      });
    }
    if (camundaProperties != null && camundaProperties.length > 0) {
      var returnValue = {};
      returnValue[propertyName] = camundaProperties[0].value;
      return returnValue;
    } else {
      return '';
    }
  };

  var setElementValue = function (element, values, node, propertyName) {
    var bo = getBusinessObject(element);
    var entry = values;
    var extensionElements = bo.get('extensionElements');
    var updates = [];
    if (!extensionElements) {
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements');
      updates.push(cmdHelper.updateBusinessObject(
        element, bo, objectWithKey('extensionElements', extensionElements)
      ));
    }

    var camundaProperties = findExtension(extensionElements, 'camunda:Properties');
    if (!camundaProperties) {
      camundaProperties = bpmnFactory.create('camunda:Properties');
      updates.push(cmdHelper.addElementsTolist(
        element, extensionElements, 'values', [camundaProperties]
      ));
    }
    var existingCamundaProperty = findCamundaProperty(camundaProperties, { 'name': propertyName });
    if (values != null && values[propertyName] != null) {
      values = values[propertyName];
    }
    var camundaProperty = bpmnFactory.create('camunda:Property', {
      name: propertyName,
      value: values || ''
    });
    updates.push(cmdHelper.addAndRemoveElementsFromList(
      element,
      camundaProperties,
      'values',
      null,
      [camundaProperty],
      existingCamundaProperty ? [existingCamundaProperty] : []
    ));
    return updates;
  };

  // not used for the moment, but may be useful in the future
  var createTextField = function (id, description, label, ranslate) {
    return entryFactory.textField(translate, {
      id: id,
      description: description,
      label: label,
      modelProperty: id,
      get: function (element, node) {
        return getElementValue(element, node, id);
      },
      set: function (element, values, node) {
        return setElementValue(element, values, node, id);
      }
    });
  };

  var createSelectBox = function (id, label, selectOptions, translate) {
    return entryFactory.selectBox(translate, {
      id: id,
      label: label,
      selectOptions: selectOptions,
      modelProperty: id,
      get: function (element, node) {
        return getElementValue(element, node, id);
      },
      set: function (element, values, node) {
        return setElementValue(element, values, node, id);
      }
    });
  };

  // create a selectBox only if the activity type is "Clinical Pathway" -- can be modified to suit any purpose
  if ((is(element, 'bpmn:ServiceTask')) && (getBusinessObject(element).id.startsWith('Activity_Clinical_Pathway_'))) {
    group.entries.push(createSelectBox(
      'clinicalPathwayTaskType',
      'Clinical Pathway Type',
      selectValues,
      translate
    ));

    var displayText = 'Questionnaire Type';
    var selectDynamicValues = [selectQuestionnaireValues, selectQuestionnaireAssessmentValues, selectActionValues];
    var action = selectDynamicValues[0];

    var camundaProperties = findExtension(getBusinessObject(element).extensionElements, 'camunda:Properties');
  
    if (camundaProperties != null) {
      var camundaProperty = findCamundaProperty(camundaProperties, { 'name': 'clinicalPathwayTaskType' });
      switch (camundaProperty.value) {
        case 'Send Questionnaire':
          displayText = 'Questionnaire Type';
          action = selectDynamicValues[0];
          break;
        case 'Assess Questionnaire':
          displayText = 'Score Check Type';
          action = selectDynamicValues[1];
          break;
        case 'Take Action':
          displayText = 'Action Type';
          action = selectDynamicValues[2];
          break;
        default:
          break;
      }
      
    }
    
    if (camundaProperties != null) {
      var camundaProperty = findCamundaProperty(camundaProperties, { 'name': 'clinicalPathwayTaskType' });
      if (camundaProperty.value === 'Assess Questionnaire') {
        group.entries.push(createSelectBox(
          'assessQuestionnaireID',
          'Questionnaire ID to assess',
          selectAssessQuestionnaireIdValues,
          translate
        ))
      }
    }

    group.entries.push(createSelectBox(
      'clinicalPathwayTaskOption',
      displayText,
      action,
      translate
    ));

    if (camundaProperties != null) {
      var camundaProperty = findCamundaProperty(camundaProperties, { 'name': 'clinicalPathwayTaskType' });

      switch (camundaProperty.value) {
      // if (camundaProperty.value === 'Send Questionnaire') {
        case 'Send Questionnaire':
          group.entries.push(createTextField(
            'clinicalPathwayTaskID',
            'Fill in the unique ID of the questionnaire',
            'Questionnaire ID',
            translate
          ));

        // here we will implement an if statement. When the condition that it is a first questionnaire is met, then the implementation is class
        // if it is not a first questionnaire, then the implementation is external
      
        // first we console.log to see model
      // console.log("incoming (before):", element.incoming);
      // console.log("outgoing (after):", element.outgoing);

      // console.log("is previous activity of element %s bpmn:StartEvent:", element.id, is(getBusinessObject(element.incoming[0]).sourceRef, 'bpmn:StartEvent'));
    
        if (is(getBusinessObject(element.incoming[0]).sourceRef, 'bpmn:StartEvent')) { //ToDo: check if incoming might be an array with multiple values; check if we can alter the
          //condition and obtain a list of previous activities and check if there is any other element with camundaProperty.value  'Send Questionnaire'
          getBusinessObject(element)['class'] = 'com.healthentia.camunda.programme1.SendQuestionnaire';
          getBusinessObject(element)['type'] = null;
          getBusinessObject(element)['topic'] = null; 
        } else {
          getBusinessObject(element)['class'] = null;
          getBusinessObject(element)['type'] = 'external';
          getBusinessObject(element)['topic'] = 'sendQuestionnaire'; //this will be updated dynamically when selecting other type of box behaviour
        }
        break;

      // } else if (camundaProperty.value === 'Assess Questionnaire') { // to modify condition
      case 'Assess Questionnaire':
        var camundaPropertyOption = findCamundaProperty(camundaProperties, { 'name': 'clinicalPathwayTaskOption' });
        if (camundaPropertyOption.value === 'Check Question Answer Score') {
          group.entries.push(createSelectBox(
            'questionAnswerScore',
            'Question Answer to Assess',
            selectQuestionValues,
            translate
          ))          
        };
        getBusinessObject(element)['type'] = null;
        getBusinessObject(element)['topic'] = null; 
        getBusinessObject(element)['class'] = 'com.healthentia.camunda.programme1.ProcessQuestionnaire';
        break;

      // } else if (camundaProperty.value === 'Take Action') { // to modify condition
      case 'Take Action':
        var camundaPropertyOption = findCamundaProperty(camundaProperties, { 'name': 'clinicalPathwayTaskOption' });
        if (camundaPropertyOption.value === 'Apply Tag') {
          group.entries.push(createSelectBox(
            'tagApply',
            'Tag to Apply',
            selectUserStateValues,
            translate
          ));
        };
        getBusinessObject(element)['type'] = null;
        getBusinessObject(element)['topic'] = null; 
        getBusinessObject(element)['class'] = 'com.healthentia.camunda.programme1.TakeAction';
        break;
      }
    }
  }
}