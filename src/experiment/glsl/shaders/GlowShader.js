

THREE.GlowShader = function(cameraPosition, color){
    return new THREE.ShaderMaterial(
    {

        uniforms: {
            "c": { type: "f", value: 0.2 },
            "p": { type: "f", value: 1.4 },
            glowColor: { type: "c", value: color },
            viewVector: { type: "v3", value: cameraPosition },
        },

        vertexShader: [
            "uniform vec3 viewVector;",
            "uniform float c;",
            "uniform float p;",
            "varying float intensity;",

            "void main()",
            "{",
                "vec3 vNormal = normalize( normalMatrix * normal );",
                "vec3 vNormel = normalize( normalMatrix * viewVector );",
                "intensity = pow( c - dot(vNormal, vNormel), p );",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join('\n'),

        fragmentShader: [
            "uniform vec3 glowColor;",
            "varying float intensity;",

            "void main()",
            "{",
                "vec3 glow = glowColor * intensity;",
                "gl_FragColor = vec4( glow, 1.0 );",
            "}"
        ].join('\n'),
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    }   );



    // new THREE.ShaderMaterial({

        // uniforms: {
        //     "c": { type: "f", value: 0.05 },
        //     "p": { type: "f", value: 4.5 },
        //     glowColor: { type: "c", value: new THREE.Color(0xFFFF00) },
        //     viewVector: { type: "vec3", value: cameraPosition },
        // },

        // vertexShader: [
        //     "uniform vec3 viewVector;",
        //     "uniform float c;",
        //     "uniform float p;",
        //     "varying float intensity;",

        //     "void main()",
        //     "{",
        //         "vec3 vNormal = normalize( normalMatrix * normal );",
        //         "vec3 vNormel = normalize( normalMatrix * viewVector );",
        //         "intensity = pow( c - dot(vNormal, vNormel), p );",
        //         "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        //     "}"
        // ].join('\n'),

        // fragmentShader: [
        //     "uniform vec3 glowColor;",
        //     "varying float intensity;",

        //     "void main()",
        //     "{",
        //         "vec3 glow = glowColor * intensity;",
        //         "gl_FragColor = vec4( glow, 1.0 );",
        //     "}"
        // ].join('\n'),

    //     side: THREE.FrontSide,
    //     blending: THREE.AdditiveBlending,
    //     transparent: true

    // });
}









