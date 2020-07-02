import qs from 'qs';
import axios from 'axios';
import { Message } from 'element-ui';

let localhosts = 'http://3dwcf.laozicloud.net:18081/SmartPlatform.ashx'; //请求的后台域名
let timeout = 30000;   //请求的后台域名
axios.interceptors.request.use(config => {//请求之前(可以设置token)
  config.headers['Content-Type'] = 'application/x-www-form-urlencoded'; //设置请求头
  config.data=qs.stringify(config.data)
  return config
},error =>{
  Message.error(error)
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {//数据拿到之后
  if(response.data.code == 0){
    return JSON.parse(response.data.data)
  }
  return response.data
},error => {
  Message.error('Http请求失败，请联系管理员');
  return Promise.reject(error.response);
});

function successfun(res){//处理后台返回的非200错误
  if(res.code === 0){
    return res
  }else{
    // Message.info(res.msg);
    return res;
  }
}

function errorfun(res){
  if(res.code != 0){
    Message.error(res.msg);
    return res;
  }
}

export default {
  post(data, headers) {//post请求
    return axios({
      method: 'post',
      baseURL:localhosts,
      data: data,
      timeout: timeout,//响应时间
      headers: headers
    }).then(res => {
      return successfun(res)
    }, err => {
      return errorfun(err);
    })
  },

}
