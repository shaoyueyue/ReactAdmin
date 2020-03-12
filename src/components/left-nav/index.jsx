import React,{Component} from 'react'
import {Link,withRouter} from 'react-router-dom'
import { Menu, Icon } from 'antd'

import './index.less'
import menuList from '../../config/menuConfig'//有了menuList这个数组以后，下面我们要做的事情是不是要根据这个menuList数组
                                                  //生成一个结构，生成那个结构呢？这一个结构要懂吗整体这个菜单不动，而是要动态
                                                  //的去产生Item或者是SubMenu里面的Item
import memoryUtils from '../../utils/memoryUtils'
import logo from '../../assets/images/logo.png'

const { SubMenu } = Menu//区别菜单和菜单项，然后就可以区分一下三个概念：菜单、子菜单、菜单项

/*
左侧导航的组件:【设计一个导航菜单配置的模块，现在实际上是将这个菜单里面的这个展现的数据部分从这个结构里面去给他剥离出去，
                  接着出去了之后再根据数据来动态生成这个结构。（因为后面有一个很重要的操作叫权限管理那个要不这么做的话
                  根本没法做）在这里面大家要注意，也就是说我每一个这个菜单项item是不是就对应我这个数组里面的一个对象包含
                  的title、key以及icon。
                  总结：也就是说我们最终要把这个结构里面的数据部分是不是抽取出来，抽出来抽出来整个是一个数组（因为他是一个
                  列表嘛），是不是，那数组里面每一个元素是什么类型，是对象就代表某一项是不是，那某一项有哪一些数据：首先
                  这里面是不是有一个标题文本那就说明这里面一个什么属性是不是title，还有我们这里是不是需要一个图标那就来
                  一个什么属性icon，接着我每一个这里面是不是对应唯一的key以及它对应的路由路径（我们说每一个item都要有
                  一个唯一的key嘛就是用路由路径对应的），关键就是有的项是不是有子列表啊所以需要有一个什么啊children而
                  children值是不是又是一个数组结构，而这个数组结构里面是不是又有很多的对象而那个对象结构是不是跟
                  它（列表抽取出的数据结构）是不是是差不多的】
 */
class LeftNav  extends Component {

  /*
  判断当前登录用户对item是否有权限
   */
  hasAuth = (item) => {
    const {key,isPublic} = item

    const menus = memoryUtils.user.role.menus
    const username = memoryUtils.user.username
    /*
    1.如果当前用户是admin
    2.如果当前item是公开的
    3.当前用户有此item的权限：key有没有在menus中
     */
    if(username==='admin' || isPublic || menus.indexOf(key)!==-1){
      return true
    }else if(item.children){  //4.如果当前用户有此item的某个子item的权限
      return !!item.children.find(child => menus.indexOf(child.key)!==-1)
    }

    return false
  }

  /*
  根据menu的数据数组生成对应的标签数组
  使用map() + 递归
  */
  getMenuNodes_map = (menuList) => {
    return menuList.map(item => { //这个item是某一个数据，你一定要知道这个item是什么，item不是指的标签，而是代表Menu.Item
                                    //或SubMenu结构的数据
      /*
       {
       title: '首页', // 菜单标题名称
       key: '/home', // 对应的path
       icon: 'home', // 图标名称
       children:[]   //可能有，也可能没有
       }

       【返回标签结构】
       <Menu.Item key="/home">
         <Link to="/home">
           <Icon type="pie-chart" />
           <span>首页</span>
         </Link>
       </Menu.Item>

       <SubMenu
         key="sub1"
         title={
           <span>
             <Icon type="mail" />
             <span>商品</span>
           </span>
         }
       >
        <Menu.Item />
        <Menu.Item />
       </SubMenu>
      */
      if(!item.children) {
        return (
          <Menu.Item key={item.key}>
            <Link to={item.key}>
              <Icon type={item.icon} />
              <span>{item.title}</span>
            </Link>
          </Menu.Item>
        )
      }else{
        return (
          <SubMenu
            key={item.key}
            title={
           <span>
             <Icon type={item.icon} />
             <span>{item.title}</span>
           </span>
         }
            >
            {this.getMenuNodes(item.children)}
            {/*我估计有的同学递归的这一下不太懂，其实很简单就是我的这个方法是不是根据你指定的数组去遍历你数组的外层元素，
            那记住我开始的时候是遍历你外层的这个对象来生成结构对吧，但是里层的这个（数组）你是不是又可以回来再调用我这个
            方法给我去处理【帮助理解：递归的设计一定要能自己结束】*/}
          </SubMenu>
        )
      }
    })
  }

