module.exports = function () {
    this.index_status = function (room) {
        var ret = {
            actor: {
                browser: {
                    status: "None",
                    klass:  "warning",
                },
                kinect: {
                    status: "None",
                    klass:  "warning"
                }
            },
            observer: {
                browser: {
                    status: "None",
                    klass:  "warning"
                },
                kinect: {
                    status: "None",
                    klass:  "warning"
                }
            }
        };

        if (!room.is_actor_set() && !room.is_observer_set()) {
            return ret;
        }

        if (room.is_actor_set()) {
            if (room.actor.is_browser_connection_set()) {
                ret.actor.browser.status = "Connected";
                ret.actor.browser.klass = "success";
            }
            if (room.actor.is_kinect_connection_set()) {
                ret.actor.kinect.status = "Connected";
                ret.actor.kinect.klass = "success";
            }
        }

        if (room.is_observer_set()) {
            if (room.observer.is_browser_connection_set()) {
                ret.observer.browser.status = "Connected";
                ret.observer.browser.klass = "success";
            }
            if (room.observer.is_kinect_connection_set()) {
                ret.observer.kinect.status = "Connected";
                ret.observer.kinect.klass = "success";
            }
        }

        return ret;
    };
};