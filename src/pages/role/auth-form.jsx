import React,{PureComponent} from 'react'
import PropsTypes from 'prop-types'
import {
  Form,
  Input,
  Tree
  } from  'antd'

import menuList from '../../config/menuConfig'

const Item = Form.Item

const { TreeNode } = Tree

/*
 添加分类的form组件
 */
export default class AuthForm  extends PureComponent {

  static propTypes = {
    role:PropsTypes.object
  }

  constructor (props) {
    super(props)

    //根据传入角色的menus生成初始状态
    const {menus} = this.props.role
    this.state = {
      checkedKeys:menus   //bug：我们现在是根据状态里面的值来确定是否选中谁，而状态的值只是在constructor里面做了一下（初始化），
                            //那我的状态还有什么时候会更新是不是唯一的机会就是我去选择，你再次显示的时候它会根据新的role来去确定
                            //我的状态值嘛？不会，我只有在我（组件第一次生成渲染）初始的时候才根据我的role来确定状态值，这个地方
                            //就要说我们的这个组件这个组件关掉，我的组件死亡了没有应该是没有死，只是将它的界面隐藏起来了，等到
                            //我显示的时候它还会进去初始化的生命周期嘛？不会经历初始化生命周期，它自然就用以前的（有人说老师那个
                            // name为什么会变呢，组件它接收先的属性会重新渲染没有问题，他会重新render，但是它不会经历初始化生命周期，
                            // 所以这个时候考察的是对组件生命周期的理解）。

    }
  }

  /*
  * 为父组件提交获取最新menus数据的方法
  * */
  getMenus = () => this.state.checkedKeys

  getTreeNodes = (menuList) => {
    return menuList.reduce((pre,item) => {
      pre.push(
        <TreeNode title={item.title} key={item.key}>
          {item.children ? this.getTreeNodes(item.children) : null}
        </TreeNode>)
      return pre
    },[])
  }

  //选中某个node时的回调
  onCheck = checkedKeys => {
    console.log('onCheck', checkedKeys);
    this.setState({checkedKeys })
  }

  componentWillMount () {
    this.treeNodes = this.getTreeNodes(menuList)
  }

  //根据新传入的role来更新checkedKeys状态（生命周期：根据新传入的属性，在生命周期回调函数中选择正确的时机更新状态）
  /*
  当组件接收到新的属性时自动调用
  */
  componentWillReceiveProps (nextProps) {
    console.log('componentWillReceiveProps()',nextProps)
    const menus = nextProps.role.menus
    this.setState({
      checkedKeys:menus
    })
    //this.state.checkedKeys = menus
  }

  render () {
    console.log('AuthForm render()')    //自己写一下，这个组件外部的标签一开始是隐藏的，它第一次没有和父组件一个渲染也算正常
    const {role} = this.props
    const {checkedKeys} = this.state
    //指定Item布局的配置对象
    const formItemLayout = {
      labelCol: { span: 4 }, //左侧label的宽度
      wrapperCol: { span: 15 }, //指定右侧包裹的宽度
    }

    return (
      <div>
        <Item label='角色名称' {...formItemLayout}>
          <Input value={role.name} disabled/>
        </Item>

        <Tree
          checkable
          defaultExpandAll={true}
          checkedKeys={checkedKeys}
          /*（我前面的Table组件的勾选）我这一个是否勾选，是不是根据我的状态来的。我要想让某一个勾选，我不是想去更新它（它指的是checkedKeys）
          * ，而我是先改状态，而它（checkedKeys）是读状态显示*/
          onCheck={this.onCheck}
        >
          <TreeNode title="平台权限" key="all">{/*和table组件的行选中，类比理解这里的key的作用：key到时候会用于匹配要不要勾选*/}
            {this.treeNodes}
          </TreeNode>
        </Tree>
      </div>
    )
  }
}


