# camunda-bpmn-js-webapp

WebApp that serves [camunda-bpmn-js](https://github.com/camunda/camunda-bpmn-js) in a browser. 

## Usage

This project is designed to deliver a webapp serving a modeler based on the [camunda-bpmn-js](https://github.com/camunda/camunda-bpmn-js) embeddable Camunda modeling distribution.


## Build and Run
Make sure you are using Node v14

Prepare the project by installing all dependencies:

```sh
npm install
```

Then, depending on your use-case, you may run any of the following commands:

```sh
# build the library and run all tests
npm run all

# run the webapp
npm start
```

## Related

camunda-bpmn-js-webapp builds on top of a few powerful tools:

* [bpmn-js](https://github.com/bpmn-io/bpmn-js): View and edit BPMN 2.0 diagrams in the browser
* [diagram-js](https://github.com/bpmn-io/diagram-js): Diagram rendering and editing toolkit
* [camunda-bpmn-js](https://github.com/camunda/camunda-bpmn-js): Embeddable Camunda modeling distributions based on [bpmn-js](https://github.com/bpmn-io/bpmn-js).

## License

MIT

Uses [bpmn-js](https://github.com/bpmn-io/bpmn-js) licensed under the bpmn.io license.
