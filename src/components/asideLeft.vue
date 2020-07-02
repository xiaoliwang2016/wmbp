<template>
    <main class="aside" :style="{left: toggleAside ? 0 : '-490px'}">
        <div class="car-statistical">
            <h6 class="sky-title">
                <img src="@/assets/img/title.png">
                <span>车流量检测统计</span>
            </h6>
            <ul>
                <li>
                    <img src="@/assets/img/car1.png" alt="">
                    <div>
                        <p>当前车辆累计通信量</p>
                        <span>5000</span>
                    </div>
                </li>
                <li>
                    <img src="@/assets/img/car2.png" alt="">
                    <div>
                        <p>小型车辆数量</p>
                        <span>{{statistical.params.events[0].data.timeRange.laneParam[0].lightVehicleNum}}</span>
                    </div>
                </li>
                <li>
                    <img src="@/assets/img/car3.png" alt="">
                    <div>
                        <p>中型车辆数量</p>
                        <span>{{statistical.params.events[0].data.timeRange.laneParam[0].midVehicleNum}}</span>
                    </div>
                </li>
                <li>
                    <img src="@/assets/img/car4.png" alt="">
                    <div>
                        <p>重型车辆数量</p>
                        <span>{{statistical.params.events[0].data.timeRange.laneParam[0].heavyVehicleNum}}</span>
                    </div>
                </li>
                <li>
                    <img src="@/assets/img/car5.png" alt="">
                    <div>
                        <p>大型车辆数量</p>
                        <span>{{statistical.params.events[0].data.timeRange.laneParam[0].oversizeVehicleNum}}</span>
                    </div>
                </li>
            </ul>
            <div>
                <div style="margin-bottom:10px">
                    <div>
                        <img src="@/assets/img/highway1.png" alt="">
                        <span>{{statistical.params.events[0].data.realTimeInfo.laneState}}</span>
                    </div>
                    <p>车道1状态</p>
                </div>
                <div>
                    <div>
                        <img src="@/assets/img/highway2.png" alt="">
                        <span>拥堵</span>
                    </div>
                    <p>车道2状态</p>
                </div>
            </div>
        </div>

        <div class="echarts">
            <h6 class="sky-title">
                <img src="@/assets/img/title.png">
                <span>交通事件类型</span>
            </h6>

            <div id="myChart">

            </div>
        </div>
        <div class="list-table">
            <h6 class="sky-title">
                <img src="@/assets/img/title.png">
                <span>设备统计管理</span>
            </h6>
            <ul>
                <li>
                    <div>
                        <img src="@/assets/img/main.png" alt="">
                        <span class="font-r font-12">{{mainteData.BreakDownStat}}</span>
                    </div>
                    <p class="font-12">故障报修</p>
                </li>
                <li>
                    <div>
                        <img src="@/assets/img/main2.png" alt="">
                        <span class="font-b font-12">{{mainteData.RepairStat}}</span>
                    </div>
                    <p class="font-12">维修次数</p>
                </li>
                <li>
                    <div>
                        <img src="@/assets/img/main3.png" alt="">
                        <span class="font-b font-12" >{{mainteData.OverPeridStat}}</span>
                    </div>
                    <p class="font-12">过保设备</p>
                </li>
                <li>
                    <div>
                        <img src="@/assets/img/main4.png" alt="">
                        <span class="font-y font-12">{{mainteData.FailRateStat}}</span>
                    </div>
                    <p class="font-12">故障率</p>
                </li>

            </ul>

            <div class="list-content">
                <ul style="height: 150px;overflow: auto">
                    <li>
                        <p>
                            <span>排序</span>
                            <span>设备类型</span>
                            <span>设备数量</span>
                            <span>详情</span>
                        </p>
                    </li>
                    <li v-for="(item,index) in listNew">
                        <p>
                            <span>{{index+1}}</span>
                            <span>{{item.EUQType}}</span>
                            <span>{{item.num}}</span>
                            <span @click="jump"> > </span>
                        </p>
                        <!--详情-->

                        <div>
                            1111111111
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <img src="@/assets/img/bang.png" class="sky-img" @click="toggleAside=!toggleAside">
    </main>
</template>

