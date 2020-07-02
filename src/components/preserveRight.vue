<template>
    <main class="aside" :style="{right: toggleAside ? 0 : '-740px'}">
        <div class="car-statistical">
            <h6 class="sky-title">
                <img src="@/assets/img/title.png">
                <span>设备列表查询</span>
            </h6>

            <div class="search">
                <div>
                    <p> <span>设备名称</span> <el-input v-model="options.DeviceName"></el-input></p>
                    <p>
                        <span>设备类型</span>
                        <el-select v-model="options.DeviceTypeID" placeholder="请选择" @change="initOutLine">
                            <el-option
                                v-for="(item, index) in deviceData"
                                :key="index"
                                :label="item.typeName"
                                :value="item.typeId">
                            </el-option>
                        </el-select>
                    </p>
                    <p>
                        <el-button type="primary">查找</el-button>
                        <el-button type="primary" @click="() => { options = { DeviceName: '', DeviceTypeID: '' } }">清空</el-button>
                    </p>
                </div>
                <div>
                    <p>
                        <el-button type="primary" @click.stop="addDevice">设备部署</el-button>
                    </p>
                </div>
            </div>

            <el-table :data="deviceList" style="width: 100%" :height="tableHeight" :row-class-name="tableRowClassName" >

                <el-table-column prop="DeviceCode" label="设备号" width="80" ></el-table-column>

                <el-table-column prop="EQUBoxName" label="设备名称"></el-table-column>

                <el-table-column prop="EUQType" label="设备型号"></el-table-column>

                <el-table-column prop="IPAddress" label="ip地址"></el-table-column>

                <el-table-column prop="SiteName" label="站点名称"></el-table-column>

                <el-table-column prop="Location" label="位置"></el-table-column>


                <el-table-column label="操作" width="100" >
                    <template slot-scope="scope">
                        <el-button type="primary" @click="moveTo(scope.row.DeviceCode)">3D定位</el-button>
                        <!-- <el-button type="primary" @click="delDevice(scope.row.DeviceCode)">删除</el-button> -->
                    </template>
                </el-table-column>

            </el-table>
        </div>

        <canvas @click.stop="showCanvas = false" v-show="showCanvas" ref="canvas" class="canvas" width="400px" height="400px" :style="{ top: coordinate.y + 'px', left: coordinate.x + 'px' }"></canvas>

        <img src="@/assets/img/bang.png" class="sky-img" @click="toggleAside=!toggleAside">

        <span @click.stop="toEdit" ref="menu" v-show="showEditTips" class="menu" :style="{ left: editCoordinate.x + 'px', top: editCoordinate.y + 'px' }" >编辑设备</span>

    </main>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import Util from '@/utils/util'
import { obstacleNames, deviceData } from '@/config'
import messageMixin from '@/mixin/message'
import outlineMixin from '@/mixin/outline'

import { mapState, mapMutations } from "vuex"

var tmpStatus = [], mouse = new AMRT.Vector2(), raycaster = new AMRT.Raycaster(), target

