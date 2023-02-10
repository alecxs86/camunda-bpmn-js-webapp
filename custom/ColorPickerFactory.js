var domify = require('min-dom').domify;

var domQuery = require('min-dom').query;

var escapeHTML = require('bpmn-js-properties-panel/lib/Utils.js').escapeHTML;

var entryFieldDescription = require('bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js');

var getFillColor = require('bpmn-js/lib/draw/BpmnRenderUtil.js').getFillColor;

var getStrokeColor = require('bpmn-js/lib/draw/BpmnRenderUtil.js').getStrokeColor;

function ensureNotNull(prop) {
  if (!prop) {
    throw new Error(prop + ' must be set.');
  }

  return prop;
}

module.exports = function (modeling, translate, options) {
  var registered = false;

  var setDefaultParameters = function setDefaultParameters(options, modeling) {
    var registerEventListener = function registerEventListener(element) {
      var colorDOM = domQuery('input[id="color-' + options.id + '"]');

      var changeCallback = function changeCallback(color) {
        var set = options.set || defaultSet;
        var values = {},
            prop = ensureNotNull(options.fillOrStroke);
        values[prop] = color;
        set(element, values);
      };

      if (!registered && colorDOM) {
        colorDOM.addEventListener("change", function () {
          changeCallback(colorDOM.value);
        }, false);
        registered = true;
      }
    };

    function getColor(element, fillOrStroke) {
      fillOrStroke = fillOrStroke || options.fillOrStroke;

      if (fillOrStroke === "fill") {
        return getFillColor(element, "#ffffff");
      }

      if (fillOrStroke === "stroke") {
        return getStrokeColor(element, "#000000");
      }
    } // default method to fetch the current color value


    var defaultGet = function defaultGet(element) {
      var res = {},
          prop = ensureNotNull(options.fillOrStroke);
      res[prop] = getColor(element, prop);
      return res;
    }; // default method to set a new color value


    var defaultSet = function defaultSet(element, values) {
      var res = {},
          prop = ensureNotNull(options.fillOrStroke);

      if (values[prop] !== '') {
        res[prop] = values[prop];
      } else {
        res[prop] = undefined;
      }

      modeling.setColor(element, res);
    };

    return {
      id: options.id,
      description: options.description || '',
      get: options.get || defaultGet,
      set: options.set || defaultSet,
      validate: registerEventListener,
      html: ''
    };
  };

  var resource = setDefaultParameters(options, modeling),
      label = options.label || resource.id,
      dataValueLabel = options.dataValueLabel,
      canBeDisabled = !!options.disabled && typeof options.disabled === 'function',
      canBeHidden = !!options.hidden && typeof options.hidden === 'function',
      description = options.description;
  resource.html = domify('<label for="camunda-' + escapeHTML(resource.id) + '" ' + (canBeDisabled ? 'data-disable="isDisabled" ' : '') + (canBeHidden ? 'data-show="isHidden" ' : '') + (dataValueLabel ? 'data-value="' + escapeHTML(dataValueLabel) + '"' : '') + '>' + escapeHTML(label) + '</label>' + '<div class="bpp-field-wrapper" ' + (canBeDisabled ? 'data-disable="isDisabled"' : '') + (canBeHidden ? 'data-show="isHidden"' : '') + '>' + '<input type="color" id="color-' + escapeHTML(resource.id) + '" ' + 'value="' + options.value + '" ' + '"/>' + '</div>'); // add description below text input entry field

  if (description) {
    resource.html.appendChild(entryFieldDescription(translate, description, {
      show: canBeHidden && 'isHidden'
    }));
  }

  if (canBeDisabled) {
    resource.isDisabled = function () {
      return options.disabled.apply(resource, arguments);
    };
  }

  if (canBeHidden) {
    resource.isHidden = function () {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-colorpicker'];
  return resource;
};