  /*
   根据menu的数据数组生成对应的标签数组
   【reduce是用来做累计累加的，我们现在有累计累加嘛：有，就看你怎么看了这么看待问题了，我们现在是不是要根据一个数据的数组
   去生成一个标签的数组，那我可以先创建一个空数组啊，不断的往里面去塞我要显示的标签啊，那不是要做累计累加】
   使用reduce() + 递归
   */
  getMenuNodes = (menuList) => {
    //得到当前请求的路由路径
    const path = this.props.location.pathname

    /*我们生成左侧菜单列表，靠的就是这个getMenuNodes递归的方法。我们在这个地方通过递归的方式和通过reduce不断的往这个数组里面
    * 塞Menu.Item或者塞SubMenu。那这个一定要塞吗？得看我有没有对这个item的权限吧，说白了这个是我的item数据（reduce回调传入
    * 的参数）吧，item数据正常情况下是不是就会形成Menu.Item，我有没有对它的权限呢不好说把，是有可能有有可能没有，如果我没有的话
    * 我需要添加吗。那也就是说一个什么意思呢（向数组中添加前判断一下）*/
    return menuList.reduce((pre,item) => {

      //如果当前用户有item对应的权限，才需要显示对应的菜单项
      if(this.hasAuth(item)){//怎么判断我当前这个用户对这个item有权限
        //向pre添加<Menu.Item>
        if(!item.children) {
          pre.push((
            <Menu.Item key={item.key}>
              <Link to={item.key}>
                <Icon type={item.icon} />
                <span>{item.title}</span>
              </Link>
            </Menu.Item>
          ))
        }else{

          //查找一个与当前请求路径的子Item
          const cItem = item.children.find(cItem => path.indexOf(cItem.key)===0)
          if(cItem) {
            //如果存在,说明当前item的子列表需要展开
            this.openKey = item.key
          }

          //向pre添加<SubMenu>
          pre.push((
            <SubMenu
              key={item.key}
              title={
             <span>
               <Icon type={item.icon} />
               <span>{item.title}</span>
             </span>
           }
              >
              {this.getMenuNodes(item.children)}
            </SubMenu>
          ))
        }
      }
      return pre
    },[])
  }

  /*
  在第一次render()之前执行一次
  为第一次render()准备数据（必须同步的）
   */
  componentWillMount () {/*componentWillMount在第一次执行render执行，这样根据数组来生成标签数组只做了一次*/
    this.menuNodes = this.getMenuNodes(menuList)/*根据数据生成标签结构，根据数据数组生成标签类数组*/
  }

  render () {
    //debugger
    //得到当前请求的路由路径
    let path = this.props.location.pathname
    console.log('render()',path)
    if(path.indexOf('/product')===0){//当前请求的是商品或者其子路由界面
      path = '/product'
    }

    //得到需要打开菜单项的key
    const openKey = this.openKey

    return (
      <div className="left-nav">
        <Link to="/"  className="left-nav-header">
          <img src={logo} alt="logo"/>
          <h1>硅谷后台</h1>
        </Link>
        {/*selectedKeys={[path]}
        应该一上来给我选中当前路径所对应的的菜单项
              我最先写'/'路径根路径的时候，它是不是会请求到外面的这个admin，匹配admin吧只是说通过这个<Redirect/>是不是跳转到了
              '/home',这个地方就要说这个<LeftNav/>它是由更新的.------第一次是不是一个根路径的请求，根路径请求的时候我的这一个
              <LeftNav/>是不是就已经创建了，那也就是说我的这一个Menu已经指定了它的默认选择key已经是一个斜杠了，后面你是不是更新
              为了/home 没用，默认的只能指定一遍，你再制定一遍是没有用的
        */}
        {/*defaultOpenKeys={['/charts']}
         动态确定应该打开哪一个，是一个怎么回事呢大家来看一下啊，嗯这个地方，这里面首先来说我们的路径是不是匹配到了某一个Item，
         匹配到了某一项是不是，能匹配到吧，我是要去找：我匹配的某一项它首先得是某一个child对不对（实际是什么意思呢，应该找我
         某一项的的某一个孩子根当前路径是不是匹配的，那一项它的key是不是就是OpenKey）
         总结步骤：我要去判断有孩子的某一个Item它的某一个孩子根我的这一个路径是不是匹配的，这一项它的key就是OpenKey
         */}
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[path]}
          defaultOpenKeys={[openKey]}

          >
          {/*【react在渲染标签的时候，如果遇到js的数组结构{[1,2,3,]}，react会数组中的所有的元素一个一个拿出来显示，但
          我们需要的是一个一个的字符串嘛，我们要的是什么是li标签，最好是标签数组就好了，就是我这个数组里面li标签数组就完美了。
          也就是说这里面你看出了它会自动的遍历数组显示，这是react自己做的，我给它一个数组你看吗我给它一个数组它其实是不是自己
          在遍历，但是我这个数组不对我这个数据类数组，我要转换为什么呢标签类数组】
          我们应该动态的去根据我的这个数组去生成一个什么结构什么类型的数据：标签类数组
          */}

          {
            this.menuNodes
          }
        </Menu>
      </div>
    )
  }
}

/*
 withRouter高阶组件：
  包装非路由组件，返回一个新的组件
  新的组件向非路由组件传递3个属性：history/location/match
 */
export default withRouter(LeftNav)


