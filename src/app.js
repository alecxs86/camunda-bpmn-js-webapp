require('default-passive-events');
import $ from 'jquery';
import BpmnModeler from 'camunda-bpmn-js/lib/camunda-platform/Modeler';

import checkAccess from './accessControl.js';

import customControlsModule from '../custom';
import myPropertiesProviderModule from '../custom/provider';
import customTranslate from '../custom/translate/customTranslate';

var customTranslateModule = {
  translate: [ 'value', customTranslate ]
};

import 'camunda-bpmn-js/dist/assets/camunda-platform-modeler.css';

import { debounce } from 'min-dash';

import diagramXML from '../resources/newDiagram.bpmn';

var container = $('#js-drop-zone');

var canvas = $('#js-canvas');

var deployer = null;

var bpmnModeler = null;

// console.log(req.headers);

// const token = req.headers.authorization; // Retrieve the token from the request headers

const queryString = window.location.search;

const params = new URLSearchParams(queryString);

const token = params.get('token');

console.log(token);

// const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lc3RhbXAiOjE2ODk3NzI5MTEsIm5hbWUiOiJHaWNhIER1cnUiLCJpYXQiOjE2OTA1NTIwOTUsImV4cCI6MTY5MDU1NTY5NX0.vli5txXxddTN91fzPujJDGI9nkTwqdqd0Yon0hW450U';

checkAccess(token).then(accessAllowed => {
  if (accessAllowed) {
    // Make API request or perform other actions
  
  bpmnModeler = new BpmnModeler({
    container: '#canvas',
    textRenderer: { // do not know yet how to make it inside the custom renderer
      defaultStyle: {
        fontFamily: 'verdana'
      }
    },
    propertiesPanel: {
      parent: '#properties'
    },
    additionalModules: [
      customControlsModule,
      customTranslateModule,
      myPropertiesProviderModule
    ]
  });
  
  container.removeClass('with-diagram');

  $(function() {

    $('#js-create-diagram').click(function(e) {
      e.stopPropagation();
      e.preventDefault();
  
      createNewDiagram();
    });
  
    $('.buttons a').click(function(e) {
      if (!$(this).is('.active')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  
    var exportArtifacts = debounce(function() {
  
      saveSVG();
      saveDiagram();
  
    }, 500);
  
  
    bpmnModeler.on('commandStack.changed', exportArtifacts);
    bpmnModeler.on('comments.updated', exportArtifacts);
  
    bpmnModeler.on('canvas.click', function() {
      bpmnModeler.get('comments').collapseAll();
    });
  
    function debounce(fn, timeout) {
  
      var timer;
    
      return function() {
        if (timer) {
          clearTimeout(timer);
        }
    
        timer = setTimeout(fn, timeout);
      };
    };
  
  });
  
  } else {
    // Show error message or redirect to an access denied page
    window.location.href = 'access-denied.html';
  }
}).catch(error => {
  console.error('Error occurred while checking access:', error);
});


function createNewDiagram() {
  openDiagram(diagramXML);
}



async function openDiagram(xml) {

  try {

    await bpmnModeler.importXML(xml);

    container
      .removeClass('with-error')
      .addClass('with-diagram');
  } catch (err) {

    container
      .removeClass('with-diagram')
      .addClass('with-error');

    container.find('.error pre').text(err.message);

    console.error(err);
  }
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


////// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}


function setEncoded(link, name, data) {
  var encodedData = encodeURIComponent(data);

  if (data) {
    link.addClass('active').attr({
      'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
      'download': name
    });
  } else {
    link.removeClass('active');
  }
}

async function saveSVG() {
  try {
    const result = await bpmnModeler.saveSVG();
    const { svg } = result;
    const { err } = result;
    var downloadSvgLink = $('#js-download-svg');
    setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
  }
  catch(err) {
    console.log(err);
  }
}

async function saveDiagram() {
  try {
    const result = await bpmnModeler.saveXML({ format: true });
    const { xml } = result;
    const { err } = result;
    var downloadLink = $('#js-download-diagram');
    setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
  }
  catch(err) {
    console.log(err);
  }
}


