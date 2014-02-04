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
    this.render();
};

Playground.prototype = {
    init: function()
    {
        this.initRenderer();
        this.initMeshes();
        this.initLights();
        this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    },

    initRenderer: function() {
        this.resize = new Resize();
        this.renderer = new THREE.WebGLRenderer();
        this.camera = new THREE.PerspectiveCamera(45, this.resize.screenWidth / this.resize.screenHeight, 0.1, 10000);
        this.scene = new THREE.Scene();

        this.scene.add(this.camera);
        this.camera.position.z = 500;

        this.renderer.setSize(this.resize.screenWidth, this.resize.screenHeight);

        document.body.appendChild(this.renderer.domElement);
    },

    initMeshes: function() {
        var loader = new THREE.OBJLoader();
        loader.load('assets/models/model.obj', function (object) {
            // console.log('loaded', object);
            this.scene.add(object);
        }.bind(this));
    },

    initLights: function() {
        this.spotLight = new THREE.SpotLight(0x230099, 10, 100000);
        this.spotLight.castShadow = true;
        this.spotLight.position.x = 500;
        this.scene.add(this.spotLight);

        this.spotLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0x2899EB}));
        this.spotLightHelper.position = this.spotLight.position;
        this.scene.add(this.spotLightHelper);

        this.moonLight = new THREE.SpotLight(0xFF0000, 10, 100000);
        this.moonLight.castShadow = true;
        this.moonLight.position.x = 500;
        this.scene.add(this.moonLight);

        this.moonLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0xFF0000}));
        this.moonLightHelper.position = this.moonLight.position;
        this.scene.add(this.moonLightHelper);

        this.ambientLight = new THREE.AmbientLight(0x111144);
        this.scene.add(this.ambientLight);
    },

    customRender: function() {
        var time = Date.now() * 0.001;

        // this.moonLight.position.set(150 * Math.sin(time / 4 + Math.PI), 150, 150 * Math.cos(time / 4 + Math.PI));
        this.moonLightHelper.position = this.moonLight.position;
        this.spotLightHelper.position = this.spotLight.position;
    },

    render: function()
    {
        if(this.isDebug)
        {
            this.stats.update();
        }

        this.controls.update();

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

        var light1 = this.gui.addFolder('light1');
        light1.add(Constants.light1Position, 'x').min(-1000).max(1000).onChange(function() {
            this.moonLight.position.x = Constants.light1Position.x;
        }.bind(this));
        light1.add(Constants.light1Position, 'y').min(-1000).max(1000).onChange(function() {
            this.moonLight.position.y = Constants.light1Position.y;
        }.bind(this));
        light1.add(Constants.light1Position, 'z').min(-1000).max(1000).onChange(function() {
            this.moonLight.position.z = Constants.light1Position.z;
        }.bind(this));

        var light2 = this.gui.addFolder('light2');
        light2.add(Constants.light2Position, 'x').min(-1000).max(1000).onChange(function() {
            this.spotLight.position.x = Constants.light2Position.x;
        }.bind(this));
        light2.add(Constants.light2Position, 'y').min(-1000).max(1000).onChange(function() {
            this.spotLight.position.y = Constants.light2Position.y;
        }.bind(this));
        light2.add(Constants.light2Position, 'z').min(-1000).max(1000).onChange(function() {
            this.spotLight.position.z = Constants.light2Position.z;
        }.bind(this));
    }
};