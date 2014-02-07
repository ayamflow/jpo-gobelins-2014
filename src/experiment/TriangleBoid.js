var TriangleBoid = function() {
    THREE.Object3D.call(this);

    var texture = THREE.ImageUtils.loadTexture('assets/img/triangle.png');
    var material = new THREE.SpriteMaterial({map: texture, useScreenCoordinates: true});//, alignment: THREE.SpriteAlignment.topLeft});
    var sprite = new THREE.Sprite(material);

    this.add(sprite);
};

TriangleBoid.prototype = new THREE.Object3D();
TriangleBoid.prototype.constructor = TriangleBoid;

TriangleBoid.prototype.update = function() {

};