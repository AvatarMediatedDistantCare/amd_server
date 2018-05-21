var Promise = require('bluebird');

var User = function (role) {
    this.role = role;
    var browser_connection = null;
    var kinect_connection = null;

    this.set_browser_connection = function (conn) {
        browser_connection = conn;
    };
    this.remove_browser_connection = function () {
        browser_connection = null;
    };
    this.is_browser_connection_set = function() {
        if (!browser_connection) {
            return false;
        }
        return true;
    };

    this.set_kinect_connection = function (conn) {
        if (role == "audience") {
            // XXX: unexpected
            return;
        }
        kinect_connection = conn;
    };
    this.remove_kinect_connection = function () {
        if (role == "audience") {
            // XXX: unexpected
            return;
        }
        kinect_connection = null;
    };
    this.is_kinect_connection_set = function () {
        if (!kinect_connection) {
            return false;
        }
        return true;
    };

    this.set_vital_sensor_connection = function (conn) {
        if (role != "actor") {
            // XXX: unexpected
            return;
        }
        vital_sensor_connection = conn;
    };
    this.remove_vital_sensor_connection = function () {
        if (role != "actor") {
            // XXX: unexpected
            return;
        }
        vital_sensor_connection = null;
    };
    this.is_vital_sensor_connection_set = function () {
        if (!vital_sensor_connection) {
            return false;
        }
        return true;
    };


    this.send = function (msg) {
        return new Promise(function (resolve, reject) {
            if (!browser_connection) {
                reject('Browser connection is empty.');
                return;
            }

            try {
                browser_connection.send(msg);
            }
            catch (ex) {
                reject('Browser connection is invalid.');
                return;
            }

            resolve();
        });
    };

};

module.exports = User;