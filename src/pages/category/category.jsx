import React,{Component} from 'react'
import {
  Card,
  Table,
  Button,
  Icon,
  message,
  Modal
} from 'antd'

import LinkButton from '../../components/link-button'
import {reqCategorys,reqUpdateCategorys,reqAddCategorys} from '../../api'
import AddForm from './add-form'
import UpdateForm from './update-form'

/*
 商品分类路由
 */
export default class Category  extends Component {
  /*我要显示的一级列表数据是在我组件的状态里面的，在状态里有什么好处只要我更新状态我的组件就会重新渲染*/
  state = {
    loading:false, //是否正在获取数据中
    categorys:[],  //一级分类列表
    subCategorys:[], //二级分类列表
    parentId:'0', //当前需要显示的分类列表的父分类ID
    parentName:'', //当前需要显示的分类列表的父分类名称
    showStatus:0 //标识 添加/更新 的确认框是否显示，0：都不显示，1：显示添加，2：显示更新
  }

  /*
  初始化Table所有列的数组
   */
  initColumns = () => {
    this.columns = [
      /*{
       title: '姓名',
       dataIndex: 'name',/!*dataIndex指定的是什么，我是不是每一列要找这个（源数据）数组某一个元素对象里面的某一个属性的值*!/
       key: 'name',
       }*/
      {
        title: '分类的名称',
        dataIndex: 'name',//指定显示数据对应的属性名
      },
      {
        title: '操作',
        width:300,
        render: (category) => (//返回需要显示的界面标签
          <span>
              <LinkButton onClick={() => this.showUpdate(category)}>修改分类</LinkButton>
            {/*如何向事件回调函数传递参数：先定义一个匿名函数，在函数中调用处理的函数并传入数据*/}
            {this.state.parentId==='0' ?  <LinkButton onClick={() => this.showSubCategorys(category) }>查看子分类</LinkButton> : null}
            {/*你就这么写，你怎么知道点的是第几个，所以说其实这个地方要说一个事情，我怎么知道我点的是第几个呢，其实在这个
             * render里面它是由参数传给你的，只是咱看是没有没有去声明。我每一行是不是有自己的render，因为这个渲染某一行
             * 的吧，它会把当前这一行所对应的（我们每一行是不是对应分类的对象【我现在不是 显示着分类的数组嘛，每一行是不是
             * 一个分类的对象。一行代表一个对象嘛多行就代表一个数组嘛】）分类对象作为参数传进来。每一行都有自己的数据对象*/}
          </span>
        )
      }
    ]
  }

  /*
  异步获取一级/二级分类列表显示
   parentId:如果没有指定根据状态中的parentId请求，如果指定了根据指定的请求
   */
  getCategorys = async (parentId) => {

    //在发请求前，显示loading
    this.setState({loading:true})

    parentId = parentId || this.state.parentId
    //发送异步ajax请求，获取数据
    const result = await reqCategorys(parentId)
    //在请求完之后，隐藏loading
    this.setState({loading:false})
    if(result.status===0){
      //取出分类数组（可能是一级也可能是二级）
      const categorys = result.data
      if(parentId==='0'){
        //更新一级分类状态
        this.setState({
          categorys
        })
        console.log('------',this.state.categorys.length) //这个length是0还是不是0呢？不是0，为什么呢因为我们现在是在await之后
                                                    //执行，await之后相当于是在promise那个then成功的回调函数里面执行
      } else {
        //更新二级分类状态
        this.setState({
          subCategorys:categorys
        })
      }
    } else {
      message.error('获取分类列表失败')
    }
  }

  /*
  显示指定一级分类对象的二级字列表
   */
  showSubCategorys = (category) => {
    //更新状态
    this.setState({
      parentId:category._id,
      parentName:category.name
    },() => { //在状态更新且重新render()后执行
      console.log('parentId',this.state.parentId) //''      【涉及到React.Component当中setState()的使用说明】
      //获取二级分类列表显示
      this.getCategorys()
    })
    //setState()不能立即获取最新的状态：因为setState()是异步更新状态的
    //console.log('parentId',this.state.parentId) //'0'
  }

  /*
   显示指定一级分类列表
   */
  showCategorys = () => {
    //更新为显示一级列表的状态【调用这个方法的时候已经有了一级列表的数据，之所以显示二级列表是因为parentId不等于0】
    this.setState({
      subCategorys:[],
      parentId:'0',
      parentName:''
    })
  }

