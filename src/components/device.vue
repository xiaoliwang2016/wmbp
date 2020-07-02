<template>
    <div>
        <div class="device" v-if="editMode == 'add'">

            <p>选择设备类型</p>

            <p>说明：先选中设备类型，再在隧道中点击摆放位置</p>

            <ul v-if="editMode == 'add'">
                <li v-for="(item, index) in list" :key="index" @click="addDevice(item)">
                    <div><img :src="item.src"></div>
                    <p>{{item.typeName}}</p>
                </li>
            </ul>
            <div class="btn">
                <el-button type="primary" @click.stop="exit">退出编辑</el-button>
            </div>
        </div>

        <div class="tool" v-show="showTool">
            <div class="btns">
                <span :class="{active: curStatus == 0}" @click="changeStatus(0)" >位移</span>
                <span :class="{active: curStatus == 1}" @click="changeStatus(1)" >旋转</span>
                <span :class="{active: curStatus == 2}" @click="changeStatus(2)" >缩放</span>
            </div>
            <span class="active bind" @click.stop="toBind">设备信息</span>
            <span class="active del" @click.stop="deleteModel">删除</span>
            <span class="active complete" @click.stop="complete">完成</span>
            <span class="active cancle" @click.stop="exit">取消</span>
        </div>

        <div class="inputs" v-show="showDeviceInfoEdit">
            <div class="head"> 设备绑定 </div>
            <div class="row"> <span>设备名称</span>  <input v-model="deviceInfo.EQUBoxName" type="text" placeholder="请输入设备名称"> </div>
            <div class="row"> <span>设备型号</span>  <input v-model="deviceInfo.EUQType" type="text" placeholder="请输入设备型号"> </div>
            <div class="row"> <span>IP地址  </span>  <input v-model="deviceInfo.IPAddress" type="text" placeholder="请输入IP地址"> </div>
            <div class="row"> <span>设备位置  </span>  <input v-model="deviceInfo.Location" type="text" placeholder="请输入IP地址"> </div>
            <div class="row"> <span>站点名称</span>  <input v-model="deviceInfo.SiteName" type="text" placeholder="请输入站点名称"> </div>
            <div class="foot">
                <button @click="showDeviceInfoEdit = false">取消</button>
                <button @click="confirmBind">保存</button>
            </div>
        </div>


    </div>

</template>

<script>

import { v4 as uuidv4 } from 'uuid'
import { obstacleNames, deviceData, independModels } from '@/config'

import Util from '@/utils/util'

import { mapState, mapMutations } from "vuex"

import firstPersonMixin from '@/mixin/firstPerson'

var transform,
    raycaster = new AMRT.Raycaster(),
    mouse = new AMRT.Vector2(),
    object,
    selected,
    obstacleObjects = [],
    boundingBox,
    radius,
    originData,
    outLine

