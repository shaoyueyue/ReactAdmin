import React,{Component} from 'react'
import {withRouter} from 'react-router-dom'
import { Modal } from 'antd'

import LinkButton from '../link-button'
import {formateDate} from '../../utils/dateUtils'
import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'
import {reqWeather} from '../../api'
import menuList from '../../config/menuConfig'
import './index.less'

/*
头部的组件【1.静态组件的编写 2.动态效果：大家知道我们这个头部组件的界面是不是一个变化的，这样产生变化的动态界面，那这个地方你就要
            分析出来那些数据它是变化的，（admin应该是从内存user里取出来的。那这一个时间它是不是动态在变啊，是动态就应该设计成我的
            状态是不是。这个能是不是从后台获取的两个数据，这也是我们的状态吧，等到获取来了是不是可以更新状态。）
            3.这个呢“首页”，这个应该要根据咱当前的请求路径，去哪个我们有的menuConfig的数组从这里里面找到对应的title，这么我没有
            把它储存为状态到时候有一个查找的过程，到时候给大家看一下】
 */
class Header  extends Component {

  state ={
    currentTime:formateDate(Date.now()), //当前时间字符串
    dayPictureUrl:'', //天气图片url
    weather:'' //天气的文本
  }

  getTime = () => {
    //每隔1s获取当前时间，并更新状态数据currentTime
    this.intervalId = setInterval(() => {
      const currentTime = formateDate(Date.now())
      this.setState({currentTime})
    },1000)
  }

  getWeather = async () => {
    //调用接口请求函数异步获取数据
    const {dayPictureUrl,weather} = await reqWeather('石家庄')
    this.setState({dayPictureUrl,weather})
  }

  //这个呢“首页”，这个应该要根据咱当前的请求路径，去哪个我们有的menuConfig的数组从这里里面找到对应的title
  getTitle = () => {
    //得到当前请求路径
    const path =this.props.location.pathname
    let title
    menuList.forEach(item => {
      if(item.key===path){ //如果当前item对象的key与path一样，item的title就是需要显示的title
        title = item.title
      } else if (item.children) {
        //在所有子item中查找匹配的
        const cItem = item.children.find(cItem => path.indexOf(cItem.key)===0)
        //如果有值才说明有匹配的
        if(cItem){
          //取出他的title
          title = cItem.title
        }
      }
    })
    return title
  }

  /*
  用来退出登录的，并且肩负着取消普通a连接的点击效果
   onClick={ (e) => { e.preventDefault() } }
   */
  logout = (e) => {
    e.preventDefault()
    //显示确认框
    Modal.confirm({
      content: '确定退出吗？',
      onOk: () => {
        console.log('OK',this);
        //删除保存的user数据
        storageUtils.removeUser()
        memoryUtils.user = {}
        //跳转到login
        this.props.history.replace('/login')
      }
    })
  }

    /*
    第一次render（）之后执行一次
    一般在此执行异步操作：发ajax请求/启动定时器

    */
  componentDidMount () {
    //获取当前的时间
    this.getTime()
    //获取当前天气
    this.getWeather()
  }

  /*
  //不能这么做：这样只有第一次是对的，不会更新显示
  componentWillMount () {
    this.title = this.getTitle()
  }*/

  /*我们这里启动了一个定时器，定时器得要保证什么时候清除来着，循环定时器是不是应该在我的组件被卸载的时候，也就是说它有一个
  * 生命周期方法的，死亡之前
  *
  * 当前组件卸载之前调用
  * */
  componentWillUnmount () {
    //清除定时器
    clearInterval(this.intervalId)
  }

  render () {

    const {currentTime,dayPictureUrl,weather} = this.state

    const username = memoryUtils.user.username

    //得到当前需要显示的title
    const title = this.getTitle()

    return (
      <div className="header">
        <div className="header-top">
          <span>欢迎，{username}</span>
          {/*react认为，header组件的这个href，就是这个a标签写的不是特别好：就是我们平常为了简化就是形成一个链接但又不是
          真正的连接，看起来像连接是不是但我是把它作为连接的功能使用嘛不是，能听懂吧，这种写法它说不太好。
          我们应用中有特别多的这种情况，看起来是连接但我没把他当做真正的连接使用，这个使用应该要去写一个通用的自定义组件，
          我可以这么做呢，我可以用button来做，能不能用一个html的button来把它封装成看起来像a标签的样子，可以把，将一个样式
          是不是就可以了*/}
          <LinkButton onClick={this.logout}>退出</LinkButton>
          {/*
           href属性使用js代码段在React下warning问题:

           我们在使用a标签的时候，若不想用a标签的href跳转，而要使用自己绑定的click或其他事件时，往往会通过插入js代码段的方式设置
           href为javascript:;或javascript:void(0);等达到href无跳转的结果。但是这么设置在React中会提示
           warning：A future version of React will block javascript: URLs as a security precaution.
           Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead.
           React was passed "javascript:;"，这样的话，我们该如何处理。

           处理方法
           在href中插入代码段的方式是不可行的，转而可以使用以下方式：
           <a href="#" onClick={ (e) => { e.preventDefault() } }></a>
           这样就解决了warning问题。
          */}
        </div>
        <div className="header-bottom">
          <div className="header-bottom-left">{title}</div>
          <div className="header-bottom-right">
            <span>{currentTime}</span>
            <img src={dayPictureUrl} alt="weather"/>
            <span>{weather}</span>
          </div>
        </div>
      </div>
    )
  }
}

export default  withRouter(Header)


