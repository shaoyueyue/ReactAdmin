import React,{Component} from 'react'
import {BrowserRouter,Route,Switch} from 'react-router-dom'

import Login from './pages/login/login'
import Admin from './pages/admin/admin'
/*
应用的根组件
【遇到：Cannot find module '@babel/问题，建议重启项目】
 */
export default class App extends Component {
  /*
  * 那我们现在要return的是一个什么呢，大家要注意现在我要有嵌套的结构一旦要写嵌套的标签最好用一个小括号给它括起来，这样里面
  * 才好些嵌套的标签吧。
  * 那我最外层是一个什么样的结构是不是就路由器啊，而路由器里面是不是去配置路由啊，而每一个路由就是一个标签。而路由里面要配置
  * 什么东西（回答这个问题要明白，'一个路由是一个什么东西'，一个前台路由是一个什么，路由是一个映射关系：一个key对应一个value，
  * key是什么东西pathvalue是什么组件），那就要两个属性path和component
  * */
  render () {

    return (
      <BrowserRouter>
        <Switch>{/*只匹配其中一个*/}
          <Route path='/login' component={Login}></Route>
          <Route path='/' component={Admin}></Route>{/*不是home，home是他显示了它子路由界面了。实际上那它的子路由是home的话
          那它是什么，也就是说它这个整个界面是admin这个当前已经访问到了这个admin的子路由的一个路径，子路由路径它子路由路径对应
          的是/home，你说它本身是什么（不是基础路径localhost:3000）,就是斜杠代表项目根路径*/}
        </Switch>
        {/*课后总结：整体思路，
        1这里面基本的顺序就是我们先把我们的两个路由组件先定义出来了；
        2接着在我的App里面是不是注册路由，但是由于我们是第一层的路由所以我们先要去在外层先写一个路由器
        （那我最外层是一个什么样的结构是不是就路由器啊，而路由器里面是不是去配置路由啊）
        */}
      </BrowserRouter>
    )
  }
}