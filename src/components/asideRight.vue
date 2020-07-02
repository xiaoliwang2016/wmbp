<template>
    <main class="aside" :style="{right: toggleAside ? 0 : '-490px'}">
        <div class="car-statistical">
            <h6 class="sky-title">
                <p>
                    <img src="@/assets/img/title.png">
                    <span>视频监控查看</span>
                </p>
            </h6>
            <ul>
                <li>
                    <img src="@/assets/img/video.png" alt="" class="show-video">
                    <p>
                        <span>位置：023</span>
                        <img src="@/assets/img/full.png" alt="">
                    </p>
                </li>
                <li>
                    <img src="@/assets/img/video.png" alt="" class="show-video">
                    <p>
                        <span>位置：023</span>
                        <img src="@/assets/img/full.png" alt="">
                    </p>
                </li>
                <li>
                    <img src="@/assets/img/video.png" alt="" class="show-video">
                    <p>
                        <span>位置：023</span>
                        <img src="@/assets/img/full.png" alt="">
                    </p>
                </li>
                <li>
                    <img src="@/assets/img/video.png" alt="" class="show-video">
                    <p>
                        <span>位置：023</span>
                        <img src="@/assets/img/full.png" alt="">
                    </p>
                </li>

            </ul>
        </div>

        <div class="echarts">
            <h6 class="sky-title">
                <p>
                    <img src="@/assets/img/title.png">
                    <span>报警次数统计</span>
                </p>

                <span>当时时间：{{time}}</span>
            </h6>

            <div>
                <ul v-if="errorData.AlarmTotalList">
                    <li>
                        <div>
                            <img src="@/assets/img/time.png" alt="">
                            <span>{{errorData.AlarmTotalList[0].WeeklyStat}}</span>
                        </div>
                        <p>本周</p>
                    </li>
                    <li>
                        <div>
                            <img src="@/assets/img/time.png" alt="">
                            <span>{{errorData.AlarmTotalList[0].MonthlyStat}}</span>
                        </div>
                        <p>本月</p>
                    </li>
                    <li>
                        <div>
                            <img src="@/assets/img/time.png" alt="">
                            <span>{{errorData.AlarmTotalList[0].QuarterlyStat}}</span>
                        </div>
                        <p>本季</p>
                    </li>
                    <li>
                        <div>
                            <img src="@/assets/img/time.png" alt="">
                            <span>{{errorData.AlarmTotalList[0].AnnualStat}}</span>
                        </div>
                        <p>本年</p>
                    </li>
                </ul>
            </div>
        </div>

        <div class="list-table">
            <h6 class="sky-title">
                <p>
                    <img src="@/assets/img/title.png">
                    <span>故障及报警管理</span>
                </p>
                <el-select v-model="value" placeholder="请选择" style="width: 200px">
                    <el-option
                            v-for="item in options"
                            :key="item.typeId"
                            :label="item.typeName"
                            :value="item.typeId">
                    </el-option>
                </el-select>
            </h6>
            <div class="list-content">
                <ul style="height:180px;overflow: auto;">
                    <li>
                        <p>
                            <span>排序</span>
                            <span>设备名称</span>
                            <span>类型</span>
                            <span>时间</span>
                        </p>
                    </li>
                    <li v-for="(item,index) in tableArr" >
                        <p>
                            <span>{{index}}</span>
                            <span>{{item.name | nameText}}</span>
                            <span>报警</span>
                            <span> - </span>
                        </p>
                        <!--详情-->
                        <div>
                            1111111111
                        </div>
                    </li>
                    <li v-if="tableArr.length<1" style="text-align: center">
                        暂无数据
                    </li>
                </ul>
            </div>
        </div>

        <img src="@/assets/img/bang.png" class="sky-img" @click="toggleAside=!toggleAside">
    </main>
</template>

