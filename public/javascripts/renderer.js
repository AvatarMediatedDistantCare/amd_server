var Postures = {
  Standing: {
    Type: 0
  },
  Seated: {
    Type: 1,
    Quaternions: new Array(25)
  },
  LyingHeadLeft: {
    Type: 2,
    Quaternions: new Array(25)
  },
  LyingHeadRight: {
    Type: 3,
    Quaternions: new Array(25)
  }
};

// 座っている: 下半身を固定
Postures.Seated.Quaternions[18] = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI*2/5, 0, 0, "XYZ")); // KL
Postures.Seated.Quaternions[22] = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI*2/5, 0, 0, "XYZ")); // KR
Postures.Seated.Quaternions[19] = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI*2/5, 0, 0, "XYZ"));  // AL
Postures.Seated.Quaternions[23] = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI*2/5, 0, 0, "XYZ"));  // AR


for (var i = 0; i < 25; i++) {
  Postures.LyingHeadLeft.Quaternions[i] = new THREE.Quaternion();
  Postures.LyingHeadRight.Quaternions[i] = new THREE.Quaternion();
}
// 横たわっている（頭が左）: 全身を固定
Postures.LyingHeadLeft.Quaternions[0].setFromEuler(new THREE.Euler(-Math.PI/2, 0, Math.PI/2, "XYZ"));
Postures.LyingHeadLeft.Quaternions[6].setFromEuler(new THREE.Euler(0, 0, -Math.PI*2/5, "XYZ"));  // SL
Postures.LyingHeadLeft.Quaternions[12].setFromEuler(new THREE.Euler(0, 0, Math.PI*2/5, "XYZ"));  // SR

// 横たわっている（頭が右）: 全身を固定
Postures.LyingHeadRight.Quaternions[0].setFromEuler(new THREE.Euler(Math.PI/2, 0, -Math.PI/2, "XYZ"));
Postures.LyingHeadRight.Quaternions[6].setFromEuler(new THREE.Euler(0, 0, -Math.PI*2/5, "XYZ"));  // SL
Postures.LyingHeadRight.Quaternions[12].setFromEuler(new THREE.Euler(0, 0, Math.PI*2/5, "XYZ"));  // SR



