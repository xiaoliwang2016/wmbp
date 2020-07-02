import { deviceNames, deviceData } from '@/config'
import http from './http'
import Util from './util'
import { v4 as uuidv4 } from 'uuid'

/* 导出场景数据 */
var exportData = function(){

    var models = []

    deviceNames.map( name => {

        if( viewer.modelGroup.getObjectByName( name ) ){

            let root = viewer.modelGroup.getObjectByName( name )

            if( Array.isArray( root.children ) ) {
                root.children.map( item => {
                    models.push( item )
                })
            }
        }
    })

    function saveToJson( data ){

        var res = data.map(item => {

            let m_scale = new AMRT.Vector3(), m_position = new AMRT.Vector3(), m_quaternion = new AMRT.Quaternion()

            item.getWorldScale(m_scale)
            item.getWorldPosition(m_position)
            item.getWorldQuaternion(m_quaternion)

            let obj = {}
            obj.name = item.name
            obj.position = m_position.toArray()
            obj.quaternion = m_quaternion.toArray()
            obj.scale = m_scale.toArray()
            obj.DeviceCode = item.DeviceCode

            return obj

        })

        return res
    }

    var data = saveToJson( models )

    console.log('exportData', JSON.stringify(data));
}

var addDevice = function( models, i = 0 ){

    var model = viewer.modelGroup.getObjectByName( models[i].name ), typeName, typeId
    
    var name = model.parent.name

    deviceData.map( item => {
        if( item.name == name ) {
            typeName = item.typeName
            typeId = item.typeId
        }
    } )
    
    if( typeName ) {

        var param = {
            operator_nbr: 1,
            op_time: Util.formatTime(new Date()),
            device_nid: uuidv4(),
            device_trace_nbr: uuidv4(),
            Op_type: 1,

            DeviceTypeID: typeId,
            EQUBoxName: typeName,
            Location: '',
            EUQType: typeName,
            IPAddress: '',
            SiteName: typeName
        }

        http.post({
            Message_type: 'Y1001',
            strRcvMessage: JSON.stringify( param )
        }).then(res => {
            if( res.Iresult == 0 && res.DeviceCode ) {
                models[i].DeviceCode = res.DeviceCode
                console.log( models[i] )
            }else{ console.log( res.Msg ) }

            if( models.length - 1 == i ){
                var data = saveToJson( models )
                console.log(data)
            } else {
                console.log(`还剩${models.length - i}个设备等待添加`);
                addDevice( models, ++i )
            }
        })
    }else{
        console.log('该模型不在指定模型列表中');
        if( models.length - 1 == i ){
            var data = saveToJson( models )
            console.log(data)
        }else{
            console.log(`还剩${models.length - i}个设备等待添加`);
            addDevice( models, ++i )
        }
    }

    function saveToJson( data ){
        var res = data.map(item => {
            let obj = {}
            obj.name = item.name
            obj.position = item.position.toArray()
            obj.quaternion = item.quaternion.toArray()
            obj.scale = item.scale.toArray()
            obj.DeviceCode = item.DeviceCode
            return obj
        })

        return JSON.stringify(res)
    }
}

var delDevice = function( devices, i = 0 ){

    var param = {
        operator_nbr: 1,
        op_time: Util.formatTime(new Date()),
        device_nid: uuidv4(),
        device_trace_nbr: uuidv4(),
        Op_type: 3,
        DeviceCode: devices[i].DeviceCode
    }

    http.post({ 
        Message_type: 'Y1003', 
        strRcvMessage: JSON.stringify( param ) 
    }).then(res => {
        if( devices.length - i == 1 ){
            console.log('删除所有设备完成');
        }else{
            console.log(`还剩${devices.length - i}个设备等待删除`);
            delDevice( devices, ++i )
        }
    })
}

var deleteUnbindDevice = function( devices, i = 0 ){
    var codes = userDevices.map(item => item.DeviceCode)
    codes = codes = codes.filter(item => item)

    if(!codes.includes(devices[i].DeviceCode)){
        var param = {
            operator_nbr: 1,
            op_time: Util.formatTime(new Date()),
            device_nid: uuidv4(),
            device_trace_nbr: uuidv4(),
            Op_type: 3,
            DeviceCode: devices[i].DeviceCode
        }
        console.log( '删除无效设备:', devices[i].DeviceCode )
        
        http.post({ 
            Message_type: 'Y1003', 
            strRcvMessage: JSON.stringify( param ) 
        }).then(res => {
            if( devices.length - i == 1 ){
                console.log('删除所有设备完成');
            }else{
                deleteUnbindDevice( devices, ++i )
            }
        })
    }else{
        deleteUnbindDevice( devices, ++i )
    }
}

export default {
    exportData,
    addDevice,
    delDevice,
    deleteUnbindDevice
}


