var WebSocketServer = require('ws').Server;

var User = require('./user');

module.exports = function (server) {
    // WebSocket Server for Browser
    var ws_server = new WebSocketServer({
        server: server,
        path: "/ws"
    });

    ws_server.on('connection', function (ws) {
        console.log("connection for browser is opened.");

        ws.on('message', function (msg) {
            var parsed_msg = JSON.parse(msg);

            var role = parsed_msg.role;
            var user = new User(role);
            user.set_browser_connection(ws);

            if (role == "actor") {
                Room.set_actor(user);
            }
            else if (role == "observer") {
                Room.set_observer(user);
            }
            else if (role == "audience") {
                Room.add_audience(user);
            }

            ws.on('close', function () {
                if (role == "actor") {
                    Room.remove_actor();
                }
                else if (role == "observer") {
                    Room.remove_observer();
                }
                else if (role == "audience") {
                    Room.remove_audience(user);
                }
                console.log("connection for browser is closed.");
            });
        });

    });

    ws_server_kinect = new WebSocketServer({
        server: server,
        path: "/ws_kinect"
    });

    ws_server_kinect.on('connection', function (ws) {

        var role = null;

        ws.on('message', function (msg, flags) {
            if (!role && !flags.binary) {
                var parsed_msg = JSON.parse(msg);
                if ('role' in parsed_msg) {
                    role = parsed_msg.role;
                    if (role == "actor") {
                        console.log("connection for kinect is opened.");
                        Room.get_actor().then(function (actor) {
                            actor.set_kinect_connection(ws);
                        });
                    }
                    else if (role == "vital_sensor") {
                        console.log("connection for vital_sensor is opened.");
                        Room.get_actor().then(function (actor) {
                            actor.set_vital_sensor_connection(ws);
                        });
                    }
                    else if (role == "observer") {
                        console.log("connection for kinect is opened.");
                        Room.get_observer().then(function (observer) {
                            observer.set_kinect_connection(ws);
                        });
                    }
                }
            }
            if (!role) return;

            if (role == "actor" || role == "vital_sensor") {
                Room.broadcast_from_actor(msg);
                return;
            }
            if (role == "observer") {
                Room.send_to_actor(msg);
                return;
            }
        });

        ws.on('close', function () {

            if (!role) return;

            if (role == "actor") {
                console.log("connection for kinect is closed.");
                Room.get_actor().then(function (actor) {
                    actor.remove_kinect_connection();
                });
                return;
            }
            if (role == "vital_sensor") {
                console.log("connection for vital_sensor is closed.");
                Room.get_actor().then(function (actor) {
                    actor.remove_vital_sensor_connection();
                });
                return;
            }
            if (role == "observer") {
                console.log("connection for kinect is closed.");
                Room.get_observer().then(function (observer) {
                    observer.remove_kinect_connection();
                });
                return;
            }
        });
    });

};
