var Vitals = function () {

  var settings = {
    am2302: {
      temperature: {
        list: $("#li-value-temperature"),
        danger_thresholds: [["higher_than", 28], ["lower_than", 15]]
      },
      humidity: {
        list: $("#li-value-humidity"),
        danger_thresholds: false
      }
    },
    pulsesensor: {
      heartbeat: {
        list: $("#li-value-heartbeat"),
        danger_thresholds: [["higher_than", 120], ["lower_than", 50]],
      },
      pulse: {
        list: $("#li-graph-pulse")
      }
    }
  };

  var pulse_graph = new VitalGraph('li-graph-pulse', 'Pulse', 200);

  var update_value = function (setting, val) {
    setting.list.find(".value").text(val);

    var is_danger = false;
    if (setting.danger_thresholds) {
      setting.danger_thresholds.forEach(function (threshold) {
        if (threshold[0] == "higher_than" && threshold[1] < val) {
          is_danger = true;
        }
        if (threshold[0] == "lower_than" && threshold[1] > val) {
          is_danger = true;
        }
      });
    }

    setting.list.removeClass("list-group-item-success list-group-item-danger");
    if (is_danger) {
      setting.list.addClass("list-group-item-danger");
    }
    else {
      setting.list.addClass("list-group-item-success");
    }
  };


  this.update = function (jsonObject) {
    if ('am2302' in jsonObject) {
      am2302(jsonObject.am2302);
    }
    if ('pulsesensor' in jsonObject) {
      pulsesensor(jsonObject.pulsesensor);
    }
  };

  var am2302 = function (jsonObject) {
    if ('temperature' in jsonObject) {
      update_value(settings.am2302.temperature, jsonObject.temperature.value);
    }
    if ('humidity' in jsonObject) {
      update_value(settings.am2302.humidity, jsonObject.humidity.value);
    }
  };

  var pulsesensor = function (jsonObject) {
    if ('heartbeat' in jsonObject) {
      update_value(settings.pulsesensor.heartbeat, jsonObject.heartbeat.value);
    }
    if ('pulse' in jsonObject) {
      pulse_graph.add_data(jsonObject.pulse.value);
    }
  };
};