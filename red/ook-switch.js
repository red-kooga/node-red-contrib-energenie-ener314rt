/*
** Node-red control of Energenie ENER314-RT board for remote control of radio sockets
** Author: Achronite, December 2018 - September 2019
**
** v0.3 Alpha
**
** File: ook-switch.js
** Purpose: Node-Red wrapper for call to switch node for ENER314-RT OOK device
**
*/
"use strict";

var ener314rt = require('energenie-ener314rt');

module.exports = function (RED) {

    function OokSwitchNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var board = RED.nodes.getNode(config.board);

        // CHECK CONFIG
        if (!board || board == null) {
            this.status({ fill: "red", shape: "ring", text: "Not configured" });
            return false;

        } else {

            this.on('input', function (msg) {

                this.status({ fill: "yellow", shape: "ring", text: "Sending" });
                var zone = Number(config.zone) || 0;
                var switchNum = Number(config.switchNum) || 1;
                var xmits = 20;

                // Check all variables before we call the C routine to transmit, msg.payload overrides any defaults set in node

                // Check ZONE
                if (msg.payload.zone !== undefined) {
                    // Override the zone set in the node properties
                    zone = msg.payload.zone;
                }
                // Set default zone if we still dont have one
                /*
                if ( zone === "" || zone == null || zone === undefined ) {
                    // Energenie 'random' 20 bit address is 0x6C6C6 # 0110 1100 0110 1100 0110
                    zone = 0;  // 0 indicates the C code will use the default zone
                }
                */

                // Check Switch Number
                if (switchNum < 0 || switchNum > 6 || isNaN(switchNum)) {
                    this.error("SwitchNum err: " + switchNum + " (" + typeof (switchNum) + ")");
                }


                // Check Switch State (default to off)
                var switchState = false;
                if (typeof msg.payload == typeof true)
                    switchState = msg.payload;
                else if (typeof msg.payload.powerOn == typeof true)
                    switchState = msg.payload.powerOn;
                else if (msg.payload === "on" || msg.payload.powerOn === "on")
                    switchState = true;

                // Check xmit times (advanced), 26ms per payload transmission
                if (Number(msg.payload.repeat))
                    xmits = Number(msg.payload.repeat);

                // Invoke C function to do the send
                ener314rt.ookSwitch(zone, switchNum, switchState, xmits);
                switch (switchState) {
                    case true:
                        node.status({ fill: "green", shape: "dot", text: "ON " + zone + ":" + switchNum });
                        break;
                    case false:
                        node.status({ fill: "red", shape: "ring", text: "OFF " + zone + ":" + switchNum });
                        break;
                }
                // return payload unchanged
                node.send(msg);

            });

            this.on('close', function () {
                // TODO: tidy up state
            });
        }
    }
    RED.nodes.registerType("ook-switch", OokSwitchNode);


    RED.httpAdmin.get("/ook/teach", function (req, res) {
        var zone = Number(req.query.zone) || 0;
        var switchNum = Number(req.query.switchNum) || 1;
        ener314rt.ookSwitch(zone, switchNum, true, 20);
        res.sendStatus(200);
    });

    RED.httpAdmin.get("/ook/off", function (req, res) {
        var zone = Number(req.query.zone) || 0;
        var switchNum = Number(req.query.switchNum) || 1;
        ener314rt.ookSwitch(zone, switchNum, false, 20);
        res.sendStatus(200);
    });
}
