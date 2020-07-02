var outLine

var mixin = {

    mounted() {

        outLine = new AMRT.OutLine( { color: '#fff709' } )

        viewer.addPostProcessing( outLine )

        this.outlinePass = outLine.pass

        this.initOutLine()

    },

    beforeDestroy(){

        outLine.clear()

        viewer.removePostProcessing( outLine )

        this.outlinePass.enabled = false

        this.outlinePass.selectedObjects = []

    },

    methods: {

        initOutLine(){
            
            let selecteds = []
            
            viewer.root.children.map( item => {
                if( item.DeviceCode ) selecteds.push(item)
            })

            this.outlinePass.selectedObjects = selecteds

            this.outlinePass.enabled = true

        }

    }

}

export default mixin