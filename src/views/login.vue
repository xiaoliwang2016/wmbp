<template>
    <main>
        <div class="content">
            <div class="log-img">
                <img src="@/assets/img/logo2.png" alt="">
                <p>欢迎登录隧道3D可视化操控系统</p>
            </div>

            <el-tabs v-model="activeName">
                <el-tab-pane label="游客登录" name="first">
                    <div class="intImg">
                        <img src="@/assets/img/account.png">
                        <el-input
                                placeholder="请输入登录账号"
                                v-model="loginData.name">
                        </el-input>
                    </div>
                    <div  class="intImg">
                        <img src="@/assets/img/pwd.png">
                        <el-input
                                placeholder="请输入验证码"
                                v-model="loginData.yzm">
                        </el-input>
                        <span v-show="show" @click="getCode">获取验证码</span>
                        <span v-show="!show" class="count">{{count}} s</span>
                    </div>
                    <div>
                        <el-button @click="init">登录</el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="管理员登录" name="second">
                    <div class="intImg">
                        <img src="@/assets/img/account.png">
                        <el-input
                                placeholder="请输入登录账号"
                                v-model="loginData.adminName">
                        </el-input>
                    </div>
                    <div  class="intImg">
                        <img src="@/assets/img/pwd.png">
                        <el-input
                                placeholder="请输入密码"
                                type="password"
                                v-model="loginData.adminPwd">
                        </el-input>
                    </div>
                    <div>
                        <el-button @click="init">登录</el-button>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </main>
</template>

<script>
    export default {
        data() {
            return {
                activeName: 'first',
                loginData:{
                    name:"",
                    yzm:"",
                    adminName:"",
                    adminPwd:"",
                },
                show: true,
                count: '',
                timer: null,
            }
        },
        mounted() {

        },
        methods: {
            // 登录
            init(){
                let parma={
                    Message_type:"M7001",
                    strRcvMessage:JSON.stringify({
                        operator_nbr:this.loginData.name,
                        Pwd:this.loginData.yzm
                    })
                }
                this.http.post(parma).then(res=>{
                    console.log(res)
                })
            },

            getCode(){
                const TIME_COUNT = 60;
                if (!this.timer) {
                    this.count = TIME_COUNT;
                    this.show = false;
                    this.timer = setInterval(() => {
                        if (this.count > 0 && this.count <= TIME_COUNT) {
                            this.count--;
                        } else {
                            this.show = true;
                            clearInterval(this.timer);
                            this.timer = null;
                        }
                    }, 1000)
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    main{
        width: 100%;
        height: 100%;
        background:url("../assets/img/login-bg.jpg");
        -webkit-background-size: 100% 100%;
        background-size: 100% 100%;
        color: #ffffff;
        display: flex;
        justify-content: center;
    }
    .content{
        width: 400px;
        text-align: center;
        padding-top: 10%;
    }
    .log-img{
        img{
            width: 230px;
        }
        p{
            padding-top: 20px;
            font-size: 18px;
        }
    }
    .el-tab-pane{
        line-height:80px;
        .el-button{
            width: 100%;
        }
    }
    .intImg{
        position: relative;
        img{
            height: 20px;
            position: absolute;
            left: 5px;
            top: 32px;
            z-index: 9;
        }
        span{
            cursor: pointer;
            position: absolute;
            right: 5px;
            top: 20px;
            height: 40px;
            line-height: 40px;
            width: 70px;
            text-align: center;
        }
    }

    /deep/.el-tabs__header{
        padding-top: 40px;
    }
    /deep/.el-tabs__item{
        color: #ffffff;
        font-size: 18px;
    }
    /deep/.el-tabs__item.is-active{
        color: #409EFF;
    }
    /deep/.el-tabs__nav-wrap{
        padding-left: 100px;
     }
    /deep/.el-tabs__nav-wrap::after{
        display: none;
    }
    /deep/.el-input__inner{
        padding-left:36px;
        background-color: #1d4064;
        border-color: #1d4064;
        color: #ffffff;
    }
</style>
<style>
    html,body,#app{
        width: 100%;
        height: 100%;
    }
</style>