  /*
  响应点击取消：隐藏确定框
   */
  handleCancel = () => {
    //清除输入数据（重置表单项）
    this.form.resetFields()
    //隐藏确认框
    this.setState({
      showStatus:0
    })
  }

  /*
  显示添加的确认框
   */
  showAdd = () => {
    this.setState({
      showStatus:1
    })
  }
  /*
  添加分类
   */
  addCategory = () => {
    console.log('addCategory()')

    this.form.validateFields( async (err,values) => {
      if(!err){
        //1.隐藏确定框
        this.setState({
          showStatus:0
        })

        //2.收集数据，并提交添加分类的请求
        const {parentId,categoryName} = values
        //清除输入数据（重置表单项）
        this.form.resetFields()
        const result = await reqAddCategorys(categoryName,parentId)
        if(result.status===0){

          //添加的分类就是当前分类列表的分类
          if(parentId===this.state.parentId){
            //3.重新当前获取分类列表显示
            this.getCategorys()
          }else if (parentId==='0'){ //在二级分类列表下添加一级分类，从新获取一级分类列表，但不需要显示一级列表
            this.getCategorys('0')
          }
        }
      }
    })
  }


  /*
   显示更新的确认框
   */
  showUpdate = (category) => {
    //保存分类对象
    this.category = category

    //更新状态
    this.setState({
      showStatus:2
    })
  }

  /*
  更新分类
   */

  updateCategory = () => {
    console.log('updateCategory()')

    //进行表单验证，只有通过了才处理
    this.form.validateFields( async (err,values) => {
      if(!err){
        //1.隐藏确定框
        this.setState({
          showStatus:0
        })

        //准备数据
        const categoryId = this.category._id
        const {categoryName} = values
        //思路：分类的名字是说输入的数据，是我输入的数据我们应该通过那个对象去取，是不是有一个form
        //对象来着（在有from对象的组件确实可以做到这点，但是在本组件没有form对象，本组件
        // 的子组件有（能取到输入数据的）form对象）

        //清除输入数据（重置表单项）
        this.form.resetFields()/*第一步：隐藏确定框，只是改变了Modal标签是否可见的属性，也就是说完成第一步隐藏后并没有清空Form表单里
         输入的内容，（前面的遗留和react最小更新的算法）所以导致下一次虽然后默认但是直接显示上次输入，解决方法是获取完输入框内容后
         销毁输入框的内容*/

        //2.发请求更新分类
        const result = await reqUpdateCategorys({categoryId,categoryName})
        if(result.status===0){
          //3.重新显示列表
          this.getCategorys()
        }
      }
    })
  }

  /*
  为第一次render()准备数据
   */
  componentWillMount () {
    this.initColumns()
  }

  /*
  执行异步任务：发异步ajax请求
   */
  componentDidMount () {
  //获取一级分类列表显示
    this.getCategorys()
  }

  render () {

    //读取状态数据
    const {categorys,subCategorys,parentId,parentName,loading,showStatus} = this.state
    //读取指定的分类
    const category = this.category || {} //如果还没有指定一个空对象

    //card的左侧
    const title =   parentId==='0' ? '一级分类列表' :(
      <span>
        <LinkButton onClick={this.showCategorys}>一级分类列表</LinkButton>
        <Icon type="arrow-right" style={{marginRight:5}}  />
        <span>{parentName}</span>
      </span>
    )
    //card的右侧
    const extra = (
      <Button type="primary" onClick={this.showAdd}>
        <Icon type="plus"/>
        添加
      </Button>
    )

    return (
      <Card title={title} extra={extra}>
        <Table
          bordered
          rowKey='_id'
          loading={loading}
          dataSource={parentId==='0' ? categorys :subCategorys}
          columns={this.columns}
          pagination={{defaultPageSize:5,showQuickJumper:true}}
          />

        <Modal
          title="添加分类"
          visible={showStatus===1}
          onOk={this.addCategory}
          onCancel={this.handleCancel}
          >
          <AddForm
            categorys={categorys}
            parentId={parentId}
            setForm={(form) => {this.form=form}}
          />
        </Modal>

        <Modal
          title="更新分类"
          visible={showStatus===2}
          onOk={this.updateCategory}
          onCancel={this.handleCancel}
          >
          <UpdateForm
            categoryName={category.name}
            setForm={(form) => {this.form=form}}
          />
        </Modal>
      </Card>
    )
  }
}