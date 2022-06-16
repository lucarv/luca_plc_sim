

require('dotenv').config()
const os = require('os')
const opcua = require("node-opcua");
//const tags = require('./tags.json');
var addressSpace, namespace;
var host = process.env.HOST;
var port = parseInt(process.env.PORT) || 48000;
var resourcePath = process.env.RP || '/UA/lucaPLC';

const server_options = {
    hostname: process.env.HOST,
    port, // the port of the listening socket of the server
    resourcePath, // this path will be added to the endpoint resource name
    buildInfo: {
        productName: "luca_node_plc",
        buildNumber: "0001",
        buildDate: new Date(2020, 10, 21)
    }
}

var storedValues = [];
var sangle = 0, cangle = 0, prodcounter = 0;

const generate_sine = () => {
    let sina = Math.sin(sangle * (Math.PI / 180));
    sangle += 15;
    if (sangle > 360) sangle = 0;
    return sina
}

const generate_cosine = () => {
    let cosa = Math.cos(cangle * (Math.PI / 180));
    cangle += 15;
    if (cangle > 360) cangle = 0;
    return cosa
}

const generate_torque = () => {
    let i = Math.random();
    //generate some spikes
    if (Math.round(i * 1000) % 191 == 0)
        i *= 10;
    return i
}

const increase_prodcounter = () => {
    let i = Math.random();
    if (Math.round(i * 1000) % 13 == 0) 
	prodcounter += 1;
    return prodcounter;
}

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

const server = new opcua.OPCUAServer(server_options);
//    userManager: userManager,
//    allowAnonymous: true,

const addTags = () => {
    console.log('\n.............................................')
    console.log('..               Adding TAGS               ..')
    console.log('.............................................')
    const device = namespace.addFolder("ObjectsFolder", {
        browseName: "node opcua in an azure container instance"
    });

    console.log('..     Adding a sine function generator    ..');
    const sine = namespace.addVariable({
        componentOf: device,
	nodeId: "ns=1;s=sine",
        browseName: "Sine Function",
        dataType: "Double",
        minimumSamplingInterval: 100,
    });
    // change every 1000 ms
    const stimerId = setInterval(() => { let val = generate_sine(); sine.setValueFromSource({ dataType: opcua.DataType.Double, value: val }) }, 1000);

    console.log('..    Adding a cosine function generator   ..');
    const cosine = namespace.addVariable({
        componentOf: device,
        nodeId: "ns=1;s=cosine",
        browseName: "Cosine Function",
        dataType: "Double",
        minimumSamplingInterval: 100,
    });
    // change every 1000 ms
    const ctimerId = setInterval(() => { let val = generate_cosine(); cosine.setValueFromSource({ dataType: opcua.DataType.Double, value: val }) }, 1000);

    console.log('..         Adding a torque variable        ..');
    const torque = namespace.addVariable({
        componentOf: device,
        nodeId: "ns=1;s=torque",
        browseName: "Torque",
        dataType: "Double",
        minimumSamplingInterval: 100,
    });
    // change every 1000 ms
    const ttimerId = setInterval(() => { let val = generate_torque(); torque.setValueFromSource({ dataType: opcua.DataType.Double, value: val }) }, 1000);

    console.log('..         Adding a product counter        ..');
    const prodcounter = namespace.addVariable({
        componentOf: device,
        nodeId: "ns=1;s=prodcounter",
        browseName: "Product Counter",
        dataType: "UInt32",
        minimumSamplingInterval: 100,
    });

    let counter = 0;
    // increase every minute
    const pctimerId = setInterval(() => { let val = increase_prodcounter(); prodcounter.setValueFromSource({ dataType: opcua.DataType.UInt32, value: val }) }, 60000);

    /*
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
    */
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
