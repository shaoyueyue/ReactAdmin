import React,{Component} from 'react'
import {Redirect,Route,Switch} from 'react-router-dom'
import { Layout } from 'antd'

import memoryUtils from '../../utils/memoryUtils'
import LeftNav from '../../components/left-nav'
import Header from '../../components/header'
import Home from '../home/home'
import Category from '../category/category'
import Product from '../product/product'
import Role from '../role/role'
import User from '../user/user'
import Bar from '../charts/bar'
import Line from '../charts/line'
import Pie from '../charts/pie'

const {Footer, Sider, Content } = Layout//上面的头部一开始使用它自己的Header，我不要它的Header可以，当然你可以
                                        //要它的Header，要它的Header这里面自己定义的名字就不要和它的一样了，我觉得没有必要
                                        //（当开始我也没有不能完全确定可不可以不要，当然你测试完之后你就会发现可以不要的，
                                        // 但是<Sider>这一个得要，因为他是放在那个整个结构的左侧的）

/*
后台管理的路由组件
 */
export default class Admin  extends Component {

  render () {
    const user = memoryUtils.user
    //如果内存没有存储user ==> 当前没有登陆
    if(!user || !user._id) {
      //如何自动跳转到登录界面（在render（）中）
      return <Redirect to="/login" />
    }
    return (
      <Layout style={{minHeight:'100%'}}>
        <Sider>{/*我是不是可以把这两个（left-nav和header）给引入过来。
                  因为左侧和头部相对有一些复杂度，所以我们需要抽取成组件。
                  是不是对应的标签对象套着写好的组件形成的组件标签*/}
          <LeftNav />
        </Sider>
        <Layout>
          <Header>Header</Header>
          <Content style={{margin:20,backgroundColor:'#fff'}}>
            {/*刚刚建好并引入组件以后，下面是不是就涉及到配置了（配置路由），用哪个组件去配置，配置路由嘛用<Route>*/}
            <Switch>
              <Route path="/home" component={Home} ></Route>
              <Route path='/category' component={Category}/>
              <Route path='/product' component={Product}/>
              <Route path='/user' component={User}/>
              <Route path='/role' component={Role}/>
              <Route path="/charts/bar" component={Bar}/>
              <Route path="/charts/pie" component={Pie}/>
              <Route path="/charts/line" component={Line}/>
              <Redirect to="home" />
            </Switch>
          </Content>
          <Footer style={{textAlign:'center',color:'#aaaaaa'}}>推荐使用谷歌浏览器，可以获得更加页面操作体验</Footer>
        </Layout>
      </Layout>
    )
  }
}