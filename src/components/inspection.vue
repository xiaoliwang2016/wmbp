<template>
    <div>
        <img v-if="showHelper" @click.stop="hideHelper" class="helper" src="@/assets/img/helper.png" />

        <div :class="['left', showList ? '' : 'left-hidden']" >
            <ul>
                <li v-for="(item, index) in list" :key="item.uuid" class="item" >
                    <span class="title">{{item.name}}</span>
                    <p>
                        <el-button @click="selectLine(item)" size="mini" type="primary">开始巡检</el-button>
                        <el-button icon="el-icon-delete" circle @click.stop="deletePath(index)"></el-button>
                    </p>
                </li>
            </ul>

            <img src="../assets/img/header-btn-1.png" :class="['btn', showList ? '' : 'btn-1']" @click="showList = !showList" />
        </div>
        
        <div class="right">

            <img src="@/assets/img/icon1.png" @click="prepareInspection" v-show="!isInspection" />

            <img src="@/assets/img/icon2.png"  v-show="isInspection" />

            <img src="@/assets/img/icon3.png" @click.stop="drawPath" v-show="!isEdit" />

            <img src="@/assets/img/icon4.png" @click.stop="drawPath" v-show="isEdit" />

            <div class="tool" v-show="isSetEnd">
                <span @click.stop="addPath">添加路径</span>
                <span @click.stop="showPrompt">保存路径</span>
                <span @click.stop="clearPath">清空路径</span>
            </div>

            <!-- <span v-show="isSetStart" class="dialog" :style="{ left: dialog1.left + 'px', top: dialog1.top + 'px' }"> 开始位置 </span>

            <span v-show="isSetEnd" class="dialog" :style="{ left: dialog2.left + 'px', top: dialog2.top + 'px' }"> 结束位置 </span> -->

            <canvas @click.stop="hideCanvas" v-show="showCanvas" ref="canvas" class="canvas" width="400px" height="400px" :style="{ top: coordinate.y + 'px', left: coordinate.x + 'px' }"></canvas>

        </div>
    </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import Util from '@/utils/util'

import { mapState, mapMutations } from "vuex"

import messageMixin from '@/mixin/message'
import firstPersonMixin from '@/mixin/firstPerson'


var groudMesh = [],
	sphere,
    spheres = [],
    spheres_segment = [],
	startSpot,
	endSpot,
    raycaster = new AMRT.Raycaster(), 
    mouse = new AMRT.Vector2(),
    spotArr = [],
    tween
    
