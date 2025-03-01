/**
 * Function to convert a Euler in YXZ order to a quaternion
 */
function quatFromEulerYXZ (out, x, y, z) {
    const c1 = Math.cos(x/2);
    const c2 = Math.cos(y/2);
    const c3 = Math.cos(z/2);

    const s1 = Math.sin(x/2);
    const s2 = Math.sin(y/2);
    const s3 = Math.sin(z/2);

    out[0] = s1*c2*c3 + c1*s2*s3;
    out[1] = c1*s2*c3 - s1*c2*s3;
    out[2] = c1*c2*s3 - s1*s2*c3;
    out[3] = c1*c2*c3 + s1*s2*s3;
};

/**
 * Retrieve device orientation from a mobile device and set the object's
 * orientation accordingly.
 *
 * Useful for magic window experiences.
 */
WL.registerComponent('device-orientation-look', {
}, {
    start: function() {
        this.rotationX = 0;
        this.rotationY = 0;

        this.lastClientX = -1;
        this.lastClientY = -1;
    },
    init: function() {
        /* Initialize device orientation with Identity Quaternion */
        this.deviceOrientation = [0, 0, 0, 1];
        this.screenOrientation = (window.innerHeight > window.innerWidth) ? 0 : 90;
        this._origin = [0, 0, 0];

        window.addEventListener('deviceorientation',function(e) {
            let alpha = e.alpha || 0;
            let beta = e.beta || 0;
            let gamma = e.gamma || 0;
            const toRad = Math.PI/180;
            quatFromEulerYXZ(this.deviceOrientation, beta*toRad, alpha*toRad, -gamma*toRad);
        }.bind(this));

        window.addEventListener('orientationchange', function(e) {
            this.screenOrientation = window.orientation || 0;
        }.bind(this), false);
    },

    update: function() {
        /* Don't use device orientation in VR */
        if(Module['webxr_session'] != null) return;

        glMatrix.quat2.getTranslation(this._origin, this.object.transformLocal);

        this.object.resetTransform();
        if(this.screenOrientation != 0) {
            this.object.rotateAxisAngleDeg([0, 0, -1], this.screenOrientation);
        }
        this.object.rotate([-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)]);
        this.object.rotate(this.deviceOrientation);
        this.object.translate(this._origin);
    }
});