<script>
import {deviceData} from '@/config'
export default {
    data() {
        return {
            toggleAside:true,

            options: [
                {
                    typeId: '',
                    typeName: '全部'
                }
            ],
            value: '',
            // 当前时间
            // 报警统计
            errorData:{},
            videoData:"",
            time:"",
            tableArr:[],
        }
    },
    mounted() {
        this.errorNum();
        this.videoMet();
        this.getNowFormatDate()
        this.options=this.options.concat(deviceData)

        if(window.deviceStatus){
            this.formMet(window.deviceStatus)
        }
        this.timer=setInterval(() => {
            if(window.deviceStatus){
                this.formMet(window.deviceStatus)
            }
        }, 20000)
    },
    methods: {
        // 获取系统当前时间
        getNowFormatDate() {
            let date = new Date();
            let seperator1 = "-";
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            this.time = year + seperator1 + month + seperator1 + strDate;
        },
        // 报警次数统计
        errorNum(){
            let parma={
                Message_type:"Y5001",
                strRcvMessage:JSON.stringify({
                    operator_nbr:"123",
                    op_time:"20171110122101",
                    device_nid:"13027483234",
                    device_trace_nbr:"123123123123213",
                    DeviceTypeID:"",
                    DeviceCode:"",
                })
            }
            this.http.post(parma).then(res=>{
                this.errorData=res
            })
        },
        // 视频URL地址
        videoMet(){
            let parma={
                Message_type:"Y4004",
                strRcvMessage:JSON.stringify({
                    operator_nbr:"123",
                    op_time:"20171110122101",
                    device_nid:"13027483234",
                    device_trace_nbr:"123123123123213",
                    DeviceCode:"",
                })
            }
            this.http.post(parma).then(res=>{
                // 获取视频地址，暂时假数据
                this.videoData=res
            })
        },
        // 报警
        formMet(data){
            this.tableArr=[];
            for(let key in data){
                if(data[key] instanceof Array && data[key].length>0){
                    data[key].map((item,index)=>{
                        item["name"]=key;
                    })
                    this.tableArr=this.tableArr.concat(data[key])
                }
            }
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
    .sky-img{
        position: absolute;
        top: calc(50% - 65px);
        left: -76px;
        transform: rotate(90deg);
        cursor: pointer;
    }

    .aside{
        width: 430px;
        height: 100%;
        position: fixed;
        right: 0;
        top: 0;
        background:rgba(0,0,0,.3);
        color: #FFFFFF;
        padding-top:80px;
        transition: right 1s;
    }
    .car-statistical{
        display: flex;
        padding:15px 20px;
        flex-wrap: wrap;
        ul{
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: 100%;
            li{
                width: 48%;
                padding-bottom: 10px;
                text-align: center;
                .show-video{
                    width:100%;
                }
                p{
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                }
            }
        }
    }

    .sky-title{
        width: 100%;
        padding: 10px 0;
        display: flex;
        justify-content: space-between;
        p{
            span{
                margin-left: -15px;
            }
        }
    }
    .echarts{
        border-bottom: 1px dashed #565656;
        border-top: 1px dashed #565656;
        padding:0 20px 10px 20px;
        div{
            ul{
                display: flex;
                justify-content: space-between;
                li{
                    div{
                        position: relative;
                        span{
                            position: absolute;
                            top:50%;
                            left: 50%;
                            transform: translate(-50%,-50%);
                        }
                    }
                    p{
                        text-align: center;
                        padding: 10px 0;
                    }
                }
            }
        }
    }

    .list-table>.sky-title{
        padding: 10px 20px;
        width: auto;
    }
    .list-content{
        padding-top: 15px;
        ul{
            padding: 0 20px;
        }
        li{
            line-height: 40px;
            height: 40px;
            overflow: hidden;
            p{
                display: flex;
                justify-content: space-between;
                span:last-child{
                    cursor: pointer;
                }
            }
        }
    }

    /deep/.el-input__inner{
        height: 30px;
        line-height: 30px;
        background:transparent;
        color: #cccccc;
    }
    /deep/.el-input__icon{
        line-height: 30px;
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
</style>
