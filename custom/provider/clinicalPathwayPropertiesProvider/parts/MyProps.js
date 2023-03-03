import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import {is} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element, translate) { //here we will add all the changes we did in the dependencies folder

  if (is(element, 'bpmn:ServiceTask')) {
    group.entries.push(entryFactory.selectBox(translate, {
      id : 'cloudProvider',
      description : 'Specify the Cloud Provider of the Service',
      label : 'Cloud Provider',
      selectOptions : [{value: 'aws', name: 'Amazon Web Services'}, {value: 'azure', name: 'Microsoft Azure'}],
      modelProperty : 'cloudProvider'
    }));

    group.entries.push(entryFactory.selectBox(translate, {
      id : 'service',
      description : 'Specify the Service',
      label : 'Cloud Service',
      selectOptions: [
                            { name: 'Simple Storage Service (S3)', value: 'awsS3' }, 
                            { name: 'DynamoDB', value: 'awsDynamoDB' }, 
                            { name: 'Elastic File System (EFS)', value: 'awsEFS' },
                            { name: 'Blob Storage', value: 'azureBlobStorage' } 
                     ],
      modelProperty : 'service'
    }));

    group.entries.push(entryFactory.textField(translate, {
      id : 'awsAccountRegion',
      description : 'Specify the AWS Account Region',
      label : 'AWS Account Region',
      modelProperty : 'awsAccountRegion'
    }));
  }

  if (is(element, 'bpmn:ServiceTask')) {
    // This is where I wanna create text inputs and select boxes 
    // for the arrow depending on the input of the user in the 
    // data store of this DataInputAssociation arrow
  }

}