import React,{Component} from 'react'
import {
  Card,
  Button,
  Table,
  Modal,
  message
} from 'antd'

import {PAGE_SIZE} from '../../utils/constants'
import {reqRoles,reqAddRole,reqUpdateRole} from '../../api'
import AddForm from './add-form'
import AuthForm from './auth-form'
import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'
import {formateDate} from '../../utils/dateUtils'

/*
 角色路由【分析：来获取一下角色列表，你就能看到某一个角色有哪些信息。角色列表这里面的每一个对象都代表个角色（因为我获取角色列表嘛）】
 老师分析结果：那这个地方我们一定要搞清楚数据结构啊，某一个角色权限是靠他（角色列表中自身对象里）有一个属性叫menus，它的值是一个数组，
 而数组里面存的是每一个左侧Menu的key值
 */
export default class Role  extends Component {

  state = {
    roles:[],   //所有角色的列表
    role:{},   //选中的role-实际上这是设计的问题
    isShowAdd:false, //是否显示添加界面
    isShowAuth:false, //是否显示设置权限界面
  }

  constructor (props) {
    super(props)

    this.auth = React.createRef()
  }

  initColumn = () => {
    this.columns = [
      {
        title:'角色名称',
        dataIndex:'name'
      },
      {
        title:'创建时间',
        dataIndex:'create_time',
        render: (create_time) => formateDate(create_time)
      },
      {
        title:'授权时间',
        dataIndex:'auth_time',
        render:formateDate
      },
      {
        title:'授权人',
        dataIndex:'auth_name'
      }
    ]
  }

  getRoles = async () => {
    const result = await reqRoles()
    if(result.status===0){
      const roles = result.data
      this.setState({
        roles
      })
    }
  }

  onRow = (role) => {//诶呀，就是将行对应的事件监听的响应设计到一个函数中，你在这个函数中设计对应事件的回调函数并能从这个函数中
                     //收到数据，好像高级函数
    return {
      onClick:event => {//点击行
        //console.log('11111111111111111',this.state.roles.indexOf(role)) //这个role只是对象一个引用变量，也关联在数组上【
        // 这里传入的role就是就是数组里面的某一个role，接着我又把这个role让状态里面存了一个通过一个引用变量指向它】
        console.log('row onClick',role)
        //alert('点击行')
        this.setState({
          role
        })
      }
    }
  }

  /*
    添加角色
  */
  addRole = () => {
    //进行表单验证，只能通过了才向下处理
    this.form.validateFields( async (err,values) => {
      if(!err){

        //隐藏确认框
        this.setState({
          isShowAdd:false
        })

        //收集数据，并提交添加分类的请求
        const {roleName} = values
        //清除输入数据（重置表单项）
        this.form.resetFields()
        const result = await reqAddRole(roleName)
        //根据结果提示/更新列表显示
        if(result.status===0){
          message.success('添加角色成功')
          //this.getRoles()
          //新产生的角色
          const role = result.data
          //更新roles状态
          /*//const roles = this.state.roles
          const roles = [...this.state.roles]  /!*刚才是错误的。你要有个思路，我要问大家在我更新之前我这样有没有直接去操作
          直接去修改原本状态里面的数据，在想想刚才有没有。---------react建议尽量不要直接去更新状态数据*!/
          roles.push(role)
          this.setState({
            roles
          })*/

          //更新roles状态：基于原本状态数据更新
          this.setState( state => ({
            roles:[...state.roles,role]
          }))

        }else{
          message.error('添加角色失败')
        }
      }
    })
  }

  /*
  更新角色 updateRole
  */
  updateRole = async () => {

    //隐藏确认框
    this.setState({
      isShowAuth:false
    })

    const role = this.state.role   //这个role只是对象一个引用变量，也关联在数组上
    //得到最新的menus
    const menus = this.auth.current.getMenus()
    role.menus = menus
    role.auth_name = memoryUtils.user.username
    role.auth_time = Date.now()

    //请求更新
    const result = await reqUpdateRole(role)
    if(result.status===0){
      //this.getRoles()
      //如果当前更新的是自己角色的权限，强制退出
      if(role._id===memoryUtils.user.role._id){
        //删除保存的user数据
        storageUtils.removeUser()
        memoryUtils.user = {}
        //跳转到login
        this.props.history.replace('/login')
        message.success('当前角色权限修改了，重新登录')
      }else {
        message.success('设置角色权限成功')
        this.setState({
          roles:[...this.state.roles]
        })
      }
    }

  }

  componentWillMount () {
    this.initColumn()
  }

  componentDidMount () {
    this.getRoles()
  }

  render () {
    console.log('role()')
    const {roles,role,isShowAdd,isShowAuth} = this.state

    const title = (
      <span>
        <Button type="primary" onClick={() => this.setState({isShowAdd:true})}>创建角色</Button>&nbsp;&nbsp;
        <Button type="primary" disabled={!role._id} onClick={() => this.setState({isShowAuth:true})}>设置角色权限</Button>
      </span>
    )

    return (
      <Card title={title}>
        <Table
          bordered
          rowKey='_id'
          dataSource={roles}
          columns={this.columns}
          pagination={{defaultPageSize:PAGE_SIZE}}
          rowSelection={{
            type:'radio',
            selectedRowKeys:[role._id],
            onSelect:(role) => { //选择某个radio的时候回调
              this.setState({
                role
              })
            }
          }}/*rowSelection选中对应行，通过每一行都有的rowKey='_id'进行选择*/
          /*onRow这个配置，我认为是一个高级的事件监听函数：它把能响应的事件都放在一起，并将行对应的数据对象传入，让你
          * 以这种形式设置对应行的事件回调函数。------总结：传入一个函数，而函数里面接收的就是那个数据对象，返回是一个对象
          * 对象里有onClick（这些都是对应你对某一行进行的操作事件的监听回调函数）*/
          onRow={this.onRow}
        />

        <Modal
          title="添加角色"
          visible={isShowAdd}
          onOk={this.addRole}
          onCancel={() => {
            this.setState({isShowAdd:false})
            this.form.resetFields()
          }}
          >
          <AddForm
            setForm={(form) => {this.form=form}}
            />
        </Modal>

        <Modal
          title="设置角色权限"
          visible={isShowAuth}
          onOk={this.updateRole}
          onCancel={() => {
            this.setState({isShowAuth:false})
          }}
          >
          <AuthForm ref={this.auth} role={role}/>
        </Modal>
      </Card>
    )
  }
}