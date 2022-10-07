
'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');
var extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
var extensionElements = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements');
var is = require('bpmn-js/lib/util/ModelUtil').is;
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
var find = require('lodash/collection').find;

var selectMeasurementValues = require('./measurementSelect.json');
var selectThresholdTypeValues =require('./thresholdTypeSelect.json');
var checkMeasurementSetting = require('./CheckMeasurementSettings');

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
      var measurementType = findCamundaProperty(camundaProperties, { 'name': 'measurementType' });
    }
    if (measurementType != null) {
      var returnValue = {};

      switch (measurementType.value) {
        case 'Weight':
          returnValue[propertyName] = 'weight';
          break;
        case 'Blood Pressure':
          returnValue[propertyName] = 'bloodPres';
          break;
        case 'Number of Steps':
          returnValue[propertyName] = 'noSteps';
          break;
        default:
          returnValue[propertyName] = '';
      }
      return returnValue;
    } else {
      return '';
    }
  };

  var setElementValue = function (element, values, node, propertyName) {
    var bo = getBusinessObject(element);
    // var entry = values; // here we need to change values into something we need
   

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
    console.log(values);

    // works but cannot be called because we make the textBox read only
    // var measurementType = findCamundaProperty(camundaProperties, { 'name': 'measurementType' });
    // console.log(measurementType.value);
    // if (measurementType != null) {
    //   values = measurementType.value;
    // }

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
  var createTextField = function (id, label, translate) {
    return entryFactory.textField(translate, {
      id: id,
      description: label,
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

  // create a selectBox only if the activity type is "Check Measurement" -- can be modified to suit any purpose
  if ((is(element, 'bpmn:Task')) && (getBusinessObject(element).name == 'Check Measurement')) {
    group.entries.push(createTextField(
      'measurementOutput',
      'Measurement Output Variable',
      translate
    ));
  }
}