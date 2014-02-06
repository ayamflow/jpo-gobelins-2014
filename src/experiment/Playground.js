var Constants = Constants || {};

var Playground = function()
{
    this.isDebug = true;
    if(this.isDebug)
    {
        this.debug();
    }

    // Kick it !
    this.init();
    this.initGui();
};

Playground.prototype = {
    init: function()
    {
        this.initRenderer();
        this.initMeshes();
        this.initLights();
        // this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    },

    initRenderer: function() {
        this.resize = new Resize();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.camera = new THREE.PerspectiveCamera(30, this.resize.screenWidth / this.resize.screenHeight, 100, 10000);
        this.scene = new THREE.Scene();

        this.scene.add(this.camera);
        this.camera.position = Constants.cameraPosition;

        this.renderer.setSize(this.resize.screenWidth, this.resize.screenHeight);

        document.body.appendChild(this.renderer.domElement);
    },

    initMeshes: function() {
        var loader = new THREE.OBJLoader();
        loader.load('assets/models/model_clean.obj', function (object) {
            this.mesh = object.children[0];
            this.lines = object.clone().children[0];
            this.scene.add(this.mesh);
            this.scene.add(this.lines);
            this.mesh.material.transparent = true;
            this.lines.material = new THREE.MeshLambertMaterial({color: 0xFFFF00, wireframe: true, wireframeLinewidth: 2});

            this.render();
        }.bind(this));
    },

    initLights: function() {
        this.ambientLight = new THREE.AmbientLight(0x1E1E1E);
        this.scene.add(this.ambientLight);

        this.frontLight = new THREE.PointLight(0xCC1834, 10, 1000);
        this.frontLight.position.set(Constants.frontLightPosition.x, Constants.frontLightPosition.y, Constants.frontLightPosition.z);
        this.scene.add(this.frontLight);
        this.frontLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0xCC1834}));
        this.frontLightHelper.position = this.frontLight.position;
        this.scene.add(this.frontLightHelper);

        this.midLight = new THREE.PointLight(0x3418CC, 10, 1000);
        this.midLight.position.set(Constants.midLightPosition.x, Constants.midLightPosition.y, Constants.midLightPosition.z);
        this.scene.add(this.midLight);
        this.midLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0x3418CC}));
        this.midLightHelper.position = this.midLight.position;
        this.scene.add(this.midLightHelper);

        this.backLight = new THREE.PointLight(0xFF8800, 1, 1000);
        this.backLight.position.set(Constants.backLightPosition.x, Constants.backLightPosition.y, Constants.backLightPosition.z);
        this.scene.add(this.backLight);
        this.backLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0xFF8800}));
        this.backLightHelper.position = this.backLight.position;
        this.scene.add(this.backLightHelper);
    },

    customRender: function() {
        var time = Date.now() * 0.001;

        // this.ambientLight.intensity = Math.cos(time) * 10;
        this.mesh.material.opacity = (Math.sin(time) + 1) / 2;
    },

    render: function()
    {
        if(this.isDebug)
        {
            this.stats.update();
        }

        // this.controls.update();

        this.customRender();

        this.renderer.render(this.scene, this.camera);
        // this.renderer.clear();
        // this.composer.render();

        requestAnimationFrame(this.render.bind(this));
    },

    debug: function() {
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0px';
        this.stats.domElement.style.top = '0px';
        this.stats.domElement.style.zIndex = '100';
        document.body.appendChild(this.stats.domElement);
    },

    initGui: function() {
        this.gui = new dat.GUI();

        var cameraPosition = this.gui.addFolder('cameraPosition');
        cameraPosition.add(Constants.cameraPosition, 'x').min(-200).max(200).onChange(function() {
            this.camera.position.x = Constants.cameraPosition.x;
        }.bind(this));
        cameraPosition.add(Constants.cameraPosition, 'y').min(-200).max(200).onChange(function() {
            this.camera.position.y = Constants.cameraPosition.y;
        }.bind(this));
        cameraPosition.add(Constants.cameraPosition, 'z').min(-200).max(200).onChange(function() {
            this.camera.position.z = Constants.cameraPosition.z;
        }.bind(this));

        var cameraRotation = this.gui.addFolder('cameraRotation');
        cameraRotation.add(Constants.cameraRotation, 'x').min(-Math.PI).max(Math.PI).step(Math.PI / 20).onChange(function() {
            this.camera.rotation.x = Constants.cameraRotation.x;
        }.bind(this));
        cameraRotation.add(Constants.cameraRotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI / 20).onChange(function() {
            this.camera.rotation.y = Constants.cameraRotation.y;
        }.bind(this));
        cameraRotation.add(Constants.cameraRotation, 'z').min(-Math.PI).max(Math.PI).step(Math.PI / 20).onChange(function() {
            this.camera.rotation.z = Constants.cameraRotation.z;
        }.bind(this));

        var frontLight = this.gui.addFolder('frontLightPosition');
        frontLight.add(Constants.frontLightPosition, 'x').min(-1000).max(1000).onChange(function() {
            this.frontLight.position.x = Constants.frontLightPosition.x;
        }.bind(this));
        frontLight.add(Constants.frontLightPosition, 'y').min(-1000).max(5000).onChange(function() {
            this.frontLight.position.y = Constants.frontLightPosition.y;
        }.bind(this));
        frontLight.add(Constants.frontLightPosition, 'z').min(-1000).max(1000).onChange(function() {
            this.frontLight.position.z = Constants.frontLightPosition.z;
        }.bind(this));

        var midLight = this.gui.addFolder('midLightPosition');
        midLight.add(Constants.midLightPosition, 'x').min(-1000).max(1000).onChange(function() {
            this.midLight.position.x = Constants.midLightPosition.x;
        }.bind(this));
        midLight.add(Constants.midLightPosition, 'y').min(-1000).max(5000).onChange(function() {
            this.midLight.position.y = Constants.midLightPosition.y;
        }.bind(this));
        midLight.add(Constants.midLightPosition, 'z').min(-6000).max(0).onChange(function() {
            this.midLight.position.z = Constants.midLightPosition.z;
        }.bind(this));

        var backLight = this.gui.addFolder('backLightPosition');
        backLight.add(Constants.backLightPosition, 'x').min(-1000).max(1000).onChange(function() {
            this.backLight.position.x = Constants.backLightPosition.x;
        }.bind(this));
        backLight.add(Constants.backLightPosition, 'y').min(-1000).max(5000).onChange(function() {
            this.backLight.position.y = Constants.backLightPosition.y;
        }.bind(this));
        backLight.add(Constants.backLightPosition, 'z').min(-20000).max(0).onChange(function() {
            this.backLight.position.z = Constants.backLightPosition.z;
        }.bind(this));
    }
};