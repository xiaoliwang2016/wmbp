<template>
	<div class="home">

		<loading-progress :value="seepWide"></loading-progress>

		<div ref="canvas" class="canvas_container"></div>

	</div>
</template>


<script>
import { v4 as uuidv4 } from 'uuid'

import LoadingProgress from '@/components/progress'

import Util from '@/utils/util'

import { sdkConfig, paths } from '@/config'


var model, materialEditor

export default {
	name: "Home",
	data(){
		return {
			seepWide: 0,
		}

	},
	components: {
		LoadingProgress
	},

	mounted(){

		this.initCanvas()

		// this.initHelper()

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

			new AMRT.ModelLoader(this.viewer).load( paths.hengliang,
                m => {
					model = m

					viewer.addModel(m)

					// this.initScene(paths.scene)

					materialEditor = new AMRT.MaterialEditor(this.viewer, m)

					window.materialEditor = materialEditor

					this.seepWide = 100
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

			// this.viewer.controls.enableZoom = false

			// this.viewer.controls.enablePan = false

			// this.viewer.controls.enableRotate = false
		},

		
		initHelper(){

			this.viewer.add(new AMRT.AxisHelper(1000, 1000, 1000))

		}

	}

}
</script>

<style lang="scss">
	@import '@/assets/css/home.scss';
</style>