<script>
import echarts from 'echarts'
import Stomp from 'stompjs'
export default {
    props:["list"],
    data() {
        return {
            toggleAside:true,

            // 交通统计
            statistical:{
                "method": "OnEventNotify",
                "params": {
                    "sendTime": "2017-04-22T15:39:01.000+08:00",
                    "ability": "event_traffic_statistic",
                    "events": [
                        {
                            "eventId": "aa43f878-2df4-4626-bd2a-e0605a7db196",
                            "srcIndex": "df9daae23a0e441c97b5ad5e17bde846",
                            "srcType": "camera",
                            "srcName": "camera_01",
                            "eventType": 6274883585,
                            "status": 0,
                            "timeout": 0,
                            "happenTime": "2017-04-22T15:39:01.000+08:00",
                            "data": {
                                "statisticalMethods": "realTime",
                                "imageUrl": "https://ip:port/ngx/proxy?i=aHR0cDovLzEwLjQxLjQuNzk6ODA4OC9pbWFnZS92cmIyL2kyLzI5NzgyMmM5ZWFlMDRiNDQ5NjNhOTg4NWY3MGMxYTI0LzAwMDE1P2tleT0zMTZiJm9mZnNldD04MTE1Mzg4NjYmaGlnaD0xNjI0ODQ=",
                                "realTimeInfo": {
                                    "time": "2018-03-27T21:30:00.000+08:00",
                                    "laneNo": "2",
                                    "vehicleSpeed": "1",
                                    "laneState": "1",
                                    "queueLen": "50"
                                },
                                "timeRange": {
                                    "startTime": "2018-03-27T21:15:00.000+08:00",
                                    "endTime": "2018-03-27T21:30:00.000+08:00",
                                    "laneNum": "8",
                                    "laneParam": [
                                        {
                                            "laneNo": "1",
                                            "vehicleSpeed": "10",
                                            "lightVehicleNum": "2",
                                            "midVehicleNum": "1",
                                            "heavyVehicleNum": "1",
                                            "oversizeVehicleNum": null,
                                            "timeHeadway": "1",
                                            "spaceHeadway": "1",
                                            "spaceOccupyRation": "0.56",
                                            "timeOccupyRation": "0.65"
                                        }
                                    ]
                                },
                                "crossingIndexCode": "2897772b9764492d9a8371b7cd6b8404",
                                "crossingName": "交通卡口"
                            }
                        }
                    ]
                }
            },

            // 交通事件
            raffic:{
                "method": "OnEventNotify",
                "params": {
                    "sendTime": "2019-04-06T17:52:39.493+08:00",
                    "ability": "event_traffic",
                    "events": [
                        {
                            "eventId": "c460e965-6ebe-4962-97e0-43462838ede2",
                            "srcIndex": "f7390ce43f2c4398a18920b31af8851f",
                            "srcType": "camera",
                            "srcName": "Simulator Channel",
                            "eventType": 6274879489,
                            "status": 0,
                            "timeout": 0,
                            "happenTime": "2019-04-06T17:49:58.000+08:00",
                            "data": {
                                "illegalTrafficEvent": "wrongDirection,congestion",
                                "laneNo": "1",
                                "crossingIndexCode": "91687f2ea2ee47ef9bd374a84afeb854",
                                "crossingName": "cm交通事件卡口",
                                "targetPicUrl": "/ngx/proxy?i=aHR0cHM6Ly8xMC4yLjE0NS4xMDgvcG9ydWNvbi8wMTAzLnBuZw==",
                                "previewCameraIndexcode": "f7390ce43f2c4398a18920b31af8851f",
                                "vehicleEntryExitingStatus": "0",
                                "vehicleSpeed": "0",
                                "directionIndex": "0",
                                "speedLimit": "1"
                            }
                        }
                    ]
                }
            },

            // 设备维保统计
            mainteData:"",
            listNew:JSON.parse(JSON.stringify(this.list)),
        }
    },
    computed: {},
    mounted() {
        this.drawLine()
        // this.init()
        this.mainteMet()

        for(let i = 0; i < this.listNew.length; i++) {
            this.$set(this.listNew[i], "num", 1)
            for(let j = i + 1; j < this.listNew.length;j++) {
                if(this.listNew[i].DeviceTypeID === this.listNew[j].DeviceTypeID) {
                    this.listNew[i].num++
                    this.listNew.splice(j, 1)
                    j--;
                }
            }
        }
    },
    methods: {
        init(){
            let parma={
                Message_type:"M7001",
                strRcvMessage:JSON.stringify({
                    operator_nbr:"123",
                    Pwd:"123123"
                })
            }
            this.http.post(parma).then(res=>{
                console.log(res)
            })
        },
        // MQ
        realTime() {
            let _this = this
            let ws = new WebSocket(`wss:haproxy.laozicloud.com/ws`)
            // 获得Stomp client对象
            let client = Stomp.over(ws)
            client.debug = null
            // 定义连接成功回调函数
            let onConnect = () => {
                let scr = '/queue/queue_'
                // 处理完成
                client.subscribe(scr, function(frame) {

                })
            }
            let onError = () => {
                console.log('error')
            }
            // 定义客户端信息
            let clientInfo = {
                userName: 'admin',
                password: '123.com'
            }
            // 连接rabbitmq
            client.connect(
                clientInfo.userName,
                clientInfo.password,
                onConnect,
                onError,
                '/'
            )
        },

        drawLine(){
            // 基于准备好的dom，初始化echarts实例
            let myChart = echarts.init(document.getElementById('myChart'))
            // 绘制图表
            myChart.setOption({
                tooltip: {
                    trigger: 'axis',
                },
                grid: {
                    left: '0',
                    right: '5%',
                    bottom: '0',
                    top:'5%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data:this.raffic.params.events[0].data.illegalTrafficEvent.split(","),
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#24afff', // 颜色
                        },
                        symbol:["none","arrow"]
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLabel : {
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#24afff', // 颜色
                        },
                        symbol:["none","arrow"]
                    },
                    splitLine: {
                        show: true,
                        lineStyle:{
                            color: ['#24afff'],
                            width: 1,
                            type: 'solid'
                        }
                    }
                },
                series: [{
                    data: [820, 932],
                    type: 'line',
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            color:"#24afff",
                        }
                    },
                    itemStyle: {
                        normal: {
                            color:"#24afff",
                        }
                    },
                    areaStyle: {}
                }]
            });
        },

        // 设备维保统计
        mainteMet(){
            let parma={
                Message_type:"Y5002",
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
                this.mainteData=res
            })
        },

        // 跳转
        jump(){
            this.$emit("fatherMethod","2")
        },
    }
}
</script>