export default {

    name: 'preserve-r',

    props: [ 'list' ],

    mixins: [ messageMixin, outlineMixin ],

    data() {
        return {
            coordinate: {
                x: 0,
                y: 0
            },
            editCoordinate: {
                x: 0,
                y: 0
            },
            showCanvas: false,
            deviceData: [],
            options: {
                DeviceTypeID: '',
                DeviceName: ''
            },
            tableHeight: document.body.offsetHeight - 280,
            toggleAside: true,
            showEditTips: false
        }
    },

    computed: {
        deviceList(){
            var list = this.list.filter(item => {
                if( this.options.DeviceTypeID ) return item.DeviceTypeID == this.options.DeviceTypeID
                if( this.options.DeviceName ) return item.DeviceName == this.options.DeviceName
                return true
            })
            return list
        }
    },

    mounted() {

        this.deviceData = [ { typeName: '全部', typeId: '' }, ...deviceData ]

        this.options.DeviceTypeID = this.deviceData[0].typeId

        setInterval( this.updateList, 3000 )

        viewer.controls.addEventListener( 'reset', this.resetEvent )

        window.addEventListener( 'mousedown', this.clickEvent )

        this.$refs.menu.addEventListener('contextmenu', e => e.preventDefault() )

        this.SetCharts( true )

    },

    beforeDestroy(){

        clearInterval( this.updateList )

        viewer.controls.removeEventListener( 'reset', this.resetEvent )

        window.removeEventListener( 'mousedown', this.clickEvent )

        window.removeEventListener( 'keydown', this.keyDownEvent )
    },

    methods: {

        ...mapMutations({
            SetMode: "SetMode",
            SetCharts: "SetCharts"
        }),

        resetEvent(){
            this.toggleAside = true
            this.SetCharts( true )
            this.showCanvas = false
            this.showEditTips = false
            this.initOutLine()
        },

        initOutLine(){

            // this.outlinePass.selectedObjects = []

            var selectedCodes = this.deviceList.map(item => item.DeviceCode)
            
            let selecteds = []
            
            viewer.root.children.map( item => {
                if( selectedCodes.includes(item.DeviceCode) ) selecteds.push(item)
            })

            this.outlinePass.selectedObjects = selecteds
        },

        clickEvent(e){
            if( e.button == 2 ) {
                target = e
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
                raycaster.setFromCamera( mouse, viewer.camera )
                var intersects = raycaster.intersectObjects( userDevices, true )
                if( intersects.length > 0 ) {
                    var coordinate = new AMRT.Vector3().copy( intersects[0].point ).project( viewer.camera )
                    this.editCoordinate.x = Math.round((0.5 + coordinate.x / 2) * window.innerWidth)
                    this.editCoordinate.y = Math.round((0.5 - coordinate.y / 2) * window.innerHeight)
                    this.showEditTips = true
                }else{
                    this.showEditTips = false
                }
            }
        },

        toEdit(e){
            window.target = target
            this.SetMode( 'edit' )
            this.$emit( 'addDevice' )
        },

        async delDevice(DeviceCode){

            var param = {
                operator_nbr: 1,
                op_time: Util.formatTime(new Date()),
                device_nid: uuidv4(),
                device_trace_nbr: uuidv4(),
                Op_type: 3,
                DeviceCode
            }

            try {
                var res = await this.http.post({ Message_type: 'Y1003', strRcvMessage: JSON.stringify( param ) })

                res.Iresult == 0 && this.$message.success(res.Msg)

                this.$emit( 'deleteEvent' )
            } catch (error) { this.$message.error('删除失败') }
        },

        addDevice(){

            Util.resetCamera().then(() => {

                this.outlinePass.selectedObjects = [ viewer.modelGroup.getObjectByName('Shape023') ]

                this.$message.info('点击隧道选择设备部署位置')

                window.addEventListener('click', this.selectPosition)
            })
        },

        /* 点击选择部署位置 */
        selectPosition( event ){

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1

            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

            raycaster.setFromCamera( mouse, viewer.camera )

            var intersects = raycaster.intersectObjects( [ viewer.modelGroup.getObjectByName('Shape023') ] )

            if( intersects.length > 0 ) {

                let p = intersects[0].point, _this = this

                viewer.controls.setTarget( p.x + 1, p.y + 2, p.z )
                viewer.controls.flyTo({
                    position: {x: p.x, y: p.y + 2, z: p.z},
                    time: 1500,
                    complete: function () {
                        window.removeEventListener('click', _this.selectPosition)
                        _this.SetMode( 'add' )
                        _this.$emit( 'addDevice' )
                    }
                })
            }
        },

        updateList(){

            tmpStatus = []

            for (const k in deviceStatus) {
                if(Array.isArray(deviceStatus[k])){
                    tmpStatus = tmpStatus.concat( deviceStatus[k] )
                }
            }

            tmpStatus.map( item => {
                this.list.map( (device, index) => {
                    if( item.DeviceCode == device.DeviceCode ){
                        if( item.Alarm_Status == '1' ) {
                            this.$set( this.list[index], 'alarm', true )
                        }
                    }
                })
            })
        },

        tableRowClassName({row, rowIndex}){
            return row.alarm ? 'blink' : ''
        },

        moveTo(DeviceCode){

            var device, obstacleObjects = []

            obstacleNames.map( item => obstacleObjects.push( viewer.modelGroup.getObjectByName(item)) )

            userDevices.map(item => {

                if( item.DeviceCode == DeviceCode ) device = item
            })

            if( !device ) return this.$message.warning('模型数据丢失')

            this.toggleAside = false
            this.SetCharts( false )

            this.outlinePass.selectedObjects = [ device ]

            var dest = new AMRT.Vector3().copy(device.position)

            var rayDirections = [
                new AMRT.Vector3( 1, 0, 0 ),
                new AMRT.Vector3( -1, 0, 0 ),
                new AMRT.Vector3( 0, 1, 0 ),
                new AMRT.Vector3( 0, -1, 0 ),
                new AMRT.Vector3( 0, 0, 1 ),
                new AMRT.Vector3( 0, 0, -1 )
            ]

            rayDirections.map(item => {

                raycaster.set( dest, item )

                let intersects = raycaster.intersectObjects( obstacleObjects )

                if( intersects.length > 0 ) {

                    if( intersects[0].distance < 1 ) {

                        let v = new AMRT.Vector3().sub(item)

                        dest.addScaledVector( v, 2 )
                    }
                }
            })

            viewer.camera.position.copy(dest)
            viewer.camera.position.x -= 5
            viewer.controls.target.copy(new AMRT.Vector3().copy( device.position ))

            this.showCanvas = false

            window.addEventListener( 'keydown', this.keyDownEvent )

            setTimeout(() => {

                this.selected = device

                var coordinate = new AMRT.Vector3().copy( device.position ).project( viewer.camera )
                this.coordinate.x = Math.round((0.5 + coordinate.x / 2) * window.innerWidth)
                this.coordinate.y = Math.round((0.5 - coordinate.y / 2) * window.innerHeight)

                //获取设备信息 通过canvas展示
                this.getDeviceByCode( DeviceCode ).then(res => {

                    if( res.Iresult == 0 && Array.isArray(res.Device_Info) ){

                        this.deviceInfo = res.Device_Info[0]

                        this.calcDrawPosition( coordinate, res.Device_Info[0] )

                    }else{ this.calcDrawPosition( coordinate ) }
                })

                this.showCanvas = true
            }, 100)
        },

        
        keyDownEvent(e){

            if( e.keyCode == 27 ) Util.resetCamera()

            window.removeEventListener( 'keydown', this.keyDownEvent )

        }
    }
}
</script>

