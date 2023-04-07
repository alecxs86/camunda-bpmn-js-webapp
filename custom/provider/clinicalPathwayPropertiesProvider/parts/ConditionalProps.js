'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny,
    find = require('lodash/collection').find,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    escapeHTML = require('bpmn-js-properties-panel/lib/Utils').escapeHTML, //modify
    domQuery = require('min-dom').query,
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'), //modify
    elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper'), //modify
    eventDefinitionHelper = require('bpmn-js-properties-panel/lib/helper/EventDefinitionHelper'), //modify
    scriptImplementation = require('bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/Script'); //modify

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

module.exports = function(group, element, bpmnFactory, translate) {
  var bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  var conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(element);

  if (!(is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source))
    && !conditionalEventDefinition) {
    return;
  }

  var script = scriptImplementation('language', 'body', true, translate);
  group.entries.push({
    id: 'condition',
    label: translate('Condition'),
    html: '<div class="bpp-row">' +
              '<label for="cam-condition-type">'+ escapeHTML(translate('Condition Type')) + '</label>' +
              '<div class="bpp-field-wrapper">' +
                '<select id="cam-condition-type" name="conditionType" data-value>' +
                  '<option value="expression">'+ escapeHTML(translate('Expression')) + '</option>' +
                  '<option value="script">'+ escapeHTML(translate('Script')) + '</option>' +
                  '<option value="" selected></option>' +
                '</select>' +
              '</div>' +
            '</div>' +

            // expression
            '<div class="bpp-row">' +
              '<label for="cam-condition" data-show="isExpression">' + escapeHTML(translate('Expression')) + '</label>' +
              '<div class="bpp-field-wrapper" data-show="isExpression">' +
                '<input id="cam-condition" type="text" name="condition" />' +
                '<button class="action-button clear" data-action="clear" data-show="canClear">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
              '<div data-show="isScript">' +
                script.template +
              '</div>' +
            '</div>',

    get: function(element, propertyName) {
      var conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(element);

      var conditionExpression = conditionalEventDefinition
        ? conditionalEventDefinition.condition
        : bo.conditionExpression;

      var values = {},
          conditionType = '';

      if (conditionExpression) {
        var conditionLanguage = conditionExpression.language;
        if (typeof conditionLanguage !== 'undefined') {
          conditionType = 'script';
          values = script.get(element, conditionExpression);
        } else {
          conditionType = 'expression';
          if (is(element, 'bpmn:SequenceFlow') && (getExtensionElementValue(element, 'thresholdValue')!=null)) {

            var questionAnswer = getExtensionElementValue(element, 'questionAnswer') || 'score';
        
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

            values.condition = '${'+questionAnswer+operator+value+'}';
          } else {
              values.condition = conditionExpression.get('body');
          }
          
        }
      }

      values.conditionType = conditionType;

      return values;

    },

    set: function(element, values, containerElement) {
        if (getExtensionElementValue(element, 'thresholdValue')!=null) {
            var conditionType = 'expression';
        } else {
            var conditionType = values.conditionType;
        }
      
      var commands = [];

      var conditionProps = {
        body: undefined
      };

      if (conditionType === 'script') {
        conditionProps = script.set(element, values, containerElement);
      } else {
        var condition = values.condition;

        //ToDo: introduce a condition that is extracted from SequenceFlow
        if (is(element, 'bpmn:SequenceFlow') && (getExtensionElementValue(element, 'thresholdValue')!=null)) {

          var questionAnswer = getExtensionElementValue(element, 'questionAnswer') || 'score';
        
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
          
          conditionProps.body = '${'+questionAnswer+operator+value+'}';
        } else {
            conditionProps.body = condition;
        }
      }

      var conditionOrConditionExpression;

      if (conditionType) {
        conditionOrConditionExpression = elementHelper.createElement(
          'bpmn:FormalExpression',
          conditionProps,
          conditionalEventDefinition || bo,
          bpmnFactory
        );

        var source = element.source;

        // if default-flow, remove default-property from source
        if (source && source.businessObject.default === bo) {
          commands.push(cmdHelper.updateProperties(source, { 'default': undefined }));
        }
      }

      var update = conditionalEventDefinition
        ? { condition: conditionOrConditionExpression }
        : { conditionExpression: conditionOrConditionExpression };

      commands.push(cmdHelper.updateBusinessObject(element, conditionalEventDefinition || bo, update));

      return commands;
    },

    validate: function(element, values) {
      var validationResult = {};

      if (!values.condition && values.conditionType === 'expression') {
        validationResult.condition = translate('Must provide a value');
      }
      else if (values.conditionType === 'script') {
        validationResult = script.validate(element, values);
      }

      return validationResult;
    },

    isExpression: function(element, inputNode) {
      var conditionType = domQuery('select[name=conditionType]', inputNode);
      if (conditionType.selectedIndex >= 0) {
        return conditionType.options[conditionType.selectedIndex].value === 'expression';
      }
    },

    isScript: function(element, inputNode) {
      var conditionType = domQuery('select[name=conditionType]', inputNode);
      if (conditionType.selectedIndex >= 0) {
        return conditionType.options[conditionType.selectedIndex].value === 'script';
      }
    },

    clear: function(element, inputNode) {

      // clear text input
      domQuery('input[name=condition]', inputNode).value='';

      return true;
    },

    canClear: function(element, inputNode) {
      var input = domQuery('input[name=condition]', inputNode);

      return input.value !== '';
    },

    script : script,

    cssClasses: [ 'bpp-textfield' ]
  });
};


// utilities //////////////////////////

var CONDITIONAL_SOURCES = [
  'bpmn:Activity',
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway'
];

function isConditionalSource(element) {
  return isAny(element, CONDITIONAL_SOURCES);
}

function getCamundaPropertiesValue(element, propertyName) {
    var camundaProperties = findExtension(getBusinessObject(element), 'camunda:Properties');
    if (camundaProperties != null) {
        var camundaProperty = findCamundaProperty(camundaProperties, { 'name': propertyName });
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