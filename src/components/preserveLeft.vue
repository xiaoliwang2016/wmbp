<template>
    <main class="aside" :style="{left: showCharts ? 0 : '-490px'}">
        <div class="car-statistical">
            <h6 class="sky-title">
                <img src="@/assets/img/title.png">
                <span>设备类型统计</span>
            </h6>
            <ul>
                <li>
                    <img src="@/assets/img/type.png" alt="">
                    <p>设备总数</p>
                    <p>{{facilityData.Total}}</p>
                </li>
                <li>
                    <img src="@/assets/img/type2.png" alt="">
                    <p>在线设备</p>
                    <p>{{facilityData.Online}}</p>
                </li>
                <li>
                    <img src="@/assets/img/type3.png" alt="">
                    <p>离线设备</p>
                    <p>{{facilityData.Offline}}</p>
                </li>
            </ul>

            <div class="my-echarts">
                <div id="echartsPie" style="height: 200px;width: 150px"></div>
                <div id="echartsBar" style="height: 200px;width: 250px"></div>
            </div>
        </div>

        <div class="list-text">
            <ul class="list-left">
                <li v-for="item in dataNew">
                    <div>{{item.DeviceName}}</div>
                    <span>{{item.num}}</span>
                </li>

            </ul>

<!--            <ul class="list-right">-->
<!--                <li>-->
<!--                    <div>车道指示牌</div>-->
<!--                    <span>100</span>-->
<!--                </li>-->
<!--                <li>-->
<!--                    <div>车道指示牌</div>-->
<!--                    <span>100</span>-->
<!--                </li>-->
<!--                <li>-->
<!--                    <div>车道指示牌</div>-->
<!--                    <span>100</span>-->
<!--                </li>-->
<!--                <li>-->
<!--                    <div>车道指示牌</div>-->
<!--                    <span>100</span>-->
<!--                </li>-->
<!--            </ul>-->
        </div>

        <img src="@/assets/img/bang.png" class="sky-img" @click="SetCharts(!showCharts)">

    </main>
</template>

<script>
    import echarts from 'echarts'

    import { mapState, mapMutations } from "vuex"

    export default {
        props:["dataVal"],
        data() {
            return {
                facilityData:"",
                dataNew:""
            }
        },
        mounted() {
            this.init()
            this.allEq()
            this.dataNew=JSON.parse(JSON.stringify(this.dataVal))
            for(let i = 0; i < this.dataNew.length; i++) {
                this.$set(this.dataNew[i], "num", 1)
                for(let j = i + 1; j < this.dataNew.length ; j++) {
                    if(this.dataNew[i].DeviceTypeID === this.dataNew[j].DeviceTypeID) {
                        this.dataNew[i].num++
                        this.dataNew.splice(j, 1)
                        j--;
                    }
                }
            }
        },

        computed: {
            ...mapState({
                showCharts: state => state.showCharts
            })
        },

        methods: {
            ...mapMutations({
                SetCharts: "SetCharts"
            }),

            init(){
                let parma={
                    Message_type:"Y5003",
                    strRcvMessage:JSON.stringify({
                        operator_nbr:"123",
                        op_time:"20171110122101",
                        device_nid:"T3004",
                        device_trace_nbr:"12311111111",
                    })
                }
                this.http.post(parma).then(res=>{
                        this.facilityData=res
                        this.facilityData.Total=this.facilityData.Total?this.facilityData.Total:0
                        this.facilityData.Online=this.facilityData.Online ?this.facilityData.Online:0
                        this.facilityData.Offline=this.facilityData.Offline?this.facilityData.Offline:0
                        this.initPie()
                        this.initBar()
                })
            },

            initPie(){
                // 基于准备好的dom，初始化echarts实例
                let myChart = echarts.init(document.getElementById('echartsPie'))
                // 绘制图表
                myChart.setOption({
                    title: {
                        text: '设备在线状态',
                        left: 'center',
                        textStyle:{//标题内容的样式
                            color:'#fff',
                            fontWeight:"normal",//可选normal(正常)，bold(加粗)，bolder(加粗)，lighter(变细)，100|200|300|400|500...
                            fontFamily:"san-serif",//主题文字字体，默认微软雅黑
                            fontSize:14//主题文字字体大小，默认为18px
                        },
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b} : {c} ({d}%)',
                        position: 'right'
                    },

                    color : [ '#189f68', '#218af5'],
                    series: [
                        {
                            name: '设备状态',
                            type: 'pie',
                            radius: '80%',
                            center: ['50%', '60%'],
                            label: {
                                show: true,
                                position: 'inside'
                            },
                            data: [
                                {value: this.facilityData.Online, name: '在线'},
                                {value: this.facilityData.Offline, name: '离线'},
                            ],

                        }
                    ]
                });
            },
            initBar(){
                // 基于准备好的dom，初始化echarts实例
                let myChart = echarts.init(document.getElementById('echartsBar'))
                // 绘制图表
                myChart.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    legend: {
                        data: ['在线', '离线'],
                        textStyle: { //图例文字的样式
                            color: '#fff',
                            fontSize: 14
                        },
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '5%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'value',
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
                            splitLine:{show: false}
                        }
                    ],
                    yAxis: [
                        {
                            type: 'category',
                            data: ['在线', '离线'],
                            axisTick: {
                                alignWithLabel: true
                            },
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
                                show: false,

                            }
                        }
                    ],
                    series: [
                        {
                            name: '在线',
                            type: 'bar',
                            barWidth: '40%',
                            stack: '总量',
                            data: [this.facilityData.Online, '-'],
                            itemStyle:{
                                normal:{
                                    color:'#189f68'
                                }
                            },
                        },
                        {
                            name: '离线',
                            type: 'bar',
                            barWidth: '40%',
                            stack: '总量',
                            data: ['-', this.facilityData.Offline],
                            itemStyle:{
                                normal:{
                                    color:'#218af5'
                                }
                            },
                        }
                    ]
                });
            },

            // 所有设备
            allEq(){
                let parma={
                    Message_type:"Y1004",
                    strRcvMessage:JSON.stringify({
                        operator_nbr:"123",
                        op_time:"20171110122101",
                        device_nid:"T3004",
                        device_trace_nbr:"12311111111",
                    })
                }
                this.http.post(parma).then(res=>{
                    if(res.code===0){
                        console.log(JSON.parse(res.data))
                    }
                })
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
        width: 400px;
        height: 100%;
        position: fixed;
        left: 0;
        top: 0;
        background:rgba(0,0,0,.3);
        color: #FFFFFF;
        padding:80px 45px 0 45px;
        transition: left 1s;
    }
    .car-statistical{
        display: flex;
        padding:15px 0;
        flex-wrap: wrap;
        ul{
            display: flex;
            width: 100%;
            justify-content: space-between;
            li{
                text-align: center;
                p:nth-child(2){
                    padding:20px 0 10px 0;
                }
            }
        }
    }

    .my-echarts{
        display: flex;
        width: 100%;
        border-bottom: 1px dashed #565656;
        padding-bottom: 20px;
        padding-top: 30px;
    }

    .list-text{
        display: flex;
        justify-content: space-between;
        ul{
            width: 100%;
            display:flex;
            justify-content: space-between;
            flex-wrap: wrap;
            li{
                display: flex;
                color: #218af5;
                line-height: 30px;
                width: 48%;
                div{
                    flex: 1;
                }
                span{
                    width: 60px;
                    padding-left: 10px;
                    text-align: right;
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
</style>