export default {

    name: 'inspection',

    data(){
        return {
            list: [],
            isInspection: 0,
            isEdit: false,
            dialog1: { top: 0, left: 0 },
            dialog2: { top: 0, left: 0 },
            isSetEnd: false,
            isSetStart: false,
            showCanvas: false,
            coordinate: {
                x: 0,
                y: 0
            },
            showHelper: !window.isShowHelp,
            showList: true
        }
    },

    mixins: [ messageMixin, firstPersonMixin ],

    mounted(){

        this.init()

        groudMesh = [ viewer.modelGroup.getObjectByName('Shape023') ]

        sphere = new AMRT.Mesh( new AMRT.SphereBufferGeometry( 0.1, 32, 32 ), new AMRT.MeshBasicMaterial( { color: 0xff0000 } ) )
        window.sphere = sphere

        window.addEventListener( 'click', this.selectDevice )

        this.initFirstPersonControls()

        firstPersonControls.addEventListener( 'move', this.updateCanvasPosition )

    },

    beforeDestroy(){

        this.clearPath()
        this.clearListener()

        window.removeEventListener( 'click', this.selectDevice )

        this.disposeFirstPersonControls()

    },

    methods: {

        ...mapMutations({

            SetInspection: "SetInspection"
        }),

        async init(){

            this.initCamera()

            let param = {
                operator_nbr: 1,
                op_time: Util.formatTime(new Date()),
                device_nid: uuidv4(),
                device_trace_nbr: uuidv4()
            }

            try {

                var res = await this.http.post({ Message_type: 'Y1008', strRcvMessage: JSON.stringify( param ) })

                this.list = JSON.parse( res.Para )

                console.log(this.list);
                
            } catch (error) { this.$message.error('获取巡检路线数据失败') }

        },

        initCamera(){

            const initPosition = { x: -675.747, y: -0.013, z: 160.22 }

            viewer.camera.position.set( initPosition.x, initPosition.y, initPosition.z )

        },


        selectDevice(event){

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1

            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

            raycaster.setFromCamera( mouse, viewer.camera )

            var intersects = raycaster.intersectObjects( userDevices, true )

            if( intersects.length > 0 ) {

                this.selected = this.getCompleteModel(intersects[0].object)

                if( this.selected.DeviceCode ) {

                    var tempV = new AMRT.Vector3().copy( this.selected.position ).applyMatrix4( viewer.camera.matrixWorldInverse).applyMatrix4( viewer.camera.projectionMatrix )

                    if ( (Math.abs(tempV.x) > 1) || (Math.abs(tempV.y) > 1) || (Math.abs(tempV.z) > 1) ) return

                    tween && tween.stop()

                    //获取设备信息 通过canvas展示
                    this.getDeviceByCode( this.selected.DeviceCode ).then(res => {

                        if( res.Iresult == 0 && Array.isArray(res.Device_Info) ) {
                            this.deviceInfo = res.Device_Info[0]
                        }

                        this.updateCanvasPosition()
                    })
                }else { this.deviceInfo = null }
            }
        },


        selectLine(item){

            if(this.isInspection) return this.$message.warning('当前巡检正在进行中，请稍后再试')

            this.startInspection( item.data )
            
        },

        prepareInspection(){

            if( !startSpot || !endSpot ) return this.$message.warning('请先绘制路线')

            this.startInspection( spotArr.map( item => item.position.toArray() ) )

        },

        /**
         * 开启巡检
         * data Array[Vector3]
         */
        startInspection( data ){

            this.SetInspection( true )
            this.isInspection = true

            viewer.controls.enableRotate = false

            this.disposeFirstPersonControls()

            var paths = data.map( item => {
                let v = new AMRT.Vector3().fromArray(item)
                v.setY( v.y + 2 )
                return v
            })

            this.clearPath()

            this.flyTo( paths, 0 )

        },

        flyTo( paths, i ){

            var origin = paths[i], dest = paths[i + 1]

            viewer.camera.position.copy( origin )

            let v = new AMRT.Vector3().subVectors( dest, origin ).normalize()

            let target = new AMRT.Vector3().copy( dest ).addScaledVector( v, 1 )

            viewer.controls.setTarget(target.x, target.y, target.z)

            let _this = this, time = origin.distanceTo( dest )
            
            tween = new AMRT.TWEEN.Tween( viewer.controls.camera.position )
                .to( dest, Math.ceil(time) * 500 )
                .onComplete(() => {
                    i < paths.length - 2 ? _this.flyTo( paths, ++i ) : _this._restore()
                })
            tween.start()
        },

        /* 绘制路线 */
        drawPath(){

            if( this.isEdit ) return

            this.clearPath()
            this.clearListener()

			window.addEventListener( 'click', this.addPoint )
            window.addEventListener( 'mousemove', this.lineToPoint )

            viewer.add(sphere)
            
            this.isEdit = true
        },

        /* 清空路线 */
        clearPath(){

            spheres.map( item => viewer.remove(item) )
            spheres = []

            startSpot = null
            endSpot = null

            spotArr.map( item => viewer.remove(item) )
            spotArr = []

            //清空图标
            this.isSetEnd = false
            this.isSetStart = false
        },

        /* 清空事件 */
        clearListener(){

            window.removeEventListener( 'click', this.addPoint )

            window.removeEventListener( 'mousemove', this.lineToPoint )

            viewer.remove(sphere)
        },

        lineToPoint(){

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

			raycaster.setFromCamera( mouse, viewer.camera )
			var intersects = raycaster.intersectObjects( groudMesh, true )

			if( intersects.length > 0 ) {

				if( startSpot ) {

					spheres_segment.map( item => viewer.remove(item) )

					var linePath = new AMRT.CatmullRomCurve3( [ startSpot.position, intersects[0].point ] )

					for (let i = 0.1; i < 1; i += 0.1 ) {
						
						let p = linePath.getPoint( i )

						let sp = sphere.clone()

						sp.position.copy( p )

						viewer.add( sp )

						spheres_segment.push( sp )

                    }

				} else {

					sphere.position.copy(intersects[0].point)

				}
			}	
        },
        
        addPoint(event){

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

			raycaster.setFromCamera( mouse, viewer.camera )

			var intersects = raycaster.intersectObjects( groudMesh, true )

			if( intersects.length > 0 ) {

				if( spotArr.length > 0 ) {

					endSpot = sphere.clone()

					endSpot.position.copy( intersects[0].point )

                    viewer.add(endSpot)
                    
                    this.dialog2.top = event.clientY - 50
                    this.dialog2.left = event.clientX - 50

                    this.isSetEnd = true
                    this.isEdit = false

                    spotArr.push( endSpot )

                    spheres = spheres.concat( spheres_segment )

                    spheres_segment = []

                    this.clearListener()
				} else {

					startSpot = sphere.clone()

					startSpot.position.copy(intersects[0].point)

                    viewer.add( startSpot )
                    
                    this.dialog1.top = event.clientY - 50
                    this.dialog1.left = event.clientX - 50

                    this.isSetStart = true

                    spotArr.push( startSpot )
				}

			}
        },

        addPath(){
            startSpot = endSpot
            this.isSetStart = true
			window.addEventListener( 'click', this.addPoint )
            window.addEventListener( 'mousemove', this.lineToPoint )
        },
        
        showPrompt(){
            this.$prompt('请输入路线名称', '提示', {
                confirmButtonText: '保存',
                cancelButtonText: '取消'
            }).then(({ value }) => {
                this.savePath( value )
            }).catch(() => {})
        },

        async savePath( name ){
            
            if( spotArr.length > 1 ){

                let data = spotArr.map( item => item.position.toArray() )

                let obj = {
                    name,
                    uuid: uuidv4(),
                    data
                }

                let param = {
                    operator_nbr: 1,
                    op_time: Util.formatTime(new Date()),
                    device_nid: uuidv4(),
                    device_trace_nbr: uuidv4(),
                    Para: JSON.stringify( [...this.list, obj] )
                }

                var res = await this.http.post({ Message_type: 'Y1007', strRcvMessage: JSON.stringify( param ) })
                
                if( res.Iresult == 0 ) {

                    this.$message.success('保存路线成功')

                    this.list.push(obj)
                    
                } else { this.$message.error(res.Msg) }
                
            }
        },

        deletePath(index){

            this.list.splice( index, 1 )

            let param = {
                operator_nbr: 1,
                op_time: Util.formatTime(new Date()),
                device_nid: uuidv4(),
                device_trace_nbr: uuidv4(),
                Para: JSON.stringify( this.list )
            }

            this.http.post({ Message_type: 'Y1007', strRcvMessage: JSON.stringify( param ) })
            
        },

        _restore(){
            this.initFirstPersonControls()
            firstPersonControls.addEventListener( 'move', this.updateCanvasPosition )
            viewer.controls.enableRotate = true
            tween = null
            this.isInspection = false
            this.SetInspection( false )
        },

        hideCanvas(){
    
            this.selected = null

            this.showCanvas = false

            tween && tween.start()
        },

        /* 实时更新canvas的位置 */
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
        },

        /* 根据点击的子网格获取完成模型 */
        getCompleteModel(mesh){

            if( mesh.parent.name.trim() == 'root' ) return mesh

            return this.getCompleteModel( mesh.parent )

        },

        hideHelper(){

            this.showHelper = false
            
            window.isShowHelp = true
        }

    }

}
</script>