var Renderer = function () {
  var avatar_canvas = document.getElementById("container-avatar");
  var avatar_canvas_width  = avatar_canvas.offsetWidth - 100;
  var avatar_canvas_height = avatar_canvas_width / 4 * 3;

  var canvas_joints = document.getElementById("canvas-joints");
  var context_joints = canvas_joints.getContext("2d");

  var self = this;

  // var current_avatar_mesh;
  var current_unparsed_avatar_mesh;
  var avatars = [];
  for (var i = 0; i < 2; i++) {
    avatars[i] = {
      mesh: null,
      vivi: [],
      vuvu: []
    };
  }
  var current_room_mesh;

  var stats = initStats();

  function initStats() {
    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.right = '0px';
    stats.domElement.style.top = '0px';

    $("body").append(stats.domElement);

    return stats;
  }


  // Renderer
  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor(new THREE.Color(0xFFFAF0, 0));
  renderer.setSize(avatar_canvas_width, avatar_canvas_height);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFSoftShadowMap;
  var renderer_dom = renderer.domElement;
  renderer_dom.className = "webglcanvas";
  $("#container-avatar").append(renderer_dom);

  // Camera
  var camera = new THREE.PerspectiveCamera(40, avatar_canvas_width / avatar_canvas_height, 1, 1000);
  camera.position.set( 0, 7, 25 );
  camera.lookAt(new THREE.Vector3(0, 3, 0));

  // Scene
  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xfff4e5, 0.00003);

  // Light
  var light = new THREE.AmbientLight(0xffCCAA, 3);
  light.intensity = 0.3;
  scene.add(light);

  var spotlight = new THREE.SpotLight(0xffffff);
  spotlight.angle = Math.PI / 3;
  spotlight.castShadow = true;
  spotlight.shadowMapWidth = 2048;
  spotlight.shadowMapHeight = 2048;
  spotlight.shadowBias = 0.0001;
  spotlight.shadowDarkness = 0.8;
  spotlight.shadowCameraNear = 10;
  spotlight.shadowCameraFar = 100;
  spotlight.shadowCameraFov = 90;
  spotlight.position.set(10, 40, 20);
  spotlight.intensity = 3;
  scene.add(spotlight);

  var clock = new THREE.Clock();

  var kinect_v2_conversion = function (kinectAbs_rotq) {
    // ---- convert to three's quaternion ----
    // 1. kinect-abs -> three-abs: 座標系変換
    var kinectAbsToThreeAbs_rotq = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI, 0, "XYZ" ) );

    var three_rotq = new Array(25);
    for (var i = 0; i < three_rotq.length; i++) {
      if (!kinectAbs_rotq[i]) continue;
      var tmp_rot = new THREE.Vector3( kinectAbs_rotq[i].x, kinectAbs_rotq[i].y, kinectAbs_rotq[i].z );
      tmp_rot.applyQuaternion(kinectAbsToThreeAbs_rotq);
      three_rotq[i] = new THREE.Quaternion( tmp_rot.x, tmp_rot.y, tmp_rot.z, kinectAbs_rotq[i].w );
    }

    // 2. three_obj -> kinect-obj: オブジェクト変換 e.g. SL: (1,0,0) -> (0,1,0)
    //     &  y軸回り180度を除去
    var threeObjToKinectObj = new Array(25);
    threeObjToKinectObj[0]  = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI, 0, "XYZ" ) ); // SpineBase
    threeObjToKinectObj[1]  = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI, 0, "XYZ" ) ); // SpineMid
    threeObjToKinectObj[20] = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI, 0, "XYZ" ) ); // SpineShoulder (as ShoulderCenter)
    threeObjToKinectObj[2]  = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI, 0, "XYZ" ) ); // Neck
    threeObjToKinectObj[3]  = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, 0,       0, "XYZ" ) );       // Face (as Head)

    threeObjToKinectObj[4]  = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI,            Math.PI/2,  "XYZ" ) ); // ShoulderLeft
    threeObjToKinectObj[5]  = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI+Math.PI/2,  Math.PI/2,  "XYZ" ) ); // ElbowLeft
    threeObjToKinectObj[6]  = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI,            Math.PI/2,  "XYZ" ) ); // WristLeft

    threeObjToKinectObj[8]  = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI,            -Math.PI/2, "XYZ" ) ); // ShoulderRight
    threeObjToKinectObj[9]  = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, -Math.PI-Math.PI/2, -Math.PI/2, "XYZ" ) ); // ElbowRight
    threeObjToKinectObj[10] = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI,            -Math.PI/2, "XYZ" ) ); // WristRight

    threeObjToKinectObj[12] = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, -Math.PI,           Math.PI/2,  "XYZ" ) ); // HipLeft
    threeObjToKinectObj[13] = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI+Math.PI/2,  Math.PI,    "XYZ" ) ); // KneeLeft
    threeObjToKinectObj[14] = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, -Math.PI/2,         Math.PI,    "XYZ" ) ); // AnkleLeft

    threeObjToKinectObj[16] = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI,            -Math.PI/2, "XYZ" ) ); // HipRight
    threeObjToKinectObj[17] = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, -Math.PI-Math.PI/2, -Math.PI,   "XYZ" ) ); // KneeRight
    threeObjToKinectObj[18] = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, Math.PI/2,          -Math.PI,   "XYZ" ) ); // AnkleRight

    var three_rotq2 = new Array(25);
    for (var i = 0; i < three_rotq2.length; i++) {
      if (!kinectAbs_rotq[i]) continue;
      if (!threeObjToKinectObj[i]) continue;
      three_rotq2[i] = new THREE.Quaternion().multiplyQuaternions( three_rotq[i], threeObjToKinectObj[i] );
    }

    // 3. three_abs -> three_rel: オブジェクト変換
    var three_rotq3 = new Array(25);
    three_rotq3[0]  = new THREE.Quaternion().multiplyQuaternions( new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, 0, 0, "XYZ" ) ), three_rotq2[0] );
    // three_rotq3[0]  = three_rotq2[0].inverse();
    three_rotq3[1]  = new THREE.Quaternion().multiplyQuaternions( three_rotq2[0].inverse(),  three_rotq2[1] );  // model-SpineBase
    three_rotq3[2]  = new THREE.Quaternion().multiplyQuaternions( three_rotq2[1].inverse(),  three_rotq2[20] ); //
    three_rotq3[3]  = new THREE.Quaternion().multiplyQuaternions( three_rotq2[20].inverse(), three_rotq2[2] );
    if (three_rotq3[3]) {
      // face の座標はないときがある
      three_rotq3[4]  = new THREE.Quaternion().multiplyQuaternions( three_rotq2[2].inverse(),  three_rotq2[3] );  // head
    }
    three_rotq3[5]  = new THREE.Quaternion().multiplyQuaternions( three_rotq2[20].inverse(), three_rotq2[4] );  // SL
    three_rotq3[6]  = new THREE.Quaternion().multiplyQuaternions( three_rotq2[4].inverse(),  three_rotq2[5] );  // EL
    three_rotq3[7]  = new THREE.Quaternion().multiplyQuaternions( three_rotq2[5].inverse(),  three_rotq2[6] );  // WL

    three_rotq3[11] = new THREE.Quaternion().multiplyQuaternions( three_rotq2[20].inverse(), three_rotq2[8] );  // SR
    three_rotq3[12] = new THREE.Quaternion().multiplyQuaternions( three_rotq2[8].inverse(),  three_rotq2[9] );  // ER
    three_rotq3[13] = new THREE.Quaternion().multiplyQuaternions( three_rotq2[9].inverse(),  three_rotq2[10] ); // WR

    // three_rotq3[17] = new THREE.Quaternion().multiplyQuaternions( three_rotq2[0].inverse(),  three_rotq2[12] ); // HL
    three_rotq3[17] = new THREE.Quaternion( 0, 0, 0, 1 ); // HL
    three_rotq3[18] = new THREE.Quaternion().multiplyQuaternions( three_rotq2[12].inverse(), three_rotq2[13] ); // KL
    three_rotq3[19] = new THREE.Quaternion().multiplyQuaternions( three_rotq2[13].inverse(), three_rotq2[14] ); // AL

    // three_rotq3[21] = new THREE.Quaternion().multiplyQuaternions( three_rotq2[0].inverse(),  three_rotq2[16] ); // HR
    three_rotq3[21] = new THREE.Quaternion( 0, 0, 0, 1 ); // HR
    three_rotq3[22] = new THREE.Quaternion().multiplyQuaternions( three_rotq2[16].inverse(), three_rotq2[17] ); // KR
    three_rotq3[23] = new THREE.Quaternion().multiplyQuaternions( three_rotq2[17].inverse(), three_rotq2[18] ); // AR
    return three_rotq3;
  };

  this.remove_unparsed_avatar_mesh = function () {
    return new Promise(function (resolve, reject) {
      self.stop_rendering();
      if (avatars[0].mesh) {
        for (var a0; a0 = scene.getObjectByName("avatar0"); ) {
          scene.remove(a0);
        }
      }
      if (avatars[1].mesh) {
        for (var a1; a1 = scene.getObjectByName("avatar1"); ) {
          scene.remove(a1);
        }
      }

      resolve();
    });
  };

  this.set_unparsed_avatar_mesh = function (change_to) {
    // TODO: 汚い
    change_to.parse().then(function (mesh0) {
      mesh0.name = "avatar0";
      avatars[0].mesh = mesh0;
      scene.add(avatars[0].mesh);

      change_to.parse().then(function (mesh1) {
        mesh1.name = "avatar1";
        avatars[1].mesh = mesh1;
        self.start_rendering();
      });
    });
  };

  this.remove_room_mesh = function () {
    self.stop_rendering();
    scene.remove(current_room_mesh);
  };

  this.set_room_mesh = function (change_to) {
    current_room_mesh = change_to;
    scene.add(change_to);
    self.start_rendering();
  };

  this.update_skeleton = function (jsonObject) {
    render_joints(jsonObject);

    // Animation Rendering
    var delta = clock.getDelta();

    stats.update();

    // TODO: 汚い
    if (jsonObject.length == 1) {
      if (avatars[1].mesh) {
        scene.remove(avatars[1].mesh);
      }
    }
    else if (jsonObject.length == 2) {
      if (avatars[1].mesh) {
        if (scene.getObjectByName("avatar1")) {
          scene.remove(scene.getObjectByName("avatar1"));
        }
        scene.add(avatars[1].mesh);
      }
    }

    for (i = 0; i < 2; i++) {
      if (!avatars[i].mesh) continue;
      if (!jsonObject[i]) continue;

      // SpineBase位置の設定
      avatars[i].mesh.bones[0].position.x = jsonObject[i].joints[0].x * -10;
      avatars[i].mesh.bones[0].position.y = (jsonObject[i].joints[0].y) * 10 - 2 + 7;
      avatars[i].mesh.bones[0].position.z = -jsonObject[i].joints[0].z * 8;

      // Kinectのabsolute（生データ）を入れる配列
      var krotq_abs = [];
      for (var j = 0; j < 25; j++) {
        krotq_abs[j] = new THREE.Quaternion();
      }

      // Kinectのデータからクォータニオンをつくる
      for (var j = 0; j < jsonObject[i].joints.length; j++) {
        // TODO: Tracking出来てなかったら計算しないようにしたい
        var kinect_rotqx = jsonObject[i].joints[j].quaternion_x;
        var kinect_rotqy = jsonObject[i].joints[j].quaternion_y;
        var kinect_rotqz = jsonObject[i].joints[j].quaternion_z;
        var kinect_rotqw = jsonObject[i].joints[j].quaternion_w;

        krotq_abs[j] = new THREE.Quaternion(kinect_rotqx, kinect_rotqy, kinect_rotqz, kinect_rotqw);
      }

      // FaceのクォータニオンをHeadのクォータニオンとして使用
      if ('face' in jsonObject[i]) {
        krotq_abs[3] = new THREE.Quaternion(jsonObject[i].face.quaternion_x, jsonObject[i].face.quaternion_y, jsonObject[i].face.quaternion_z, jsonObject[i].face.quaternion_w);
      }

      // クォータニオンを変換
      var three_rotq3 = kinect_v2_conversion(krotq_abs);

      // 座っている, 横たわっているときは一部, 全部のクォータニオンを固定
      if (jsonObject[i].posture !== Postures.Standing.Type) {
        var fixed_posture;
        if (jsonObject[i].posture === Postures.Seated.Type) {
          fixed_posture = Postures.Seated.Quaternions;
        }
        else if (jsonObject[i].posture === Postures.LyingHeadLeft.Type) {
          fixed_posture = Postures.LyingHeadLeft.Quaternions;
        }
        else if (jsonObject[i].posture === Postures.LyingHeadRight.Type) {
          fixed_posture = Postures.LyingHeadRight.Quatenions;
        }
        for (var j = 0; j < 25; j++) {
          if (fixed_posture[j]) {
            three_rotq3[j] = fixed_posture[j];
          }
        }
      }

      // クォータニオンをモデルに適用（Tracking出来ていないときは適用しない）
      for (var j = 0; j < three_rotq3.length; j++) {
        if (jsonObject[i].posture === Postures.Standing.Type && !jsonObject[i].joints[j].is_tracked) {
          continue;
        }
        if (!three_rotq3[j]) {
          continue;
        }
        avatars[i].mesh.bones[j].quaternion.copy(three_rotq3[j]);
      }

      var time = Date.now() * 0.004;

      // talk & blink
      if (jsonObject[i].face.mouth_moved === true) {
        avatars[i].mesh.morphTargetInfluences[2] = ( 1 + Math.sin( 4 * time ) ) / 2;
      }

      if ( time%60 > 0.0 && time%60 < 1.0 ) {
        avatars[i].mesh.morphTargetInfluences[1] = ( 1 + Math.sin( 4 * (time/2.0) ) ) / 2;
      }
      else if (time%60 > 15.0 && time%60 < 16.0) {
        avatars[i].mesh.morphTargetInfluences[1] = ( 1 + Math.sin( 4 * (time/2.0) ) ) / 2;
      }
      else if (time%60 > 40.0 && time%60 < 41.0) {
        avatars[i].mesh.morphTargetInfluences[1] = ( 1 + Math.sin( 4 * (time/2.0) ) ) / 2;
      }
      else {
        avatars[i].mesh.morphTargetInfluences[1] = 0;
      }
    }
  };

  var render_joints = function (jsonObject) {
    // Display body joints.
    context_joints.clearRect(0, 0, 320, 240);
    for (var i = 0; i < jsonObject.length; i++) {
      for (var j = 0; j < jsonObject[i].joints.length; j++) {
        if (!jsonObject[i].joints[j].is_tracked) continue;
        var joint = jsonObject[i].joints[j];

        context_joints.fillStyle = "#FF0000";
        context_joints.beginPath();
        context_joints.arc(240 - joint.map_x/2, joint.map_y/2, 6 / joint.map_z, 0, Math.PI * 2, true);
        context_joints.closePath();
        context_joints.fill();
      }
    }
  };

  // to be set animation frame id
  var af_id;

  this.start_rendering = function () {
    af_id = requestAnimationFrame(self.start_rendering);

    renderer.render(scene, camera);
  };

  this.stop_rendering = function () {
    cancelAnimationFrame(af_id);
  };
};
