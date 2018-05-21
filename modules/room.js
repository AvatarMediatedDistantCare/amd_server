var Promise = require('bluebird');

var Room = function () {
    this.actor = null;
    this.observer = null;
    var audiences = [];

    var self = this;

    this.set_actor = function (user) {
        self.actor = user;
    };
    this.get_actor = function () {
        return new Promise(function (resolve, reject) {
            if (!self.actor) {
                reject("actor is empty.");
                return;
            }
            resolve(self.actor);
        });
    };
    this.remove_actor = function () {
        self.actor = null;
    };
    this.is_actor_set = function () {
        if (!self.actor) {
            return false;
        }
        return true;
    };

    this.set_observer = function (user) {
        self.observer = user;
    };
    this.get_observer = function () {
        return new Promise(function (resolve, reject) {
            if (!self.observer) {
                reject("observer is empty.");
                return;
            }
            resolve(self.observer);
        });
    };
    this.remove_observer = function () {
        self.observer = null;
    };
    this.is_observer_set = function () {
        if (!self.observer) {
            return false;
        }
        return true;
    };

    this.add_audience = function (user) {
        audiences.push(user);
    };
    this.remove_audience = function (user) {
        audiences = audiences.filter(function (element, index, array) {
            if (element === user) return false;
            return true;
        });
    };
    this.count_audience = function () {
        return audiences.length;
    };


    this.broadcast_from_actor = function (msg) {
        if (self.is_observer_set()) {
            self.observer.send(msg).catch(function (err) {
                console.log("observer", err);
            });
        }

        audiences.forEach(function (audience) {
            audience.send(msg).catch(function (err) {
                console.log("audience", err);
            });
        });
    };

    this.send_to_actor = function (msg) {
        if (self.is_actor_set()) {
            self.actor.send(msg).catch(function (err) {
                console.log("actor", err);
            });
        }
    };


};

module.exports = Room;
