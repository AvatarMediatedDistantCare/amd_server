$(document).ready(function () {

  var renderer = new Renderer();
  renderer.start_rendering();

  // for Actor Mode
  var vitals;
  if (typeof Vitals !== 'undefined') {
    vitals = new Vitals();
  }

  // Avatars
  var avatar_meshes = [];
  var refresh_avatar_mesh_options = function () {
    var target = $("#select-avatar-mesh");

    avatar_meshes.forEach(function (mesh, i) {
      target.append($("<option>", {value: i, text: mesh.name}));
    });
    target.change();
  };
  $(document).on("change", "#select-avatar-mesh", function () {
    var selected_avatar_mesh = avatar_meshes[parseInt($(this).val())];

    renderer.remove_unparsed_avatar_mesh().then(function () {
      renderer.set_unparsed_avatar_mesh(selected_avatar_mesh);
    });
  });

  // Load avatar meshes
  avatar_meshes.push( new Mesh("PoliticianForV2", "/public/models/avatars/politician_v2/50s_politician4v2.js", "avatar") );
  refresh_avatar_mesh_options();


  // Rooms
  var room_meshes = [];
  var refresh_room_mesh_options = function () {
    var target = $("#select-room-mesh");

    room_meshes.forEach(function (mesh, i) {
      target.append($("<option>", {value: i, text: mesh.name}));
    });
    target.change();
  };
  $(document).on("change", "#select-room-mesh", function () {
    var selected_room_mesh = room_meshes[parseInt($(this).val())];

    renderer.remove_room_mesh();
    selected_room_mesh.parse().then(function (mesh) {
      renderer.set_room_mesh(mesh);
    });
  });

  // Load room meshes
  room_meshes.push( new Mesh("Living room", "/public/models/rooms/living/living.js", "room") );
  room_meshes.push( new Mesh("Doctor\'s room", "/public/models/rooms/doctors/doctors.js", "room") );

  refresh_room_mesh_options();

  var ws_status = document.getElementById("websocket-status");
  var ws = new WebSocket("ws://" + window.document.location.host + "/ws");

  ws.onopen = function () {
    ws.send(join);
    ws_status.innerHTML = "Connection successfully opened.";
  };

  ws.onclose = function () {
    ws_status.innerHTML = "Connection closed.";
  };

  ws.onmessage = function (event) {
    var data = event.data;
    if (data.constructor === String) {
      var jsonObject = JSON.parse(data);

      if ('bodies' in jsonObject) {
        renderer.update_skeleton(jsonObject.bodies);
        return;
      }

      if ('vitals' in jsonObject) {
        vitals.update(jsonObject.vitals);
        return;
      }
    }
    else if (data.constructor === Blob) {
      window.URL = window.URL || window.webkitURL;
      var source = window.URL.createObjectURL(data);

      var audio = new Audio();
      audio.src = source;
      audio.defaultPlaybackRate = 0.85;

      audio.play();
    }
  };

});
