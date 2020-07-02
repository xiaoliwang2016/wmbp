/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

var {
    Euler,
    EventDispatcher,
    Vector3,
    Box3,
    Raycaster
} = AMRT

/**
 * 第一人称控制器
 * @param camera {Camera} 相机
 * @param domElement {HTMLElement} 场景容器
 * @param movingRegion {Box3} 移动范围
 * @constructor
 */
var FirstPersonControls = function ( camera, domElement, movingRegion, obj ) {
    
    if ( domElement === undefined ) {

        domElement = document.body;

    }

    this.domElement = domElement;
    this.enabled = false;
    this.rotateSpeed = 0.002;
    this.moveSpeed = 200;

    /***
     * 相机移动范围
     * @type {Box3}
     */
    this.movingRegion = movingRegion;


    var scope = this;

    var changeEvent = { type: 'change' };
    var lockEvent = { type: 'lock' };
    var unlockEvent = { type: 'unlock' };
    var moveEvent = { type: 'move' }

    var euler = new Euler( 0, 0, 0, 'YXZ' );

    var PI_2 = Math.PI / 2;

    var vec = new Vector3();
    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var moveUp = false;
    var moveDown = false;

    var prevTime = performance.now();
    var velocity = new Vector3();
    var direction = new Vector3();


    function onKeyDown( event ) {

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 82://R
                moveUp = true;
                break;
            case 70://F
                moveDown = true;
                break;


        }

    };

    function onKeyUp( event ) {

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;
            case 82://R
                moveUp = false;
                break;
            case 70://F
                moveDown = false;
                break;

        }

    };

    function onMouseDown( event ) {

        if ( event.button === 0 ) {
            document.addEventListener( 'mousemove', onMouseMove, false );
        }
    }

    function onMouseUp() {
        document.removeEventListener( 'mousemove', onMouseMove, false );
    }

    function onMouseMove( event ) {

        if ( scope.enabled === false ) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        euler.setFromQuaternion( camera.quaternion );

        euler.y -= movementX * scope.rotateSpeed;
        euler.x -= movementY * scope.rotateSpeed;

        euler.x = Math.max( -PI_2, Math.min( PI_2, euler.x ) );

        camera.quaternion.setFromEuler( euler );

        scope.dispatchEvent( changeEvent );

    }

    function onPointerlockChange() {

        if ( document.pointerLockElement === scope.domElement ) {

            scope.dispatchEvent( lockEvent );

            scope.enabled = true;

        } else {

            scope.dispatchEvent( unlockEvent );

            scope.enabled = false;

        }

    }

    function onPointerlockError() {

        console.error( 'THREE.FirstPersonControls: Unable to use Pointer Lock API' );

    }

    this.connect = function () {

        document.addEventListener( 'mousedown', onMouseDown, false );
        document.addEventListener( 'mouseup', onMouseUp, false );

        document.addEventListener( 'keydown', onKeyDown, false );
        document.addEventListener( 'keyup', onKeyUp, false );

        // document.addEventListener( 'pointerlockchange', onPointerlockChange, false );
        // document.addEventListener( 'pointerlockerror', onPointerlockError, false );

    };

    this.disconnect = function () {

        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mousedown', onMouseDown, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );

        document.removeEventListener( 'keydown', onKeyDown, false );
        document.removeEventListener( 'keyup', onKeyUp, false );

        // document.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
        // document.removeEventListener( 'pointerlockerror', onPointerlockError, false );

    };

    this.dispose = function () {

        this.disconnect();

    };

    this.getObject = function () { // retaining this method for backward compatibility

        return camera;

    };

    this.getDirection = function () {

        var direction = new Vector3( 0, 0, -1 );

        return function ( v ) {

            return v.copy( direction ).applyQuaternion( camera.quaternion );

        };

    }();

    this.moveForward = function ( distance ) {

        // move forward parallel to the xz-plane
        // assumes camera.up is y-up

        vec.setFromMatrixColumn( camera.matrix, 0 );

        vec.crossVectors( camera.up, vec );

        camera.position.addScaledVector( vec, distance );

        //检查相机移动范围

        if ( this.movingRegion ) {
            camera.position.x = Math.max( Math.min( camera.position.x, this.boundingBox.max.x ), this.boundingBox.min.x );
            camera.position.z = Math.max( Math.min( camera.position.z, this.boundingBox.max.z ), this.boundingBox.min.z );
        }

    };

    this.moveRight = function ( distance ) {

        vec.setFromMatrixColumn( camera.matrix, 0 );

        camera.position.addScaledVector( vec, distance );

    };

    this.moveUp = function ( distance ) {

        vec.setFromMatrixColumn( camera.matrix, 0 );
        camera.position.addScaledVector( vec, distance );

    }

    this.lock = function () {

        this.domElement.requestPointerLock();

    };

    this.unlock = function () {

        document.exitPointerLock();

    };

    this.raycaster = new Raycaster()

    this.update = function () {

        if ( scope.enabled === true ) {

            var time = performance.now();
            var delta = (time - prevTime) / 1000;

            velocity.x -= velocity.x * 20 * delta;
            velocity.z -= velocity.z * 20 * delta;
            // velocity.y -= velocity.y * 10 * delta;

            // velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

            direction.z = Number( moveForward ) - Number( moveBackward );
            direction.x = Number( moveRight ) - Number( moveLeft );
            // direction.y = Number(moveDown) - Number(moveUp);

            direction.normalize(); // this ensures consistent movements in all directions

            if ( moveForward || moveBackward ) velocity.z -= direction.z * scope.moveSpeed * delta;
            if ( moveLeft || moveRight ) velocity.x -= direction.x * scope.moveSpeed * delta;
            // if (moveUp || moveDown) velocity.y -= direction.y * scope.moveSpeed * delta;


            this.moveRight( -velocity.x * delta );
            this.moveForward( -velocity.z * delta );
            this.moveUp( -velocity.y * delta );

            this.raycaster.set(camera.position, new Vector3( 0, -1, 0 ))

            var intersects = this.raycaster.intersectObject(obj, false)

            if( intersects.length > 0 ) 
                camera.position.y = intersects[0].point.y + 2

            /*			camera.position.y += ( velocity.y * delta ); // new behavior

                        if ( camera.position.y < 10 ) {

                            velocity.y = 0;
                            controls.getObject().position.y = 10;


                        }*/
            scope.dispatchEvent( moveEvent )

            prevTime = time;

        }
    };

    this.connect();

};

FirstPersonControls.prototype = Object.create( EventDispatcher.prototype );
FirstPersonControls.prototype.constructor = FirstPersonControls;

