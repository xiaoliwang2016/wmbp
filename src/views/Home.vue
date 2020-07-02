<template>
	<div class="home">

		<top-bar @change="menuChange"></top-bar>

		<device ref="device" v-if="showAddDevice" @update="data => userModelData=data" @add="loadUserDevice" @exit="showAddDevice = false" ></device>

		<loading-progress :value="seepWide"></loading-progress>

		<div ref="canvas" class="canvas_container"></div>

		<aside-left v-if="menuIndex==0 && toggleShow" :list="userDeviceData" @fatherMethod="menuChange"></aside-left>
		<aside-right v-if="menuIndex==0 && toggleShowRig"></aside-right>

		<!--运维-->
		<template v-if="!showAddDevice">
			<preserve-left v-if="menuIndex==2" :dataVal="userDeviceData"></preserve-left>
			<preserve-right v-if="menuIndex==2" :list="userDeviceData" @deleteEvent="loadUserDevice" @addDevice="showAddDevice = true"></preserve-right>
		</template>

		<!--报警-->
		<!-- <police-left v-if="menuIndex==3"></police-left> -->

		<!-- 巡检 -->
		<inspection v-if="menuIndex == 5"></inspection>

	</div>
</template>


<script>
import { v4 as uuidv4 } from 'uuid'

import Device from '@/components/device'
import LoadingProgress from '@/components/progress'
import TopBar from '@/components/header'
import Inspection from '@/components/inspection'

import asideLeft from '@/components/asideLeft'
import asideRight from '@/components/asideRight'
import preserveLeft from '@/components/preserveLeft'
import preserveRight from '@/components/preserveRight'


import { sdkConfig, paths, barrierPaths, deviceNames } from '@/config'
import Util from '@/utils/util'
import Tool from '@/utils/tool'

import modelData from '@/mock/data.json'
import deviceData from '@/mock/device.json'


var model,
	materialEditor

