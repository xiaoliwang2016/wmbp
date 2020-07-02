<template>
    <div class="header">

        <h1> <img src="../assets/img/logo.png"> </h1>

        <ul :style="{top: showHeader ? '25px' : '-80px'}">
            <li @click="changeMenu(0)" :class="{ active: activeIndex == 0 }" >首页</li>
            <!-- <li @click="changeMenu(1)" :class="{ active: activeIndex == 1 }" >设备部署</li> -->
            <li @click="changeMenu(2)" :class="{ active: activeIndex == 2 }" >运维管理</li>
            <!-- <li @click="changeMenu(3)" :class="{ active: activeIndex == 3 }" >报警管理</li> -->
            <!-- <li @click="changeMenu(4)" :class="{ active: activeIndex == 4 }" >隧道漫游</li> -->
            <li @click="changeMenu(5)" :class="{ active: activeIndex == 5 }" >隧道巡检</li>
            <li @click="changeMenu(6)" :class="{ active: activeIndex == 6 }" >账号管理</li>

        </ul>

        <img src="../assets/img/header-btn-1.png" :class="['btn', showHeader ? '' : 'btn-1']" @click="toggleVisiable" />
        
    </div>
</template>

<script>

import { mapState, mapMutations } from "vuex"

import Util from '@/utils/util'

export default {

    name: 'TopBar',

    data(){

        return {
            activeIndex: 0,
            showHeader: true
        }

    },

    computed: {
        ...mapState({
            isInspection: state => state.isInspection
        })
    },
    
    methods: {

        changeMenu(i){

            if( this.isInspection ) return this.$message.info('巡检过程中请不要切换菜单')

            this.activeIndex = i

            switch (i) {
                case 0:
                    Util.initHomeCamera()
                    break;
                case 2:
                    Util.resetCamera()
                    break;
            }

            this.$emit('change', i)

        },

        toggleVisiable(){

            this.showHeader = !this.showHeader

        }

    }

}

</script>

<style lang="scss">

.header{
    width: calc(100vw - 40px);
    height: 80px;
    padding: 0 20px;
    color: #FFF;
    display: flex;
    align-items: center;
    position: fixed;
    top: 0;
    z-index: 2;
    h1{
        font-size: 20px;
        margin-right: 100px;
        img{
            width: 390px;
        }
    }
    ul{
        display: flex;
        position: absolute;
        left: calc(50vw - 210px);
        transition: top 1s;
        li{
            width: 80px;
            height: 35px;
            line-height: 35px;
            background-color: rgba($color: #0E2133, $alpha: 0.5);
            color: #FFF;
            text-align: center;
            margin-right: 30px;
            cursor: pointer;
        }
        .active{
            background-color: rgba($color: #1571CA, $alpha: 0.5)
        }
    }
    .btn{
        width: 25px;
        position: absolute;
        top: 80px;
        left: 50vw;
        transform: translateX(-12px);
        cursor: pointer;
    }
    .btn-1{
        transform: translateX(-12px) rotate(180deg);
        top: 20px;
    }
}

</style>