import { v4 as uuidv4 } from 'uuid'
import Util from '@/utils/util'
import { obstacleNames } from '@/config'

var raycaster = new AMRT.Raycaster()

var mixin = {

    methods: {

        getDeviceByCode( DeviceCode ){
            console.log('getDeviceByCode', DeviceCode)
            
            var param = {
                operator_nbr: 1, 
                op_time: Util.formatTime(new Date()), 
                device_nid: uuidv4(),   
                device_trace_nbr: uuidv4(), 
                Op_type: 4,
                DeviceCode
            }

            return this.http.post({ Message_type: 'Y1004', strRcvMessage: JSON.stringify( param ) })
        },

        async calcDrawPosition( coordinate, context ){

            let direction = { x: true, y: true }
    
            if( coordinate.x > window.innerWidth / 2 ){
    
                direction.x = false
    
                this.coordinate.x -= 400
    
            }
    
            if( coordinate.y > window.innerHeight / 2 ){
    
                direction.y = false
    
                this.coordinate.y -= 400
    
            }
    
            this.drawCanvas( context, direction.x, direction.y )
    
        },
    
        drawCanvas( data, x = true, y = true ){
    
            var P0 = {}, P1 = {}, P2 = {}, P3 = {}
    
            if( x ){
                if( y ) {
                    P0 = { x: 10, y: 10 }
                    P1 = { x: 50, y: 50 }
                    P2 = { x: 400, y: 50 }
                    P3 = { x: 50, y: 70 }
                } else { 
                    P0 = { x: 10, y: 390 }
                    P1 = { x: 50, y: 350 }
                    P2 = { x: 400, y: 350 }
                    P3 = { x: 50, y: 30 }
                }
            }else{
                if( y ) {
                    P0 = { x: 390, y: 10 }
                    P1 = { x: 350, y: 50 }
                    P2 = { x: 0, y: 50 }
                    P3 = { x: 0, y: 70 }
                } else {
                    P0 = { x: 390, y: 390 }
                    P1 = { x: 350, y: 350 }
                    P2 = { x: 0, y: 350 }
                    P3 = { x: 0, y: 30 }
                }
            }
    
            const canvas = this.$refs.canvas
            const ctx = canvas.getContext('2d')
    
            ctx.clearRect( 0, 0, 400, 400 )
            ctx.strokeStyle = 'rgba(21, 113, 202, 0.5)'
            ctx.fillStyle = 'rgba(21, 113, 202, 0.5)'
            ctx.fillRect( P3.x, P3.y, 350, 300)
            ctx.beginPath()
            ctx.moveTo( P0.x, P0.y )
            ctx.lineTo( P1.x, P1.y )
            ctx.lineTo( P2.x, P2.y )
            ctx.stroke()
    
            ctx.beginPath()
            ctx.fillStyle = 'rgba(255, 204, 0, 1.0)'
            ctx.arc( P0.x, P0.y, 10, 0, 2 * Math.PI )
            ctx.fill()
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
            ctx.font = "18px serif"
            var offset = 30

            if( !data || JSON.stringify(data) == '{}' ) data = { '提示': '此模型没有绑定设备！' }
            for (const key in data) {
                let text = key + ' : ' + data[key]
                ctx.fillText( text, P3.x + 10, P3.y + offset )
                offset += 32
            }
    
        },

        updateCanvasPosition(){

            if( this.selected ) {

                var tempV = new AMRT.Vector3().copy( this.selected.position ).applyMatrix4( viewer.camera.matrixWorldInverse).applyMatrix4( viewer.camera.projectionMatrix )

                if ( (Math.abs(tempV.x) > 1) || (Math.abs(tempV.y) > 1) || (Math.abs(tempV.z) > 1) ) {

                    this.showCanvas = false

                    return
                }

                var coordinate = new AMRT.Vector3().copy( this.selected.position ).project( viewer.camera )

                coordinate.x = Math.round((0.5 + coordinate.x / 2) * window.innerWidth)

                coordinate.y = Math.round((0.5 - coordinate.y / 2) * window.innerHeight)
                
                this.coordinate = coordinate

                this.calcDrawPosition( coordinate, this.deviceInfo )

                this.showCanvas || ( this.showCanvas = true )

            }
        }



    }


}

export default mixin