<style lang="scss">
.left{
    position: fixed;
    left: 0;
    top: 0;
    z-index: 3;
    height: calc(100vh - 80px);
    padding-top: 80px;
    width: 400px;
    background-color: rgba(0,0,0,0.5);
    transition: left 1s;
    ul{
        .item{
            width: calc(100% - 40px);
            height: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            color: #fff;
            cursor: pointer;
            border-bottom: 1px dashed rgba(255,255,255,0.3);
            .title{
                display: inline-block;
                width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
    .btn{
        transform: translateX(-12px) rotate(-90deg);
        position: absolute;
        top: 10px;
        right: 0;
        cursor: pointer;
    }
    .btn-1{
        transform: translateX(-12px) rotate(90deg);
        right: -40px;
    }
}
.left-hidden{
    left: -400px;
}

.right{
    position: fixed;
    right: 20px;
    top: calc(50vh - 120px);
    display: flex;
    flex-direction: column;
    img{
        width: 80px;
        margin-top: 20px;
        cursor: pointer;
    }
    .dialog{
        position: fixed;
        z-index: 2;
        background: url('../assets/img/dialog-bg.png');
        background-size: 100px 40px;
        width: 100px;
        height: 40px;
        text-align: center;
        line-height: 30px;
    }
    .tool{
        position: absolute;
        right: 90px;
        bottom: 20px;
        width: 180px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: rgba($color: #1571CA, $alpha: 0.5);
        border-radius: 5px;
        span{
            display: block;
            width: 50%;
            height: 35px;
            line-height: 35px;
            text-align: center;
            color: #FFF;
            cursor: pointer;
            &:nth-child(1), &:nth-child(2){
                border-right: 1px dotted #fff;
            }
        }
    }
}

.canvas{
    position: fixed;
    z-index: 1;
}

.helper{
    width: 320px;
    position: fixed;
    z-index: 2;
    top: 150px;
    left: calc(50vw - 160px);
    padding: 20px;
    border-radius: 5px;
    background-color: rgba(17, 39, 60, 0.5);
        -webkit-user-drag: none;
}

</style>
