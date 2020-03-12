import React,{Component} from 'react'
import {Switch,Route,Redirect} from 'react-router-dom'

import ProductHome from './home'
import ProductAddUpdate from './add-update'
import ProductDetail from './detail'


import  './product.less'

/*
 商品分类路由
 */
export default class Product  extends Component {
  render () {
    return (
      <Switch>
        <Route path="/product" component={ProductHome}  exact/>{/*路径完全匹配*/}
        {/*现在我们的想法是什么，你的路径只有是它：path="/product"的时候，
        才请求component={ProductHome}，是其它的就要往下面看。
        说白了这一个是要有一个精准的匹配，不能像我们前面默认的逐层匹配。但前面我能说它们是进准匹配*/}
        <Route path="/product/addupdate" component={ProductAddUpdate} />
        <Route path="/product/detail" component={ProductDetail} />
        <Redirect to="/product" />
      </Switch>
    )
  }
}