export default {

    name: 'Device',

    mixins: [ firstPersonMixin ],

    data(){
        return {
            list: [],
            curStatus: 0,
            showTool: false,
            mode: 0,
            deviceInfo: {
                DeviceTypeID: '',
                EQUBoxName: '',
                Location: '',
                EUQType: '',
                IPAddress: '',
                SiteName: ''
            },
            showDeviceInfoEdit: false
        }
    },

    mounted(){

        this.init()

    },

    beforeDestroy(){

        transform && transform.remove()

        // window.removeEventListener( 'click', this.initDeviceSelector )

        window.removeEventListener( 'keydown', this.keyDownEvent )

        this.disposeFirstPersonControls()

    },

    computed: {
         ...mapState({
            editMode: state => state.mode
        })
    },

    methods: {

        ...mapMutations({

            SetDeviceWindow: "SetDeviceWindow"
        }),

        init(){

            //添加模式
            if( this.editMode == 'add' ) {

                this.list = deviceData

                obstacleObjects = []
                obstacleNames.map(item => obstacleObjects.push(viewer.modelGroup.getObjectByName(item)))

                // window.addEventListener( 'click', this.initDeviceSelector )

                this.initFirstPersonControls()
            }

            //编辑模式
            if( this.editMode == 'edit' ) {

                this.initDeviceSelector(window.target)

                window.target = null

            }

            window.addEventListener( 'keydown', this.keyDownEvent )

        },

        keyDownEvent(e){

            if( e.keyCode == 27 ) this.exit()

            if( e.keyCode == 46 ) this.deleteModel()

        },

        /* 初始化拾取用户自定义设备 */
        initDeviceSelector(event){

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1

            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

            raycaster.setFromCamera( mouse, viewer.camera )

            var intersects = raycaster.intersectObjects( userDevices, true )

            if( intersects.length > 0 ) {

                this.mode = 1

                this.curSelectDevice = selected = this.getCompleteModel(intersects[0].object)

                this.editDevice()

            }

        },

        /* 根据点击的子网格获取完成模型 */
        getCompleteModel(mesh){

            if( mesh.parent.name.trim() == 'root' ) return mesh

            return this.getCompleteModel( mesh.parent )

        },

        /* 编辑设备 */
        editDevice(){

            this.showTool = true

            // window.removeEventListener( 'click', this.initDeviceSelector )

            transform = transform || new AMRT.TransformControls(viewer)

            this.record(selected)

            transform.setTarget(selected)

            transform.setMode(AMRT.TransFormMode.TRANSLATE)

            viewer.controls.target.copy(selected.position)

        },

        /* 记录初始位置、旋转、缩放 */
        record( obj ){

            // firstPersonControls.enabled = false

            originData = {
                position: new AMRT.Vector3().copy(obj.position),
                scale: new AMRT.Vector3().copy(obj.scale),
                rotation: new AMRT.Euler().copy(obj.rotation)
            }
        },

        /* 取消 */
        restore(){

            if( selected && originData ){

                selected.position.copy( originData.position )
                selected.scale.copy( originData.scale )
                selected.rotation.copy( originData.rotation )

                // firstPersonControls.enabled = true

                this.showTool = false

                transform && transform.remove()

                // window.addEventListener( 'click', this.initDeviceSelector )

                selected = null

                originData = null
            }
        },

        /* 新增设备 */
        addDevice(item){

            this.mode = 0

            if( object ) {

                transform.remove()

                viewer.remove(object)
            }

            if( viewer.modelGroup.getObjectByName(item.name) === undefined || viewer.root.getObjectByName(item.name) === undefined ){

                return this.$message.warning('找不到该模型')

            }

            this.curSelectDevice = item

            var obj = independModels.includes(item.name) ? obj = viewer.modelGroup.getObjectByName(item.name) : obj = viewer.modelGroup.getObjectByName(item.name).children[0]

            var v_position = viewer.camera.position, v_direction = new AMRT.Vector3(), m_scale = new AMRT.Vector3()

            viewer.camera.getWorldDirection(v_direction)

            obj.getWorldScale(m_scale)

            object = obj.clone()

            object.visible = true

            object.scale.copy(m_scale)

            object.position.copy(v_position)

            object.translateOnAxis(v_direction, 10)

            viewer.controls.target.copy(object.position)

            // window.removeEventListener( 'click', this.initDeviceSelector )

            this.toBind()  // 自动弹出绑定设备窗口

        },

        /* 初始化鼠标移动事件 */
        initTransform(){

            this.curStatus = 0

            boundingBox = AMRT.EntityFactory.createBoundingBox(selected)

            radius = boundingBox.geometry.boundingSphere.radius

            window.addEventListener('mousemove', this.onMouseMove)

            setTimeout(() => {

                window.addEventListener('click', this.setDevice)

            }, 500)

        },

        onMouseMove( event ) {

            if( this.curStatus !== 0 ) return

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1

            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

            raycaster.setFromCamera( mouse, viewer.camera )

            var intersects = raycaster.intersectObjects( obstacleObjects )

            if( intersects.length > 0 ) {

                selected.position.copy( intersects[0].point )

                var v = new AMRT.Vector3().copy(viewer.camera.position).sub(selected.position).normalize()

                selected.translateOnAxis( v, radius * 2 )

            }

        },

        setDevice(){

            window.removeEventListener('mousemove', this.onMouseMove)

            window.removeEventListener('click', this.setDevice)

            this.record(selected)

            transform = transform || new AMRT.TransformControls(viewer)

            transform.setMode(AMRT.TransFormMode.TRANSLATE)

            transform.setTarget(selected)

        },

        changeStatus(curStatus){

            this.curStatus = curStatus

            switch (curStatus) {
                case 0:
                    transform.setMode(AMRT.TransFormMode.TRANSLATE)
                    break
                case 1:
                    transform.setMode(AMRT.TransFormMode.ROTATE)
                    break
                case 2:
                    transform.setMode(AMRT.TransFormMode.SCALE)
                    break
            }

        },

        complete(){

            this.saveModel()

            this.showTool = false

            selected = null

            transform && transform.remove()

            Util.resetCamera()

            this.$emit( 'exit' )

            // window.addEventListener( 'click', this.initDeviceSelector )

        },

        /* 删除模型信息 */
        deleteModel(){

            if( !selected ) return

            this.$confirm('此操作将删除模型以及模型对应的设备, 是否继续?', '提示', {
                confirmButtonText: '确认删除',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {

                this.mode = 2

                // 如果已经绑定了设备，先删除设备
                if( selected.DeviceCode ) {

                    var param = {
                        operator_nbr: 1,
                        op_time: Util.formatTime(new Date()),
                        device_nid: uuidv4(),
                        device_trace_nbr: uuidv4(),
                        Op_type: 3,
                        DeviceCode: selected.DeviceCode
                    }

                    var res = await this.http.post({ Message_type: 'Y1003', strRcvMessage: JSON.stringify( param ) })

                    if( res.Iresult != 0 ) return this.$message.error( res.Msg )

                    this.$emit( 'add' )

                    console.log('删除设备结果:', res)

                }
                transform && transform.remove()

                viewer.remove( selected )

                userDevices.map( (item, index) => {

                    if( item.uuid == selected.uuid ) userDevices.splice( index, 1 )
                } )

                selected = null

                this.showTool = false

                // firstPersonControls.enabled = true

                this.saveModel()

                // window.addEventListener( 'click', this.initDeviceSelector )

                Util.resetCamera()

                this.$emit( 'exit' )

            }).catch()
            
        },

        /* 保存模型信息 */
        async saveModel(){

            if( this.mode == 1 && selected ) {

                userDevices.map((item, index) => {

                    if( item.uuid == selected.uuid ) userDevices[index] = selected

                })

            }

            if( this.mode == 0 && object ) {

                userDevices.push( object )
            }

            var param = {
                operator_nbr: 1,
                op_time: Util.formatTime(new Date()),
                device_nid: uuidv4(),
                device_trace_nbr: uuidv4(),
                ModelPara: JSON.stringify( this.saveToJson(userDevices) )
            }

            try {

                var res = await this.http.post({ Message_type: 'Y1005', strRcvMessage: JSON.stringify( param ) })

                res.Iresult == 0 && this.$message.success(res.Msg)

            } catch (error) { this.$message.error('保存模型数据失败') }

            // this.$emit( 'update',  this.saveToJson(userDevices) )
        },


        async toBind(){

            var obj = this.mode == 1 ? selected : object, { typeName, typeId } = this.curSelectDevice

            if( !typeName ) {

                let name = independModels.includes(this.curSelectDevice.name) ? this.curSelectDevice.name : viewer.modelGroup.getObjectByName( this.curSelectDevice.name ).parent.name

                deviceData.map( item => {
                    if( item.name == name ) {
                        typeName = item.typeName
                        typeId = item.typeId
                    }
                } )

                if( !typeName ) return this.$message.warning('此设备不支持绑定数据')
            }

            var deviceInfo = {}

            // 如果已经绑定过设备的情况下，先查询设备信息
            if( obj.DeviceCode ) {
                var param = {
                    operator_nbr: 1,
                    op_time: Util.formatTime(new Date()),
                    device_nid: uuidv4(),
                    device_trace_nbr: uuidv4(),
                    Op_type: 4,
                    DeviceCode: obj.DeviceCode
                }

                try {
                    var res = await this.http.post({ Message_type: 'Y1004', strRcvMessage: JSON.stringify( param ) })

                    if( res.Iresult == 0 && Array.isArray( res.Device_Info ) ) {
                        this.deviceInfo = res.Device_Info[0]
                        this.showDeviceInfoEdit = true
                        return
                    }

                    //找不到该DeviceCode对应设备信息时,解除该模型与该DeviceCode的关联关系
                    if( res.Iresult == 99 ) delete obj.DeviceCode

                } catch (error) {}
            }

            this.deviceInfo = Object.assign({
                DeviceTypeID: typeId,
                EQUBoxName: typeName,
                Location: '',
                EUQType: typeName,
                IPAddress: '',
                SiteName: typeName
            }, deviceInfo)

            this.showDeviceInfoEdit = true
        },


        async confirmBind(){

            var obj = this.mode == 1 ? selected : object

            try {

                var res = await this.saveDevice( obj.DeviceCode )

            } catch (error) { return this.$message.error('保存设备信息失败') }

            this.showDeviceInfoEdit = false

            this.$emit( 'add' )

            if( res.Iresult == 0 && res.DeviceCode == undefined ) return this.$message.success('保存设备信息成功')

            if( res.DeviceCode ) {

                obj.DeviceCode = res.DeviceCode

                this.saveModel()

                if( this.mode == 0 ) {
                    selected = obj
                    object = null
                    viewer.add(selected)
                    this.showTool = true
                    this.mode = 1 // 保存完成后进入编辑模式

                    this.initTransform()
                }

                

            }else{ this.$message.warning(res.Msg) }

        },

        /* 编辑/新增设备 */
        saveDevice( DeviceCode ){

            var deviceInfo = {
                operator_nbr: 1,
                op_time: Util.formatTime(new Date()),
                device_nid: uuidv4(),
                device_trace_nbr: uuidv4(),
                Op_type: 1,
                ...this.deviceInfo
            },
            Message_type = 'Y1001'

            if( DeviceCode ) {
                deviceInfo.DeviceCode = DeviceCode
                deviceInfo.Op_type = 2
                Message_type = 'Y1002'
            }

            var parma = {
                Message_type,
                strRcvMessage: JSON.stringify( deviceInfo )
            }

            return this.http.post(parma)

        },

        saveToJson( data ){

            var res = data.map(item => {
                let obj = {}
                obj.name = item.name
                obj.position = item.position.toArray()
                obj.quaternion = item.quaternion.toArray()
                obj.scale = item.scale.toArray()
                obj.DeviceCode = item.DeviceCode
                return obj
            })

            return res
        },

        /**
         * 克隆材质
         * @param mat
         * @return {Array}
         * @private
         */
        _cloneMate( mat ) {

            let newMat;
            if ( Array.isArray( mat ) ) {
                newMat = [];
                mat.forEach( m => {

                    let nm = m.clone()
                    nm.opacity0 = m.opacity0;
                    nm.transparent0 = m.transparent0;

                    newMat.push( nm );
                } );
            } else {

                newMat = mat.clone();
                newMat.opacity0 = mat.opacity0;
                newMat.transparent0 = mat.transparent0;

            }

            return newMat;
        },

        exit(){
            
            this.showDeviceInfoEdit = false

            this.restore()

            Util.resetCamera()

            this.$emit( 'exit' )
        }

    }

}

</script>

<style lang="scss" scoped>

.device{
    width: 406px;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1;
    background-color: rgba(0,0,0,0.3);
    .btn{
        position: absolute;
        bottom: 10px;
        width: 80%;
        margin: 0 10%;
        /deep/ .el-button{
            width: 100%;
        }
    }
    p{
        padding: 0 20px;
    }
    p:nth-child(1){
        margin-top: 100px;
        font-size: 16px;
        color: #fff;
    }
    p:nth-child(2){
        font-size: 12px;
        color: #3d9dff;
        margin-top: 10px;
    }
    ul{
        padding: 20px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        position: relative;
        li{
            width: 80px;
            height: 110px;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 10px 0;
            cursor: pointer;
            div{
                width: 80px;
                height: 80px;
                line-height: 80px;
                border: dashed 1px #3d9dff;
                text-align: center;
                img{
                    width: 70px;
                    margin: 5px;
                }
            }
            p{
                width: 100%;
                text-align: center;
            }
        }
    }
}
.tool{
    width: 100vw;
    position: fixed;
    bottom: 20px;
    .btns{
        display: flex;
        justify-content: center;

    }
    span{
        width: 80px;
        height: 35px;
        line-height: 35px;
        border-radius: 17px;
        text-align: center;
        background-color:rgba(83, 168, 255, 0.5);
        color: #fff;
        margin: 0 10px;
        font-weight: bold;
        cursor: pointer;
    }
    .active{
        background-color:rgba(83, 168, 255, 1);
    }
    .complete{
        position: absolute;
        right: 10px;
        bottom: 0;
    }
    .del{
        position: absolute;
        right: 110px;
        bottom: 0;
    }
    .bind{
        position: absolute;
        right: 210px;
        bottom: 0;
    }
    .cancle{
        position: absolute;
        right: 10px;
        bottom: 50px;
    }
}
.inputs{
    width: 400px;
    position: absolute;
    top: 100px;
    left: 40vw;
    background-color: #fff;
    border-radius: 5px;
    overflow: hidden;
    .head{
        background-color: #264675;
        width: calc(100% - 80px);
        padding: 0 40px;
        height: 40px;
        line-height: 40px;
        color: #FFF;
    }
    .row{
        margin-top: 20px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-content: center;
        span{
            display: block;
            width: 80px;
            height: 40px;
            line-height: 40px;
        }
        input{
            width: 240px;
            height: 34px;
            border: 1px solid #264675;
            padding-left: 5px;
            border-radius: 2px;
        }
    }
    .foot{
        width: 100%;
        border-top: 1px solid #E9F3FF;
        margin-top: 20px;
        padding: 15px 0;
        display: flex;
        justify-content: flex-end;
        button{
            width: 90px;
            height: 38px;
            line-height: 38px;
            border-radius: 5px;
            text-align: center;
            border: none;
            background-color: #E9F3FF;
            margin: 0 10px;
            cursor: pointer;
        }
        button:nth-child(2){
            background-color: #264675;
            color: #fff;
        }
    }
}

</style>
