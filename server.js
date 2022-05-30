require('dotenv').config()
const os = require('os')
const opcua = require("node-opcua");
const tags = require('./tags.json');
var addressSpace, namespace;
// Let's create an instance of OPCUAServer
var host=process.env.HOST
var port=process.env.PORT
var resourcePath = '/UA/lucaPLC'
var storedValues = [];

console.log('\n.............................................');
console.log("..       Initializing OPC-UA server        ..");
console.log('.............................................');

const userManager = {
    isValidUser: function (userName, password) {
        console.log('CREDENTIALS');
        console.log(username);
        console.log(password);
        if (userName === "user1" && password === "password1") {
            return true;
        }
        if (userName === "user2" && password === "password2") {
            return true;
        }
        return false;
    }
};

const server = new opcua.OPCUAServer({
    hostname: host,
    port: 48000, // the port of the listening socket of the server
    resourcePath: resourcePath, // this path will be added to the endpoint resource name
    buildInfo: {
        productName: "luca_node_plc",
        buildNumber: "0001",
        buildDate: new Date(2020, 10, 21)
    }
});
//    userManager: userManager,
//    allowAnonymous: true,

const addTags = () => {
    console.log('\n.............................................')
    console.log('..               Adding TAGS               ..')
    console.log('.............................................')
    const device = namespace.addFolder("ObjectsFolder", {
      browseName: "RaspberryPi 3 on Attic"
    });
  

    for (var i = 0; i < tags.length; i++) {

        let nodeId = tags[i].nodeId;
        let browseName = tags[i].browseName;
        let dataType = tags[i].dataType;
        let func = tags[i].func;
        let seed = 0
        if (tags[i].hasOwnProperty(seed))
            seed = tags[i].seed
	storedValues.push(tags[i].storedValue);
        let value = 0;

        namespace.addVariable({
            componentOf: device,
            nodeId: nodeId, // a string nodeID
            browseName: browseName,
            dataType: dataType,
            value: {
                get: function () {
                    var idx = tags.findIndex(i => i.nodeId === nodeId);
                    if (tags[idx].seed == 'sense') {
                        if (senseData.hasOwnProperty(tags[idx].browseName)) {
                            value = eval(func);
                        } else {
                            value = null
                        }
                    } else {
                        value = eval(func);
                    };
                    console.log(`${tags[idx].browseName}: ${value}`);
                    return new opcua.Variant({
                        dataType: dataType,
                        value: value
                    });
                },
                set: function (variant) {
                    console.log(variant)
                    var idx = tags.findIndex(i => i.nodeId === nodeId);
                    console.log(idx);
                    console.log(tags[idx]);
                    if (tags[idx].hasOwnProperty('storedValue')) {
                        console.log(`${tags[idx].browseName}: ${variant.value}`);
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
    console.log(namespace.namespaceUri);
}

const g = () => {
    const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
    console.log('\n.............................................');
    console.log(`Server started (press CTRL+C to stop)`);
    console.log(`   ${endpointUrl}`);
    console.log('.............................................\n');
}

const f = () => {
    construct_my_address_space();
    addTags();
    server.start(g)
}

server.initialize(f)
