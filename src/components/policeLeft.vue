<template>
    <main class="aside">
        <div class="car-statistical">
            <h6 class="sky-title">
                <img src="@/assets/img/title.png">
                <span>故障及报警管理</span>
            </h6>

            <ul>
                <li class="font-r">
                    <div>
                        <img src="@/assets/img/highway1.png" alt="">
                        <span>111</span>
                    </div>
                    <p>报警设备统计</p>
                </li>
                <li class="font-y">
                    <div>
                        <img src="@/assets/img/highway2.png" alt="">
                        <span>111</span>
                    </div>
                    <p>故障设备统计</p>
                </li>
            </ul>

            <el-table
                    :data="tableArr"
                    style="width: 100%"
                    :row-style="rowClass"
            >
                <el-table-column
                        type="index"
                        label="序号"
                        width="50"
                >
                </el-table-column>
                <el-table-column
                        label="设备名称"
                >
                    <template slot-scope="scope">
                       <span>{{scope.row.name | nameText}}</span>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="DeviceCode"
                        label="设备编号">
                </el-table-column>
<!--                <el-table-column-->
<!--                        prop="ip"-->
<!--                        label="报警事件">-->
<!--                </el-table-column>-->


                <el-table-column
                        label="操作"
                        width="80"
                >
                    <template slot-scope="scope">
                        <el-button type="primary" @click="moveTo(scope.row.DeviceCode)">3D定位</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <canvas v-show="showCanvas" ref="canvas" class="canvas" width="400px" height="400px" :style="{ top: coordinate.y + 'px', left: coordinate.x + 'px' }"></canvas>
    </main>
</template>

<script>
    import messageMixin from '@/mixin/message'
    import {deviceData} from '@/config'

    export default {
        mixins: [ messageMixin ],
        data() {
            return {
                timer:"",
                tableArr:[],
                showCanvas: false,
                coordinate: {
                    x: 0,
                    y: 0
                },
            }
        },
        mounted() {
            if(window.deviceStatus){
                this.formMet(window.deviceStatus)
            }
            this.timer=setInterval(() => {
                if(window.deviceStatus){
                    this.formMet(window.deviceStatus)
                }
            }, 30000)
        },
        methods: {
            formMet(data){
                this.tableArr=[];
                for(let key in data){
                    if(data[key] instanceof Array && data[key].length>0){
                        data[key].map((item,index)=>{
                            item["name"]=key;
                            console.log(item)
                        })
                        this.tableArr=this.tableArr.concat(data[key])
                    }
                }
                console.log(this.tableArr)
            },
            rowClass (row, index) {
               console.log(row)
                // return { "background-color": "#FFCCCC" }
            },

            // 3D定位
            positionMet(code){
                console.log(code)
            },
        },
        destroyed(){
            clearInterval(this.timer);　　// 清除定时器
            this.timer = null;
        },
        filters: {
            nameText(val){
                let text;
                deviceData.map(item=>{
                    if(item.typeId==val){
                        text=item.typeName
                        return
                    }
                })
                return text
            },
        }
    }
</script>

<style scoped lang="scss">
    .canvas{
        position: fixed;
        z-index: 1;
    }
    /deep/.el-table__empty-text{
        color: #ffffff;
    }

    .aside{
        width: 400px;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        background:rgba(0,0,0,.3);
        color: #FFFFFF;
        padding:80px 45px 0 45px;
    }
    .car-statistical{
        display: flex;
        padding:15px 0;
        flex-wrap: wrap;

    }

    .car-statistical>ul{
        width: 100%;
        display: flex;
        padding: 20px;
        justify-content: space-between;
        li{
            div{
                position: relative;
                span{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                }
            }
            p{
                padding-top: 15px;
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
        color: #218af5;
        font-size: 12px;
        padding:8px 0;
    }
    /deep/.el-table tr{
        background:transparent;
        color: #218af5;
        font-size: 12px;
        .el-button{
            padding: 7px 10px;
        }
    }
    /deep/.el-table thead{
        background-color:rgba(33,138,245,.3);
    }
</style>
