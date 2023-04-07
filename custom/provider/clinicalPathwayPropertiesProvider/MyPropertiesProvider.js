var inherits = require('inherits');

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

const HIGH_PRIORITY = 1500,
      LOW_PRIORITY = 500;

// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';
import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';
import executableProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ExecutableProps';
import eventProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps';


//Require camunda properties
import properties from 'bpmn-js-properties-panel/lib/provider/camunda/parts/PropertiesProps';
import serviceTaskDelegateProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ServiceTaskDelegateProps.js';
import scriptProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/ScriptTaskProps';
import conditionalProps from './parts/ConditionalProps';
import startEventInitiator from 'bpmn-js-properties-panel/lib/provider/camunda/parts/StartEventInitiator.js';

// Require custom property entries.
import myProps from './parts/MyProps.js';
import { get } from 'min-dash';

import clinicalPathwayType from './parts/ClinicalPathwayTypeProps.js';
import sequenceFlow from './parts/SequenceFlowProps.js';
import ColorPicker from './parts/ColorPicker.js';

// The general tab contains all bpmn relevant properties.
// The properties are organized in groups.
function createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate) {
    var generalGroup = {
        id: 'general',
        label: 'General',
        entries: []
    };

    idProps(generalGroup, element, translate);
    nameProps(generalGroup, element, bpmnFactory, canvas, translate);
    processProps(generalGroup, element, translate);
    executableProps(generalGroup, element, translate);

    var detailsGroup = {
        id: 'details',
        label: translate('Details'),
        entries: []
    };

    eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);
    serviceTaskDelegateProps(detailsGroup, element, bpmnFactory, translate);
    scriptProps(detailsGroup, element, bpmnFactory, translate);
    conditionalProps(detailsGroup, element, bpmnFactory, translate);
    startEventInitiator(detailsGroup, element, translate); // this must be the last element of the details group!

    var documentationGroup = {
        id: 'documentation',
        label: 'Documentation',
        entries: []
    };

    documentationProps(documentationGroup, element, bpmnFactory, translate);

    return [
        generalGroup,
        detailsGroup,
        documentationGroup
    ];
}

// Create the custom service tab -- we will modify this to add color picker tab & extensions tab
function createServiceTabGroups(element, translate) {
    // Create a group called "Service Properties".
    var serviceGroup = {
        id: 'service-tab',
        label: 'Service Properties',
        entries: []
    };

    // Add the service props to the serviceGroup group.
    myProps(serviceGroup, element, translate);

    return [
        serviceGroup
    ];
}

function createColorTabGroups(element, bpmnFactory, canvas, elementRegistry, modeling, translate) {
    var colorGroup = {
      id: 'colorGroup',
      label: 'Colors',
      entries: []
    };
    ColorPicker(colorGroup, element, modeling, translate);
    return [colorGroup];
  }

function createExtensionElementsGroups(element, bpmnFactory, elementRegistry, translate) {

    var clinicalPathwayTypeGroup = {
      id: 'extensionElements-clinicalPathwayTypeSettings',
      label: translate('Clinical Pathway Type Settings'),
      entries: []
    }
  
    //Add the custom props to theclinicalPathwayTypeGroup
    clinicalPathwayType(clinicalPathwayTypeGroup, element, bpmnFactory, translate);
  
    var sequenceFlowGroup = {
      id: 'extensionElements-sequenceFlowSettings',
      label: translate('Sequence Flow Settings'),
      entries: []
    }
  
    //Add the custom props to the sequenceFlowGroup
    sequenceFlow(sequenceFlowGroup, element, bpmnFactory, translate);
  
    var entries = [
      clinicalPathwayTypeGroup,
      sequenceFlowGroup
    ];
    
    return entries;
  
  }

export default function MyPropertiesProvider (eventBus, bpmnFactory, canvas, elementRegistry, modeling, translate) {
    
    PropertiesActivator.call(this, eventBus);

    console.log('We hit the constructor');

    /** 
    constructor(eventBus, bpmnFactory, elementRegistry, elementTemplates, translate) {
        super(eventBus, HIGH_PRIORITY);

        this.bpmnFactory = bpmnFactory;
        this.elementRegistry = elementRegistry;
        this.elementTemplates = elementTemplates;
        this.translate = translate;
    }

    isEntryVisible = function (element, entry, group, tab) {
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
                if ((is(element, 'bpmn:ServiceTask' )) && (getBusinessObject(element).id.startsWith('Activity_Clinical_Pathway_'))) {
                return false;
                break;
                }
                if (is(element, 'bpmn:SequenceFlow' )) {
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

    isPropertyEditable = function (propertyName, element, entry, group, tab) {

        if (entry.id === 'properties') {
          if (propertyName === 'name')
            return false;
        }  // inactivates only the name field of the  propertyEntry in Extensions tab,
      
        if (element.businessObject.id.startsWith('Activity_Clinical_Pathway_'))  {
          if (propertyName === 'id') 
            return false;
        } // inactivates the id of the Clinical Pathway task so it cannot be edited
      
        return true;
    };
    
 */


    this.getTabs = function (element) {

        var generalTab = {
            id: 'general',
            label: 'General',
            groups: createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate)
        };

        // The "service" tab //we don't need it now
        /**
        var serviceTab = {
            id: 'service',
            label: 'Properties',
            groups: createServiceTabGroups(element)
        };
        
 */

        if (element.businessObject.di) {
            var colorTab = {
              id: 'color',
              label: 'Colors',
              groups: createColorTabGroups(element, bpmnFactory, canvas, elementRegistry, modeling, translate)
            };
        }

        var extensionsTab = {
            id: 'extensionElements',
            label: translate('Extensions'),
            groups: createExtensionElementsGroups(element, bpmnFactory, elementRegistry, translate)
        };

        // Show general + "service" tab
        return [
            generalTab,
            // serviceTab
            colorTab,
            extensionsTab
        ];
    };

}

// MyPropertiesProvider.$inject = ['eventBus', 'bpmnFactory', 'elementRegistry', 'elementTemplates', 'translate'];
inherits(MyPropertiesProvider, PropertiesActivator);