<style scoped lang="scss">
    .sky-img{
        position: absolute;
        top: calc(50% - 65px);
        right: -76px;
        transform: rotate(270deg);
        cursor: pointer;
    }

    .aside{
        width: 430px;
        height: 100%;
        position: fixed;
        left: 0;
        top: 0;
        background:rgba(0,0,0,.3);
        color: #FFFFFF;
        padding-top:80px;
        transition: left 1s;
    }
    .car-statistical{
        display: flex;
        padding:15px 25px;
        flex-wrap: wrap;
        ul{
            li{
                display: flex;
                padding-bottom: 10px;
                div{
                    p{
                        font-size: 12px;
                        color: #808080;
                    }
                }
                img{
                    margin-right: 5px;
                }
            }
        }
    }
    .car-statistical>div{
        flex: 1;
        text-align: center;
        p{
            padding-top: 10px;
            font-size: 12px;
        }
        div{
            position: relative;
            span{
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%,-50%);
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
    .echarts{
        border-bottom: 1px dashed #565656;
        border-top: 1px dashed #565656;
        padding:0 25px 10px 25px;
        #myChart{
            width: 100%;
            height: 200px;
        }
    }
    .list-table>.sky-title{
        padding:10px 25px;
    }
    .list-table>.list-content>ul{
        padding: 0 25px;
    }
    .list-table>ul{
        padding:0 45px;
        display: flex;
        justify-content: space-between;
        li{
            div{
                position: relative;
                span{
                    position: absolute;
                    top:50%;
                    left:50%;
                    transform: translate(-50%,-50%);
                }
            };
            p{
                padding-top: 5px;
                text-align: center;
            }
        }
    }


    .list-content{
        padding-top: 15px;
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