export default {
	name: "Home",
	data(){
		return {
			seepWide: 0,
			menuIndex: 0,
			userModelData: [],
			userDeviceData: [],
			toggleShow: false,
			toggleShowRig: false,
			showAddDevice: false
		}

	},
	components: {
		LoadingProgress,
		TopBar,
		Device,
		Inspection,
		//LTX
		asideLeft,
		asideRight,
		preserveLeft,
		preserveRight
	},

	mounted(){

		this.initCanvas()

		// this.initHelper()

		this.loadUserDevice()

		window.deviceStatus = {}

		this.getDeviceStatus()

		setInterval( this.getDeviceStatus , 30000 )

		window.userDevices = []
	},

	beforeDestroy(){

		viewer.dispose()

		window.viewer = null
	},	

	methods: {

		initCanvas(){

			try {

				this.viewer = new AMRT.Viewer( this.$refs.canvas, sdkConfig )

				window.viewer = this.viewer

			} catch (error) {

				return this.$message.error('初始化容器失败')

			}

			new AMRT.ModelLoader(this.viewer).load( paths,
                m => {
					model = m

					viewer.addModel(m)

					this.initScene(paths.scene)

					materialEditor = new AMRT.MaterialEditor(this.viewer, m)

					window.materialEditor = materialEditor

					//加载自动道闸模型
					new AMRT.ModelLoader(this.viewer).load( barrierPaths,
						m => {
							this.seepWide = 100

							var group = Util.calculateModel(m)

							group.name = 'ZDDZ'

							viewer.modelGroup.add(group)

							this.initUserModel()
						}
					)
                },
                pct => {
                    this.seepWide = parseInt(pct * 0.99)
                }
            )
            .addEventListener(AMRT.Event.MATERIAL_LOADED, () => {

				this.initCamera()

			})


		},

		initScene(scene){

			var timestamp = new Date().getTime()

			this.viewer.loadSceneData(scene, data => {

				if( data.e ) {
					this.viewer.loadEnvMap(data.e, map => {
						model.setEnvMap(map)
					})
				}
			})
		},

		initCamera(){

			Util.initHomeCamera()

			// this.viewer.controls.enableZoom = false

			// this.viewer.controls.enablePan = false

			// this.viewer.controls.enableRotate = false
		},

		
		initHelper(){

			this.viewer.add(new AMRT.AxisHelper(1000, 1000, 1000))

		},

		/* 加载用户自定义模型数据 */
		initUserModel(){

			this.hideAllDevice()

			this.loadModelData()

			// Tool.exportData()

		},

		/* 隐藏所有设备对应的模型 */
		hideAllDevice(){

			deviceNames.map( item => {

				if( viewer.modelGroup.getObjectByName(item) ) viewer.modelGroup.getObjectByName(item).visible = false

			} )

		},

		/* 加载设备模型 */
		async loadModelData(){

            var parma = {
                operator_nbr: 1,
                op_time: Util.formatTime(new Date()),
                device_nid: uuidv4(),
                device_trace_nbr: uuidv4()
			}

			try {

				var res = await this.http.post({ Message_type: 'Y1006', strRcvMessage: JSON.stringify( parma ) })

				try {
					let ModelPara = JSON.parse( res.ModelPara )
					if( Array.isArray(ModelPara) ) this.userModelData = ModelPara
				} catch (error) { }

				console.log(this.userModelData);

				// mock 数据
				// this.userModelData = modelData

				userDevices = this.userModelData.map( m => {

					if( !m.name ) return

					var object = viewer.modelGroup.getObjectByName(m.name)
					if( !object ) return

					let obj = object.clone()
					obj.position.copy( new AMRT.Vector3().fromArray(m.position) )
					obj.scale.copy( new AMRT.Vector3().fromArray(m.scale) )
					obj.rotation.setFromQuaternion( new AMRT.Quaternion().fromArray(m.quaternion) )
					obj.name = m.name
					obj.visible = true

					obj.DeviceCode = m.DeviceCode
					viewer.add(obj)
					return obj
				} )

				userDevices = userDevices.filter( item => item )

				setTimeout( this.updateDevice,  1500 )

			} catch (error) { this.$message.error( '获取模型数据失败(Y1006)' ) }

			// Tool.addDevice( userDevices )
			
			//删除无效设备
			// setTimeout(() => {
			// 	Tool.deleteUnbindDevice(this.userDeviceData)
			// }, 5000)

		},

		/* 加载设备信息 */
		async loadUserDevice(){

            var param = {
                operator_nbr: 1,
                op_time: Util.formatTime(new Date()),
                device_nid: uuidv4(),
                device_trace_nbr: uuidv4(),
                Op_type: 4
			}

			try {
				var res = await this.http.post({ Message_type: 'Y1004', strRcvMessage: JSON.stringify( param ) })

				if( res.Iresult == 0 ) {
					this.userDeviceData = res.Device_Info//设备数据
					this.toggleShow=true
					// Tool.delDevice(res.Device_Info)
					return
				}else{ throw 500 }

			} catch (error) { this.$message.error('获取设备信息错误') }
		},

		/* 检查设备信号，更新设备状态 */
		async updateDevice(){

			var models = viewer.root.children

			setInterval(() => {
				
				//信号灯
				let lightData = deviceStatus.T1006 || []

				lightData.map( item => {
					models.map( light => {
						if( light.DeviceCode == item.DeviceCode ){
							let status
							if( item.Red_Status == '1' ) status = 'red'
							if( item.Green_Status == '1' ) status = 'green'
							if( item.Yellow_Status == '1' ) status = 'yellow'
							this.setTrafficLight( light, status )
						}
					})
				})

				//道闸
				let barrierData = deviceStatus.T1003 || []

				barrierData.map( item => {
					models.map( barrier => {
						if( barrier.DeviceCode == item.DeviceCode ){
							let status
							if( item.Open_Status == '1' ) status = 'open'
							if( item.Close_Status == '1' ) status = 'close'
							this.setBarrier( barrier, status )
						}
					})
				})

				//火灾报警器
				let fireAlarmorData = deviceStatus.T1012 || []
				let JetfanData = deviceStatus.T1008 || []
				let TelData = deviceStatus.T2001 || []
				let alarmData = fireAlarmorData.concat( JetfanData ).concat( TelData )

				alarmData.map( item => {
					models.map( alarm => {
						if( alarm.DeviceCode == item.DeviceCode ){
							let status
							if( item.Alarm_Status == '1' ) status = 'red'
							if( item.Fire_Status == '1' ) status = 'yellow'
							if( item.Call_Status == '1' ) status = 'yellow'
							this.setAlarmorStatus( alarm, status )
						}
					})
				})

			}, 3000)
		},

		/* 设置自动道闸状态 */
		setBarrier( model, status ){
			
			let zadao01 = model.getObjectByName('zadao01'),
				zadao02 = model.getObjectByName('zadao01')

			if( !zadao01 ) return

			switch (status) {

				case 'close':
					zadao01.rotation.set( -Math.PI / 2, 0, 0 )
					zadao02.rotation.set( -Math.PI / 2, 0, 0 )
					break;

				case 'open':
					zadao01.rotation.set( 0, 0, 0 )
					zadao02.rotation.set( -Math.PI, 0, 0 )
					break;
			}

		},

		/* 设置交通信号灯颜色 */
		setTrafficLight( model, status ){
			var hex
			switch (status) {
				case 'red':
					hex = 0xff0000
				break
				case 'yellow':
					hex = 0xffff00
				break
				case 'green':
					hex = 0x00ff00
				break
			}

			model.getObjectByName('xinhaodeng01') && model.getObjectByName('xinhaodeng01').material[0].color.setHex(hex)
			model.getObjectByName('xinhaodeng03') && model.getObjectByName('xinhaodeng03').material[0].color.setHex(hex)
			model.getObjectByName('xinhaodeng005') && model.getObjectByName('xinhaodeng005').material[0].color.setHex(hex)
			model.getObjectByName('xinhaodeng006') && model.getObjectByName('xinhaodeng006').material[0].color.setHex(hex)
			model.getObjectByName('huangdeng001') && model.getObjectByName('huangdeng001').material[0].color.setHex(hex)
			model.getObjectByName('huangdeng') && model.getObjectByName('huangdeng').material[0].color.setHex(hex)
		},

		/* 设置设备报警状态 */
		setAlarmorStatus( model, status ){

			var hex
			switch (status) {
				case 'red':
					hex = 0xff0000
				break
				case 'yellow':
					hex = 0xffff00
				break
			}

			try {

				if( model.children[0].material[0].color.getHex() == hex ) return

				model.children.map(item => {
					if( item.material[0].isClone ) {
						if( hex ) {
							item.material[0].color.setHex(hex)
						}else{
							item.material[0].color.copy(viewer.modelGroup.getObjectByName(item.name).material[0].color)
						}
						return
					}else{
						let mat = item.material[0].clone()
						mat.isClone = true
						hex && mat.color.setHex(hex)
						item.material[0] = mat
					}
				})
			} catch (error) {  }
		},

		/* 定期拉取设备状态 */
		getDeviceStatus(){
			Util.getDeviceStatus().then(res => {
				console.log(res)
				if( res.Iresult == 0 ) deviceStatus = res
				this.toggleShowRig=true
			} )

		},

		menuChange(i){
			this.showAddDevice = false
			this.menuIndex = i
		}

	}

}
</script>

<style lang="scss">
	@import '@/assets/css/home.scss';
</style>
