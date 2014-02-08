module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 9732,
                    open: true,
                    keepalive: true
                }
            }
        },
        concat: {
            options: {
            separator: ';',
            },
            dist: {
                src: [
                    "node_modules/leapjs/leap.min.js",
                    "lib/Three/three.min.js",
                    "lib/Three/OBJLoader.js",
                    "lib/dat.gui.min.js",
                    "lib/EasePack.min.js",
                    "lib/howler.min.js",
                    "lib/TweenLite.min.js",

                    "src/experiment/glsl/shaders/BleachBypassShader.js",
                    "src/experiment/glsl/shaders/ColorifyShader.js",
                    "src/experiment/glsl/shaders/ConvolutionShader.js",
                    "src/experiment/glsl/shaders/CopyShader.js",
                    "src/experiment/glsl/shaders/DotScreenShader.js",
                    "src/experiment/glsl/shaders/FilmShader.js",
                    "src/experiment/glsl/shaders/HorizontalBlurShader.js",
                    "src/experiment/glsl/shaders/SepiaShader.js",
                    "src/experiment/glsl/shaders/VerticalBlurShader.js",
                    "src/experiment/glsl/shaders/VignetteShader.js",
                    "src/experiment/glsl/shaders/GlowShader.js",

                    "src/experiment/glsl/postprocessing/EffectComposer.js",
                    "src/experiment/glsl/postprocessing/RenderPass.js",
                    "src/experiment/glsl/postprocessing/BloomPass.js",
                    "src/experiment/glsl/postprocessing/FilmPass.js",
                    "src/experiment/glsl/postprocessing/DotScreenPass.js",
                    "src/experiment/glsl/postprocessing/TexturePass.js",
                    "src/experiment/glsl/postprocessing/ShaderPass.js",
                    "src/experiment/glsl/postprocessing/MaskPass.js",

                    "src/experiment/helpers/Resize.js",
                    "src/experiment/helpers/MathHelper.js",
                    "src/experiment/helpers/LeapBridge.js",
                    "src/experiment/helpers/Mouse.js",
                    "src/experiment/Constants.js",
                    "src/experiment/Playground.js",
                    "src/main.js"
                ],
                dest: 'dist/jpo2014.js',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['connect']);
    grunt.registerTask('build', ['concat']);
};
