
'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');
var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var extensionElements = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements');
var is = require('bpmn-js/lib/util/ModelUtil').is;
var isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
var find = require('lodash/collection').find;

var selectValues = require('../../../model/thresholdTypeSelect.json'),/**
    selectQuestionnaireValues = require('./questionnaireSelect.json'),
    selectQuestionnaireAssessmentValues = require('./questionnaireAssessmentSelect.json'),
    selectActionValues = require('./actionSelect.json'),
    selectAssessQuestionnaireIdValues = require('./asessQuestionnaireIdSelect.json'),*/
    selectQuestionValues = require('../../../model/questionsSelect.json')/**,
    selectUserStateValues = require('./userStateSelect.json') ,
    selectCondition = require('./thresholdTypeSelect.json') */;


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
  var createTextField = function (id, description, label, translate) {
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
/**
  if (is(element, 'bpmn:SequenceFlow')) {
    console.log(element);
    console.log(element.source);
    console.log(isConditionalSource(element.source));
  }
   */
  
  // create a selectBox only if the element is "Sequence Flow" -- can be modified to suit any purpose
  if (is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source) && isAssessQuestionnaireTask(element)) { //we need to modify this to select according to previous assess questionnaire settings
    switch (getQuestionnaireScoreType(element)) {
      case 'Check Questionnaire Score':
        group.entries.push(createSelectBox(
          'thresholdType',
          'Threshold Type',
          selectValues,
          translate
        ));
    
        group.entries.push(createTextField(
          'thresholdValue',
          'Fill in the value',
          'Value',
          translate
        ));
        
        break;
      case 'Check Question Answer Score':
        group.entries.push(createSelectBox(
          'questionAnswer',
          'Question Answer',
          selectQuestionValues,
          translate
        ));
        
        group.entries.push(createSelectBox(
          'thresholdType',
          'Threshold Type',
          selectValues,
          translate
        ));
    
        group.entries.push(createTextField(
          'thresholdValue',
          'Fill in the value',
          'Value',
          translate
        ));

        var questionAnswer = getExtensionElementValue(element, 'questionAnswer');
        
        var operator = '';
        switch(getExtensionElementValue(element, 'thresholdType')) {
          case 'Higher than':
            operator = '>';
            break;
          case 'Equal to':
            operator = '=';
            break;
          case 'Lower than':
            operator = '<';
            break;
          default:
            break;          
        }

        var value = getExtensionElementValue(element, 'thresholdValue');

        console.log("script for sequenceFlow comparison is", '${'+questionAnswer+operator+value+'}');
        console.log(element);

        var values = {
          conditionType: 'expression',
          condition: '${'+questionAnswer+operator+value+'}'
        };

        // conditionalProps.set(element, values, null); // only works for expression type

        break;
    };
    

    };


};

    // utilities //////////////////////////

var CONDITIONAL_SOURCES = [
    // 'bpmn:Activity',
    'bpmn:ExclusiveGateway',
    'bpmn:InclusiveGateway',
    'bpmn:ComplexGateway'
];
  
function isConditionalSource(element) {
    return isAny(element, CONDITIONAL_SOURCES);
}

function isAssessQuestionnaireTask(element) {
  return ((getBusinessObject(element.source.incoming[0]).sourceRef.class === 'com.healthentia.camunda.programme1.ProcessQuestionnaire') ? true : false)
}

function getQuestionnaireScoreType(element) {
  var camundaProperties = findExtension(getBusinessObject(element.source.incoming[0]).sourceRef.extensionElements, 'camunda:Properties');
  if (camundaProperties != null) {
    var camundaProperty = findCamundaProperty(camundaProperties, { 'name': 'clinicalPathwayTaskOption' });
    return camundaProperty.value;
  } else {
    return '';
  }
       
}

function getExtensionElementValue(element, propertyName) {
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
    return camundaProperties[0].value;
  } else {
    return '';
  }
}

