import http from './http'
import { v4 as uuidv4 } from 'uuid'

var formatTime = function(date){

    date = date || new Date()

    let year = date.getFullYear().toString()

    let month = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth().toString()

    let day = date.getDate().toString()

    let hour = new Date().getHours().toString()

    let minute = new Date().getMinutes().toString()

    let second = new Date().getSeconds().toString()


    var str =  year + month + day + hour + minute + second

    return str
}

var getChildByName = function(root, name){

    var child = []

    if( Array.isArray(root) && name ){

        root.map(item => {

            if(item.name == name) child.push(item)

        })
    }

    return child
}

var getDeviceStatus = function( options ){

    var param = {
        operator_nbr: 1, 
        op_time: formatTime(new Date()), 
        device_nid: uuidv4(),   
        device_trace_nbr: uuidv4()
    }

    if( options ) {
        param = Object.assign( param, options )
    }

    return http.post({ Message_type: 'Y4001', strRcvMessage: JSON.stringify( param ) })

}

var calculateModel = function( model ){
    var component = new AMRT.Object3D()
    model.position.set(0, 0, 0)
    component.add(model)
    var box = new AMRT.Box3()
    box.setFromObject(model)
    var center = box.getCenter(new AMRT.Vector3())
    model.updateMatrix()
    component.updateMatrix()
    var modelPosition = model.position.clone().applyMatrix4(component.matrixWorld)
    var offset = new AMRT.Vector3().subVectors(modelPosition, center)
    model.position.add(offset)
    return component
}

var resetCamera = function(){

    var initPosition = new AMRT.Vector3( -115, 695, 658 )

    viewer.controls.dispatchEvent( { type: 'reset' } )

    viewer.controls.setTarget( 0, 0, 0 )

    return new Promise((resolve, reject) => {
        viewer.controls.flyTo({
            position: {x: initPosition.x, y: initPosition.y, z: initPosition.z},
            time: 1000,
            complete: function () {
                resolve()
            }
        })
    })
}

var initHomeCamera = function(){

    var initPosition = new AMRT.Vector3( -770, 15, 160 )

    viewer.controls.dispatchEvent( { type: 'reset' } )

    viewer.controls.setTarget( -760, 10, 160 )

    return new Promise((resolve, reject) => {
        viewer.controls.flyTo({
            position: {x: initPosition.x, y: initPosition.y, z: initPosition.z},
            time: 1000,
            complete: function () {
                resolve()
            }
        })
    })

}


export default {
    formatTime,
    getChildByName,
    getDeviceStatus,
    calculateModel,
    resetCamera,
    initHomeCamera
}
