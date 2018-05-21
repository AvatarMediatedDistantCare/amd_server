
var Mesh = function (name, path, type, options) {
  var base_object;
  var json_path = path;
  var directory_path = json_path.substring(0, json_path.lastIndexOf("/"));
  var mesh_type = type;
  var adjuster = options;

  this.name = name;
  this.did_get = false;

  var self = this;

  var build_mesh = function (geometry, materials) {
    if (mesh_type === 'avatar') {
      materials.forEach(function (material) {
        material.skinning = true;
        material.morphTargets = true;
      });
    }

    var mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
    mesh.position.set(0, 0, 0);
    mesh.castShadow = true;
    if (mesh_type === 'room') {
      mesh.receiveShadow = true;
    }

    if (adjuster) {
      mesh = adjuster(mesh);
    }

    return mesh;
  };

  this.get_json = function () {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: json_path,
        dataType: 'json',
      }).done(function (data) {
        base_object = data;
        self.did_get = true;
        resolve();
      });
    });
  };

  this.parse = function () {
    return new Promise(function (resolve, reject) {
      if (self.did_get) {
        // TODO: DRY
        var loader = new THREE.JSONLoader();
        var obj = loader.parse(base_object, directory_path);
        resolve(build_mesh(obj.geometry, obj.materials));
      }
      else {
        // JSON did not load yet.
        self.get_json().then(function () {
          // TODO: DRY
          var loader = new THREE.JSONLoader();
          var obj = loader.parse(base_object, directory_path);
          resolve(build_mesh(obj.geometry, obj.materials));
          return;
        });
      }
    });
  };

};