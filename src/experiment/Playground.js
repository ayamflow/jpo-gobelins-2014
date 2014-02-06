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
        /*this.ambiant = new Howl({
            urls: ['assets/sounds/ambient.mp3'],
            autoplay: true,
            loop: true
        });
        this.sapien = new Howl({
            urls: ['assets/sounds/sapien.mp3'],
            autoplay: true,
            loop: true,
            volume: 0.6
        });*/
    },

    initRenderer: function() {
        this.resize = new Resize();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.camera = new THREE.PerspectiveCamera(30, this.resize.screenWidth / this.resize.screenHeight, 100, 10000);
        this.scene = new THREE.Scene();

        this.leap = new LeapBridge();

        this.scene.add(this.camera);
        this.camera.position = Constants.cameraPosition;

        this.renderer.setSize(this.resize.screenWidth, this.resize.screenHeight);
        document.body.appendChild(this.renderer.domElement);

        ////
        var rtParams = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: true
        };

        // Render pass
        this.renderPass = new THREE.RenderPass(this.scene, this.camera);

        // Noise pass
        this.filmPass   = new THREE.FilmPass( 1, 0, 0, false);

        // Effect Composer
        this.composer   = new THREE.EffectComposer( this.renderer, new THREE.WebGLRenderTarget( window.innerWidth, window.innerWidth, rtParams ) );
        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.filmPass);

        this.filmPass.renderToScreen = true;
    },

    initMeshes: function() {
        // Background
        this.background = new THREE.Mesh(new THREE.PlaneGeometry(16000, 10000), new THREE.MeshLambertMaterial({color: 0xE65F39})); // MeshBasicMaterial to make it really visible
        this.scene.add(this.background);
        this.background.position = Constants.backgroundPosition;

        var loader = new THREE.OBJLoader();
        loader.load('assets/models/model_clean.obj', function (object) {
            this.mesh = object.children[0];
            this.lines = object.clone().children[0];
            this.scene.add(this.mesh);
            // this.scene.add(this.lines);
            this.mesh.material.transparent = true;
            this.lines.material = new THREE.MeshLambertMaterial({color: 0x0000FF, wireframe: true, wireframeLinewidth: 4});

            // Backup vertices positions
            this.verticesPositions = [];

            var vertices = this.mesh.geometry.vertices;
            for(var i = 0; i < vertices.length; i++) {
                this.verticesPositions.push(vertices[i].z);
            }

            this.mesh.geometry.dynamic = true;
            this.mesh.geometry.mergeVertices();

            this.render();
            TweenLite.fromTo(this.background.position, 6, {z: -200}, {z: -9000, yoyo: true, repeat: -1, delay: 1.2});
            TweenLite.fromTo(this.bgLight.position, 6, {z: -150}, {z: -9000 + 50, yoyo: true, repeat: -1, delay: 1.2});
        }.bind(this));
    },

    initLights: function() {
        this.ambientLight = new THREE.AmbientLight(0x1E1E1E);
        this.scene.add(this.ambientLight);

        this.bgLight = new THREE.PointLight(0xE65F39, 120, 1000);
        this.bgLight.position.set(this.background.position.x, this.background.position.y + 500, this.background.position.z + 50);
        this.scene.add(this.bgLight);

        this.frontLight = new THREE.PointLight(0xCC1834, Constants.lightIntensity.front, 1000);
        this.frontLight.position = Constants.frontLightPosition;
        this.scene.add(this.frontLight);
        this.frontLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0xCC1834}));
        this.frontLightHelper.position = this.frontLight.position;
        this.scene.add(this.frontLightHelper);

        this.midLight = new THREE.PointLight(0x3418CC, Constants.lightIntensity.mid, 1000);
        this.midLight.position = Constants.midLightPosition;
        this.scene.add(this.midLight);
        this.midLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0x3418CC}));
        this.midLightHelper.position = this.midLight.position;
        this.scene.add(this.midLightHelper);

        this.backLight = new THREE.PointLight(0xFF8800, Constants.lightIntensity.back, 1000);
        this.backLight.position = Constants.backLightPosition;
        this.scene.add(this.backLight);
        this.backLightHelper = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({color: 0xFF8800}));
        this.backLightHelper.position = this.backLight.position;
        this.scene.add(this.backLightHelper);

        this.leapLight = new THREE.PointLight(0xFF8800, Constants.lightIntensity.leap, 1000);
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
        this.livingLight = {
            origin: null,
            lightOne: null,
            lightTwo: null,
            speed: 0,

            init: function(){
                this.origin   = new THREE.Vector3(-0, -0, -500);
                this.lightOne = new THREE.PointLight(0x0000FF, 10, 500);
                this.lightTwo = new THREE.PointLight(0x00FF00, 10, 500);
            },

            update: function(){
                this.speed += 0.1;

                var PI2 = Math.PI * 2;
                var radius = 50;

                var positionOne = {
                    x: this.origin.x + Math.cos(this.speed) * radius + 25,
                    y: this.origin.y + Math.sin(this.speed) * radius*.5,
                    z: this.origin.y + Math.sin(this.speed) * radius + 25
                };

                var positionTwo = {
                    x: this.origin.x + Math.cos(this.speed + Math.PI) * radius + 25,
                    y: this.origin.y + Math.sin(this.speed + Math.PI) * radius*.5,
                    z: this.origin.y + Math.sin(this.speed + Math.PI) * radius + 25
                };

                this.lightOne.position.set(positionOne.x, positionOne.y, positionOne.z);
                this.lightTwo.position.set(positionTwo.x, positionTwo.y, positionTwo.z);
            }
        };

        this.livingLight.init();
        this.scene.add(this.livingLight.lightOne);
        this.scene.add(this.livingLight.lightTwo);

        var helperTwo = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20), new THREE.MeshLambertMaterial({color: 0xFF8800}));
        helperTwo.position = this.livingLight.lightOne.position;
        this.scene.add(helperTwo);

        var helperOne = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20), new THREE.MeshLambertMaterial({color: 0xFF8800}));
        helperOne.position = this.livingLight.lightTwo.position;
        this.scene.add(helperOne);

        // Light fading control
        this.lightsOn = true;
        this.fading = true;
        this.fadeLightsOut(0);
    },

    customRender: function() {
        var time = Date.now() * 0.001;

        var hand1 = this.leap.hands[0],
            hand2 = this.leap.hands[1];

        // Animate the leap hand position
        this.leapLightHelper.rotation.x += Math.cos(time) / 10;
        this.leapLightHelper.rotation.y += Math.sin(time) / 10;
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
        this.livingLight.update();
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

        var cameraRotation = this.gui.addFolder('cameraRotation');
        cameraRotation.add(Constants.cameraRotation, 'x').min(-Math.PI).max(Math.PI).step(Math.PI / 20);
        cameraRotation.add(Constants.cameraRotation, 'y').min(-Math.PI).max(Math.PI).step(Math.PI / 20);
        cameraRotation.add(Constants.cameraRotation, 'z').min(-Math.PI).max(Math.PI).step(Math.PI / 20);

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

        var background = this.gui.addFolder('bgPosition');
        background.add(Constants.backgroundPosition, 'x').min(-1000).max(1000).onChange(function() {
            this.bgLight.position.set(this.background.position.x, this.background.position.y + 500, this.background.position.z + 50);
        }.bind(this));
        background.add(Constants.backgroundPosition, 'y').min(-1000).max(1000).onChange(function() {
            this.bgLight.position.set(this.background.position.x, this.background.position.y + 500, this.background.position.z + 50);
        }.bind(this));
        background.add(Constants.backgroundPosition, 'z').min(-10000).max(1000).onChange(function() {
            this.bgLight.position.set(this.background.position.x, this.background.position.y + 500, this.background.position.z + 50);
        }.bind(this));
    }
};