<style scoped lang="scss">
    .canvas{
        position: fixed;
        z-index: 1;
    }
    .aside{
        width: 700px;
        height: 100%;
        position: fixed;
        top: 0;
        right: 0;
        background:rgba(0,0,0,.3);
        color: #FFFFFF;
        padding: 80px 20px 0 20px;
        transition: right 1s;
    }
    .car-statistical{
        display: flex;
        padding:15px 0;
        flex-wrap: wrap;
        .search{
            width: 100%;
            /deep/ .el-input__inner{
                color: #fff;
            }
            div{
                display: flex;
                line-height: 60px;
                p{
                    width: 46%;
                    /deep/.el-button{
                        padding: 8px 15px;
                    }
                }
                /deep/.el-input{
                    width: 64%;
                    display: inline-block;
                    margin-left:5px;
                }
                /deep/.el-select{
                    width: 64%;
                    display: inline-block;
                    margin-left:5px;
                    .el-input{
                        width: 100%;
                    }
                    .el-input__icon{
                        line-height: 30px;
                        height: 30px;
                    }
                }
                /deep/.el-input__inner{
                    background:transparent;
                    height: 30px;
                    line-height: 30px;
                }
            }
        }
    }

    .sky-title{
        width: 100%;
        padding: 10px 0;
        span{
            margin-left: -15px;
        }
    }

    .font-r{
        color: #f56363;
    }
    .font-b{
        color: #24afff;
    }
    .font-y{
        color: #f29317;
    }


    /deep/.el-table{
        background:transparent;
        color: #218af5;
        flex: none;
    }
    /deep/.el-table__expanded-cell{
        background:transparent;
    }
    /deep/.el-table--enable-row-hover .el-table__body tr:hover>td{
        background:transparent;
    }
    /deep/.el-table th{
        background:transparent;
        color: #ffffff;
        font-size: 12px;
        padding:8px 0;
    }
    /deep/.el-table tr{
        background:transparent;
        color: #ffffff;
        font-size: 12px;
        .el-button{
            padding: 7px 10px;
        }
    }
    /deep/.el-table thead{
        background-color:rgba(33,138,245,.3);
    }
    .sky-img{
        position: absolute;
        top: calc(50% - 65px);
        left: -76px;
        transform: rotate(90deg);
        cursor: pointer;
    }
    .menu{
        position: fixed;
        width: 110px;
        height: 40px;
        line-height: 40px;
        display: block;
        text-align: center;
        top: 0;
        left: 0;
        background-color: rgba(21, 113, 202, 0.5);
        cursor: pointer;
    }
</style>
<style>
    /* 定义keyframe动画，命名为blink */
    @keyframes blink{
    0%{opacity: 1;}
    100%{opacity: 0;} 
    }
    /* 添加兼容性前缀 */
    @-webkit-keyframes blink {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
    @-moz-keyframes blink {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
    @-ms-keyframes blink {
        0% {opacity: 1; } 
        100% { opacity: 0;}
    }
    @-o-keyframes blink {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
    /* 定义blink类*/
    .blink{
        color: #dd4814 !important;
        animation: blink 1s linear infinite;
        cursor: pointer;
        /* 其它浏览器兼容性前缀 */
        -webkit-animation: blink 1s linear infinite;
        -moz-animation: blink 1s linear infinite;
        -ms-animation: blink 1s linear infinite;
        -o-animation: blink 1s linear infinite;
    }
    .blink:hover{
        animation: none;
    }
</style>
