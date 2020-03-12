/*
【封装一个函数类型的模块，这个函数用来发送ajax请求。需要三个参数决定请求。我这个方法包装的就axios的get方法或者post方法。】
能发送异步ajax请求的函数模块
封装axios库
函数的返回值是promise对象
1.优化：统一处理请求异常？【那我怎么知道这个axios请求异常了呢，那是不是通过通过的.then或者.catch来接收这个异常啊（它不是返回
一个promise，我只有指定一个失败的回调函数是不是才有可能得到异常）
好解决思路就是，你得外面自己return new 一个 Promise，说白了得外面套一层promise里面的promise就能.then了（也就是
 指定一个失败的回调函数）】
        在外层包一个自己创建的promise对象
        在请求出错时，不去reject（error），而是显示错误提示
 2.优化2：异步得到不是response，而是response.data
  在请求成功resolve时：resolve(response.data)
 */
import axios from 'axios'
import {message} from 'antd'

export default function ajax (url,data={},type='GET') {

  return new Promise((resolve,reject) => {
    let promise
    //1.执行异步ajax请求
    if(type==='GET'){//发送GET请求
      promise =  axios.get(url,{//配置对象
        params:data   //指定请求参数
      })
    }else{//发送POST请求
      promise =  axios.post(url,data)
    }
    //2.如果成功了，调用resolve（value）【是不是指定成功的数据】
    promise.then(response => {
      resolve(response.data)
    //3.如果失败了，调用reject（reason）【传入失败的原因，但是这里不能这么调，你要这么搞的话那不就会进入catch了嘛，你的外面
    // 是不是有try...catch，你要调用这个reject（reason）就会触发到catch的流程里面去】
    //因为要统一处理请求异常，所以不调用reject（reason），而是通过提示异常信息
    }).catch(error => {
      //reject(error)
      message.error('请求出错了：' + error.message)//【那也就是说我的这个新return的new Promise还会出错嘛，不会因为它里面的
      //错误是不是已经处理掉了 】
    })
  })
}


//请求登录接口【每一次我请求某一个接口是不是都要去手动的去指定地址、指定我的参数数据以及请求方式，但是你得知道对应某一个接口来说，
// 它的地址是不是固定的它的请求方式是不是固定的，变化的是什么是不是参数数据是由我们前台用户来指定的】
//ajax('/login',{username:'Tom',password:'12345'},'POST').then()
//添加用户
//ajax('/manage/user/add',{username:'Tom',password:'12345',phone:'1377777777'},'POST').then()


