'use strict';

const { getBusinessObject } = require("bpmn-js/lib/util/ModelUtil");
var is = require('bpmn-js/lib/util/ModelUtil').is;

var DEFAULT_PRIORITY = 1000;


/**
 * A component that decides upon the visibility / editable
 * state of properties in the properties panel.
 *
 * Implementors must subclass this component and override
 * {@link PropertiesActivator#isEntryVisible} and
 * {@link PropertiesActivator#isPropertyEditable} to provide
 * custom behavior.
 *
 * @class
 * @constructor
 *
 * @param {EventBus} eventBus
 * @param {Number} [priority] at which priority to hook into the activation
 */
function PropertiesActivator(eventBus, priority) {
  var self = this;

  priority = priority || DEFAULT_PRIORITY;

  eventBus.on('propertiesPanel.isEntryVisible', priority, function (context) {
    var element = context.element,
      entry = context.entry,
      group = context.group,
      tab = context.tab;

    return self.isEntryVisible(element, entry, group, tab);
  });

  eventBus.on('propertiesPanel.isPropertyEditable', priority, function (context) {
    var element = context.element,
      entry = context.entry,
      group = context.group,
      propertyName = context.propertyName,
      tab = context.tab;

    return self.isPropertyEditable(propertyName, element, entry, group, tab);
  });
}

PropertiesActivator.$inject = ['eventBus'];

module.exports = PropertiesActivator;


/**
 * Should the given entry be visible for the specified element.
 *
 * @method  PropertiesActivator#isEntryVisible
 *
 * @param {ModdleElement} element
 * @param {Object} entry
 * @param {Object} group
 * @param {Object} tab
 *
 * @returns {boolean}
 */
PropertiesActivator.prototype.isEntryVisible = function (element, entry, group, tab) {
// we iterate through tabs and groups and hide the ones we do not want
  switch (tab.id) {
    case 'general':
      switch (group.id) {
        case 'externalTaskConfiguration':
          return false;
          break;
        case 'multiInstance':
          return false;
          break;
        case 'async':
          return false;
          break;
        case 'jobConfiguration':
          return false;
          break;
        case 'candidateStarterConfiguration':
          return false;
          break;
        case 'historyConfiguration':
          return false;
          break;
        case 'tasklist':
          return false;
          break;
        default:
          return true;
      }
    case 'listeners':
      return false;
      break;
    case 'field-injections':
      return false;
      break;
    case 'input-output':
      return false;
      break;
    case 'connector':
      return false;
      break;
    case 'extensionElements':
      switch (group.id) {
        case 'extensionElements-properties':
          if ((is(element, 'bpmn:Task' )) && (getBusinessObject(element).name == 'Set User State')) {
            return false;
            break;
          }
        default:
          return true;  
      }
    default:
      return true;
  }
}


  // in case the activity is "set User State" we hide the Properties group, leaving only the User State Settings group

/**
 * Should the given property be editable for the specified element
 *
 * @method  PropertiesActivator#isPropertyEditable
 *
 * @param {string} propertyName
 * @param {ModdleElement} element
 * @param {Object} entry
 * @param {Object} group
 * @param {Object} tab
 *
 * @returns {boolean}
 */
PropertiesActivator.prototype.isPropertyEditable = function (propertyName, element, entry, group, tab) {

  if (entry.id === 'properties') {
    if (propertyName === 'name')
      return false;
  }  // inactivates only the name field of the  propertyEntry in Extensions tab,
  
  if (element.businessObject.name === 'Get Weight' || element.businessObject.name === 'Set User State' ) {
    if (propertyName === 'id') 
      return false;
  } // inactivates the id of the Get Weight task so it cannot be edited
    

  return true;
};