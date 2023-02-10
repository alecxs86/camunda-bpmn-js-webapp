require('default-passive-events');
import $ from 'jquery';
import BpmnModeler from 'camunda-bpmn-js/lib/camunda-platform/Modeler';

import customControlsModule from '../custom';

//import ResourceDeployer from 'camunda-resource-deployer-js/lib/ResourceDeployer'
// var ResourceDeployer = require('camunda-resource-deployer-js');

import 'camunda-bpmn-js/dist/assets/camunda-platform-modeler.css';

import { debounce } from 'min-dash';

import diagramXML from '../resources/newDiagram.bpmn';

var container = $('#js-drop-zone');

var canvas = $('#js-canvas');

var deployer = null;

var bpmnModeler = new BpmnModeler({
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
    customControlsModule
  ]
});

container.removeClass('with-diagram');

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

// bootstrap diagram functions
/** 
$(function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');
  // var deployLink = $('#js-deploy-resource');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  **/
/**
  deployLink.click(function(e) {
    if(deployer) {
      return;
    }

    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.addEventListener('click', function() {
      $('#js-resource-deployer').toggleClass('active', false);
      deployer.close();
      deployer = null;
    });

    $('#js-resource-deployer').append(closeBtn);

    var filename = bpmnModeler.get('canvas').getRootElement().businessObject.name;
    if(filename) {
      filename += '.bpmn';
    }
    else {
      filename = 'process.bpmn';
    }

    deployer = new ResourceDeployer({
      apiUrl: 'http://localhost:8080/engine-rest',
      filename: filename,
      container: $('#js-resource-deployer')[0],
      resourceProvider: function(done) {
        bpmnModeler.saveXML(done); // maybe here we need an await?
      }
    });

    $('#js-resource-deployer').toggleClass('active');

  });
 */
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

  // var exportArtifacts = debounce(async function() {

  //   try {

  //     const { svg } = await bpmnModeler.saveSVG();

  //     setEncoded(downloadSvgLink, 'diagram.svg', svg);
  //   } catch (err) {

  //     console.error('Error happened saving SVG: ', err);

  //     setEncoded(downloadSvgLink, 'diagram.svg', null);
  //   }

  //   try {

  //     const { xml } = await bpmnModeler.saveXML({ format: true });

  //     setEncoded(downloadLink, 'diagram.bpmn', xml);
  //   } catch (err) {

  //     console.log('Error happened saving XML: ', err);

  //     setEncoded(downloadLink, 'diagram.bpmn', null);
  //   }

  //   // deployLink.addClass('active');
  // }, 500);
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

