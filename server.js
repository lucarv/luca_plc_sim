require('dotenv').config();

const os = require('os')
const opcua = require("node-opcua");
const tags = require('./tags.json');
var addressSpace, namespace;
var host = process.env.HOST;
var port = process.env.PORT;
var resourcePath = process.env.RESOURCEPATH;

const server = new opcua.OPCUAServer({
    alternateHostname: host,
    port: port, // the port of the listening socket of the server
    resourcePath: resourcePath, // this path will be added to the endpoint resource name
    buildInfo: {
        productName: "NODE-OPCUA server",
        buildNumber: "7658",
        buildDate: new Date(2020, 6, 8)
    }
});

const addTags = () => {
    console.log('\n...........................................')
    console.log('# Adding TAGS')
    const device = namespace.addFolder("ObjectsFolder", {
        browseName: "Fake PLC"
    });

    for (var i = 0; i < tags.length; i++) {
        console.log('...........................................')
        let nodeId = tags[i].nodeId;
        console.log('Adding NodeId: ' + nodeId);
        console.log('...........................................')
        let browseName = tags[i].browseName;
        let dataType = tags[i].dataType;
        let func = tags[i].func;
        let seed = 0
        if (tags[i].hasOwnProperty(seed)) {
            seed = tags[i].seed
        }
        let value = eval(func);

        namespace.addVariable({
            componentOf: device,
            nodeId: nodeId, // a string nodeID
            browseName: browseName,
            dataType: dataType,
            value: {
                get: function () {
                    var idx = tags.findIndex(i => i.nodeId === nodeId);
                    return new opcua.Variant({
                        dataType: dataType,
                        value: value
                    });
                },
                set: function (variant) {
                    if (tags[idx].hasOwnProperty('storedValue')) {
                        tags[idx].storedValue = parseInt(variant.value);
                        return opcua.StatusCodes.Good;
                    } else return opcua.statusCodes.Bad
                }
            }
        });
    }
}

const construct_my_address_space = () => {
    addressSpace = server.engine.addressSpace;
    namespace = addressSpace.getOwnNamespace();
    console.log('ApplicationUri: ' + namespace.namespaceUri);
}

const g = () => {
    const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
    console.log(`Server ${endpointUrl} is now listening ... ( press CTRL+C to stop)`);
    let UAObject = addressSpace.rootFolder
    //console.log(UAObject.browseName)
    //console.log(UAObject.objects.browseName)

}

server.initialize(() => {
    console.log('\n...........................................')
    console.log("initialize OPCUA server now ...");
    construct_my_address_space();
    addTags();
    server.start(g)
});