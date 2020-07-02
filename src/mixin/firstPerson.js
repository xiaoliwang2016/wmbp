
var mixin = {

    // mounted(){

    //     this.initFirstPersonControls()
    // },

    // beforeDestroy(){

    //     this.disposeFirstPersonControls()
    // },

    methods: {

        initFirstPersonControls(){

            window.firstPersonControls = new FirstPersonControls( viewer.camera, null, null, viewer.modelGroup.getChildByName('Shape023'))

            firstPersonControls.enabled = true
    
            firstPersonControls.addEventListener( 'move', this.updateFirstPersonTarget )
    
            viewer.addEventListener( 'update', this.controlUpdate )
        },

        disposeFirstPersonControls(){
            
            if( !window.firstPersonControls ) return

            viewer.removeEventListener( 'update', this.controlUpdate )

            firstPersonControls.removeEventListener( 'move', this.updateFirstPersonTarget )
            
            firstPersonControls.enabled = false
    
            firstPersonControls.dispose()
            
            firstPersonControls = null

        },

        controlUpdate(){

            firstPersonControls.update()

        },

        updateFirstPersonTarget(){

			var v_direction = new AMRT.Vector3(), v_position = new AMRT.Vector3().copy(viewer.camera.position)

            viewer.camera.getWorldDirection(v_direction)

            v_position = v_position.add( v_direction )

            viewer.controls.target.copy(v_position)

		}
        

    }

}

export default mixin