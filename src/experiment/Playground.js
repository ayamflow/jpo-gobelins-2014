var Constants = Constants || {};

var Playground = function()
{
    this.isDebug = false;
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
        this.initSounds();
        this.initRenderer();
        this.initMeshes();
        this.initLights();
    },

    initSounds: function() {
        this.switchSound = new Howl({
          urls: ['assets/sounds/door.mp3'],
          autoplay: false,
          volume: 0.3
        });
        this.ambiant = new Howl({
            urls: ['assets/sounds/ambiant.mp3'],
            autoplay: true,
            loop: true
        });
    },

    initRenderer: function() {
        this.resize = new Resize();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.camera = new THREE.PerspectiveCamera(30, this.resize.screenWidth / this.resize.screenHeight, 100, 10000);
        this.scene = new THREE.Scene();

        this.leap = new LeapBridge();
        this.mouse = new Mouse();

        this.scene.add(this.camera);
        this.camera.position = Constants.cameraPosition;

        this.renderer.setSize(this.resize.screenWidth, this.resize.screenHeight);
        document.body.appendChild(this.renderer.domElement);

        var rtParams = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: true
        };

        // Render pass
        this.renderPass = new THREE.RenderPass(this.scene, this.camera);

        // Noise pass
        this.filmPass   = new THREE.FilmPass( 0.02, 0, 0, false);

        // Effect Composer
        this.composer   = new THREE.EffectComposer( this.renderer, new THREE.WebGLRenderTarget( window.innerWidth, window.innerWidth, rtParams ) );
        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.filmPass);

        this.filmPass.renderToScreen = true;
    },

    initMeshes: function() {
        // Background
        // this.background = new THREE.Mesh(new THREE.PlaneGeometry(16000, 10000), new THREE.MeshBasicMaterial({color: 0xE65F39})); // MeshBasicMaterial to make it really visible
        this.movingPlane = new THREE.Mesh(new THREE.PlaneGeometry(16000, 10000), new THREE.MeshLambertMaterial({color: 0xE65F39}));
        // this.scene.add(this.background);
        this.scene.add(this.movingPlane);
        // this.background.position.set(Constants.backgroundPosition.x, Constants.backgroundPosition.y, Constants.backgroundPosition.z)
        this.movingPlane.position = Constants.backgroundPosition;

        var loader = new THREE.OBJLoader();
        loader.load('assets/models/model_clean.obj', function (object) {
            this.mesh = object.children[0];
            this.lines = object.clone().children[0];
            this.scene.add(this.mesh);
            // this.scene.add(this.lines);
            this.mesh.material.transparent = true;
            this.lines.material = new THREE.MeshLambertMaterial({color: 0xFFFF00, wireframe: true, wireframeLinewidth: 4});

            // Backup vertices positions
            this.verticesPositions = [];

            var vertices = this.mesh.geometry.vertices;
            for(var i = 0; i < vertices.length; i++) {
                this.verticesPositions.push(vertices[i].z);
            }

            this.mesh.geometry.dynamic = true;
            this.mesh.geometry.mergeVertices();

            this.render();
            this.movePlane();
        }.bind(this));
    },

    movePlane: function() {
        TweenLite.fromTo(this.movingPlane.position, 6, {z: -200}, {z: -9000, delay: 1.2});
        TweenLite.fromTo(this.bgLight.position, 6, {z: -150}, {z: -9000 + 50, delay: 1.2});
    },

    initLights: function() {
        this.ambientLight = new THREE.AmbientLight(0x1E1E1E);
        this.scene.add(this.ambientLight);

        this.bgLight = new THREE.PointLight(0xE65F39, 120, 1000);
        // this.bgLight.position.set(this.background.position.x, this.background.position.y + 500, this.background.position.z + 50);
        this.scene.add(this.bgLight);

        this.frontLight = new THREE.PointLight(0xCC1834, Constants.lightIntensity.front, 1000);
        this.frontLight.position = Constants.frontLightPosition;
        this.scene.add(this.frontLight);
        this.frontLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0xCC1834}));
        this.frontLightHelper.position = this.frontLight.position;
        // this.scene.add(this.frontLightHelper);

        this.midLight = new THREE.PointLight(0x3418CC, Constants.lightIntensity.mid, 1000);
        this.midLight.position = Constants.midLightPosition;
        this.scene.add(this.midLight);
        this.midLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0x3418CC}));
        this.midLightHelper.position = this.midLight.position;
        // this.scene.add(this.midLightHelper);

        this.backLight = new THREE.PointLight(0xFF8800, Constants.lightIntensity.back, 1000);
        this.backLight.position = Constants.backLightPosition;
        this.scene.add(this.backLight);
        this.backLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0xFF8800}));
        this.backLightHelper.position = this.backLight.position;
        // this.scene.add(this.backLightHelper);

        this.leapLight = new THREE.PointLight(0x0080FF, Constants.lightIntensity.leap, 1000);
        this.scene.add(this.leapLight);

        this.leapLightHelper = new THREE.Object3D();
        this.scene.add(this.leapLightHelper);
        var leapCube1 = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20), new THREE.MeshLambertMaterial({color: 0xFF8800}));
        var leapCube2 = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20), new THREE.MeshLambertMaterial({color: 0xFF8800}));
        leapCube2.rotation.x = Math.cos(10);
        leapCube2.rotation.y = Math.sin(10);
        this.leapLightHelper.add(leapCube1);
        this.leapLightHelper.add(leapCube2);
        this.leapLightHelper.position = this.leapLight.position;
        this.scene.add(this.leapLightHelper);

        // Living light
        var self = this;
        this.lightController = {
            origin: null,
            lights: [],
            drawObject: null,

            initWithLights: function(number){
                this.drawObject = new THREE.Object3D();
                this.origin = new THREE.Vector3(0, 0, -500);


                for (var i = 0; i < number; i++) {
                    var light    = new THREE.PointLight(0xFF8800, 10, 500);
                    light.helper = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 8), new THREE.MeshBasicMaterial({color: 0xFF8800}));
                    light.helper.receiveShadow = false;
                    light.helper.castShadow = false;
                    light.glow   = this.glow();
                    light.delta  = new THREE.Vector3();
                    light.startAngle = Math.random() * Math.PI * 2;

                    light.randomSpeed = function(){
                        light.speed = new THREE.Vector3(
                            Math.random()*0.1,
                            Math.random()*0.1,
                            Math.random()*0.1
                        );
                    };

                    light.randomSpeed();
                    setInterval(function(){
                        light.randomSpeed();
                    }.bind(light), 3000);

                    this.lights.push(light);

                    this.drawObject.add(light);
                    this.drawObject.add(light.helper);
                    this.drawObject.add(light.glow);
                }
            },

            glow: function() {
                var shader = THREE.GlowShader(self.camera.position, new THREE.Color(0xFF8800));
                var glow = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 8), shader.clone());
                glow.scale.multiplyScalar(1.5);
                glow.receiveShadow = false;
                glow.castShadow = false;
                return glow;
            },

            update: function(){

                var PI2 = Math.PI * 2;
                var radius = 500;

                for (var i = 0; i < this.lights.length; i++) {
                    this.lights[i].delta.add(this.lights[i].speed);

                    var position = new THREE.Vector3(
                        this.origin.x + Math.cos(this.lights[i].delta.x + this.lights[i].startAngle) * radius + 25,
                        this.origin.y + Math.sin(this.lights[i].delta.y + this.lights[i].startAngle) * radius *.5,
                        this.origin.y + Math.sin(this.lights[i].delta.z + this.lights[i].startAngle) * radius + 25
                    );

                    this.lights[i].position        = position;
                    this.lights[i].helper.position = position;
                    this.lights[i].glow.position = position;
                }
            },
        };

        this.lightController.initWithLights(2);
        this.scene.add(this.lightController.drawObject);

        // Light fading control
        this.lightsOn = true;
        this.fading = false;
        this.fadeLightsOut(0);
    },

    customRender: function() {
        var time = Date.now() * 0.001;

        // Animate the leap hand position
        this.leapLightHelper.rotation.x += Math.cos(time) / 10;
        this.leapLightHelper.rotation.y += Math.sin(time) / 10;

        if(this.leap.isLeap) {
            var hand1 = this.leap.hands[0],
                hand2 = this.leap.hands[1];

            this.leapLight.position.set(hand1.x, hand1.y, -2500 + hand1.z * 10);

            // Turn the light off if no hand
            if(!hand1.valid) {
                this.fadeLightsOut();
            }
            else {
                this.fadeLightsIn();
            }

            // Shake based on the distance between 2 hands
            if(hand1.valid && hand2.valid) {
                var dx = Math.abs(hand1.x - hand2.x) / 500;
                this.shake(time, 100 * (1 - dx));
            }
            else {
                this.resetShake();
            }
        }
        else {
            this.fadeLightsIn(0);
            var mx = this.mouse.x / this.resize.screenWidth * 1900 - 1000;
            this.leapLightHelper.position.set(mx, 100, this.mouse.y / this.resize.screenHeight * 1500 - 2000);
            if(this.mouse.isDown) {
                this.shake(time, 120);
            }
        }
    },

    shake: function(time, force) {
        if(force > 110) {
            // this.filmPass.uniforms.grayscale.value = !!~~(Math.random() * 2); // Random boolean
            this.filmPass.uniforms.nIntensity.value = Math.random();
            this.filmPass.uniforms.sIntensity.value = Math.random();
            this.filmPass.uniforms.sCount.value = Math.random();
        }
        var vertices = this.mesh.geometry.vertices;
        for(var i = 0; i < vertices.length; i++) {
            vertices[i].z = this.verticesPositions[i] + Math.random() * force;
        }
        this.mesh.geometry.verticesNeedUpdate = true;
        this.mesh.geometry.computeFaceNormals();
    },

    resetShake: function() {
        this.filmPass.uniforms.grayscale.value = false;
        this.filmPass.uniforms.nIntensity.value = 1;
        this.filmPass.uniforms.sIntensity.value = 0;
        this.filmPass.uniforms.sCount.value = 0;

        var vertices = this.mesh.geometry.vertices;
        for(var i = 0; i < vertices.length; i++) {
            TweenLite.to(vertices[i], 0.4, {z: this.verticesPositions[i]});
        }
        this.mesh.geometry.verticesNeedUpdate = true;
        this.mesh.geometry.computeFaceNormals();
    },

    fadeLightsIn: function(time) {
        if(this.fading || this.lightsOn) return;
        // console.log('fadeLightsIn');
        this.switchSound.play();
        time = time || 0.5;
        this.fading = true;
        TweenLite.to(this.leapLight, time, {intensity: Constants.lightIntensity.leap, ease: Expo.easeIn});
        TweenLite.to(this.midLight, time, {intensity: Constants.lightIntensity.mid, ease: Expo.easeIn});
        TweenLite.to(this.backLight, time, {intensity: Constants.lightIntensity.back, ease: Expo.easeIn});
        TweenLite.to(this.frontLight, time, {intensity: Constants.lightIntensity.front,
            onComplete: function() {
                this.fading = false;
                this.lightsOn = true;
            }.bind(this)
        , ease: Expo.easeIn});
    },

    fadeLightsOut: function(time) {
        if(this.fading || !this.lightsOn) return;
        // console.log('fadeLightsOut');
        this.switchSound.play();
        time = time || 0.5;
        this.fading = true;
        TweenLite.to(this.leapLight, time, {intensity: 0, ease: Expo.easeOut});
        TweenLite.to(this.midLight, time, {intensity: 0, ease: Expo.easeOut});
        TweenLite.to(this.backLight, time, {intensity: 0, ease: Expo.easeOut});
        TweenLite.to(this.frontLight, time, {intensity: 0,
            onComplete: function() {
                    this.fading = false;
                    this.lightsOn = false;
            }.bind(this)
        , ease: Expo.easeOut});
    },

    render: function()
    {
        if(this.isDebug)
        {
            this.stats.update();
        }

        this.customRender();

        this.composer.render(0.01);
        this.lightController.update();
        // this.renderer.render(this.scene, this.camera);
        // this.renderer.clear();
        // this.composer.render();


        setTimeout(function(){
            window.requestAnimationFrame(this.render.bind(this));
        }.bind(this), 1000 / 30);
        // requestAnimationFrame(this.render.bind(this));
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

        this.gui.add(Constants, 'showMesh').onChange(function() {
            this.scene.remove(this.mesh);
            if(Constants.showMesh) {
                this.scene.add(this.mesh);
            }
        }.bind(this));

        this.gui.add(Constants, 'showLines').onChange(function() {
            this.scene.remove(this.lines);
            if(Constants.showLines) {
                this.scene.add(this.lines);
            }
        }.bind(this));

        var cameraPosition = this.gui.addFolder('cameraPosition');
        cameraPosition.add(Constants.cameraPosition, 'x').min(-2000).max(2000);
        cameraPosition.add(Constants.cameraPosition, 'y').min(-2000).max(2000);
        cameraPosition.add(Constants.cameraPosition, 'z').min(-2000).max(2000);

        var frontLight = this.gui.addFolder('frontLightPosition');
        frontLight.add(Constants.frontLightPosition, 'x').min(-1000).max(1000);
        frontLight.add(Constants.frontLightPosition, 'y').min(-1000).max(5000);
        frontLight.add(Constants.frontLightPosition, 'z').min(-1000).max(1000);

        var midLight = this.gui.addFolder('midLightPosition');
        midLight.add(Constants.midLightPosition, 'x').min(-1000).max(1000);
        midLight.add(Constants.midLightPosition, 'y').min(-1000).max(5000);
        midLight.add(Constants.midLightPosition, 'z').min(-6000).max(0);

        var backLight = this.gui.addFolder('backLightPosition');
        backLight.add(Constants.backLightPosition, 'x').min(-1000).max(1000);
        backLight.add(Constants.backLightPosition, 'y').min(-1000).max(5000);
        backLight.add(Constants.backLightPosition, 'z').min(-20000).max(0);

        var leapLightHelper = this.gui.addFolder('leapHelper');
        leapLightHelper.add(Constants.leapLightHelperPosition, 'x').min(-1000).max(1000).onChange(function() {
            this.leapLightHelper.position.set(Constants.leapLightHelperPosition.x, Constants.leapLightHelperPosition.y, Constants.leapLightHelperPosition.z);
        }.bind(this));
        leapLightHelper.add(Constants.leapLightHelperPosition, 'y').min(-1000).max(1000).onChange(function() {
            this.leapLightHelper.position.set(Constants.leapLightHelperPosition.x, Constants.leapLightHelperPosition.y, Constants.leapLightHelperPosition.z);
        }.bind(this));
        leapLightHelper.add(Constants.leapLightHelperPosition, 'z').min(-10000).max(1000).onChange(function() {
            this.leapLightHelper.position.set(Constants.leapLightHelperPosition.x, Constants.leapLightHelperPosition.y, Constants.leapLightHelperPosition.z);
        }.bind(this));

        this.gui.close();
    }
};
