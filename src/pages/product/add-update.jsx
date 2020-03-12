import React,{PureComponent} from 'react'
import {
  Card,
  Form,
  Input,
  Cascader,//级联选择   级联列表  再说一遍这些都是组件
  Button,
  Icon,
  message
} from 'antd'

import LinkButton from '../../components/link-button'
import {reqCategorys,reqAddOrUpdateProduct} from '../../api'
import PicturesWall from './pictures-wall'
import RichTextEditor from './rich-text-editor'

const {Item} = Form
const { TextArea } = Input

/*
Product的添加和更新的子路由组件
 */
class ProductAddUpdate  extends PureComponent {

  state = {
    options:[],
  }

  constructor (props) {
    super(props)

    //创建用来保存ref标识的标签对象的容器
    this.pw = React.createRef()
    this.editor = React.createRef()
  }

  initOptions = async (categorys) => {
    //根据categorys数组生成options数组
    const options = categorys.map(c => ({
      value: c._id,
      label: c.name,
      isLeaf: false,  //不是叶子
    }))
    //debugger

    //如果是一个二级分类商品的更新
    const {isUpdate,product} = this
    const {pCategoryId} = product
    if(isUpdate&&pCategoryId!=='0'){
      //获取对应的二级分类列表
      const subCategorys = await this.getCategorys(pCategoryId)
      //生成二级下拉列表的options
      const childOptions = subCategorys.map(c => ({
        value: c._id,
        label: c.name,
        isLeaf: true
      }))


      //console.log(pCategoryId,options)
      const targetOption = options.find(option => {
        return option.value===pCategoryId
      } )

      //关联到对应的以及option上
      targetOption.children = childOptions
    }

    //更新options状态
    this.setState({
      options
    })
  }

  /*
   异步获取一级/二级分类列表显示
   async函数的返回值是一个新的promise对象，promise的结果和值由async函数的结果来决定
   */
  getCategorys = async (parentId) => {
    //发送异步ajax请求，获取数据
    const result = await reqCategorys(parentId) //{status:0,data:categorys}
    //debugger
    if(result.status===0) {
      //取出分类数组（可能是一级也可能是二级）
      const categorys = result.data
      //如果是一级分类列表
      if(parentId==='0'){
        this.initOptions(categorys)
      } else {//二级列表
        return categorys //返回二级列表 ===> 当前的async函数返回的promise就会成功且value为categorys
      }
    }
  }

  /*
  验证价格的自定义验证函数
  */
  validatePrice = (rule,value,callback) => {
    console.log(value,typeof value)
    if(value*1>0){
      callback() //验证通过
    } else {
      callback('价格必须大于0') //验证没通过
    }
  }

  /*
  * 用来加载下一级列表的回调函数
  * */
  loadData = async selectedOptions => {
    //得到选择的option对象
    const targetOption = selectedOptions[0]
    //显示loading
    targetOption.loading = true

    //根据选中的分类，请求获取二级分类列表
    const subCategorys = await this.getCategorys(targetOption.value)
    //隐藏loading
    targetOption.loading = false
    //我去获取二级列表，最好能拿到二级列表吧，拿到二级列表我就能新的二级列表options数组
    //直接写得不到二级列表，这个地方就要说一个事情，就是async函数它的返回值是一个什么类型，是不是一个promise对象，而
    //返回的promise对象它的结果是由谁来决定的
    //二级分类数组有数据，我才去生成二级列表
    if(subCategorys && subCategorys.length > 0){
      //生成一个二级列表的options
      const childOptions = subCategorys.map(c => ({
        value: c._id,
        label: c.name,
        isLeaf: true
      }))
      //关联到当前option上
      /*
       //仔细看一下这一步的内容，从两点来理解：1.在这函数中得到的targetOption就是前面设置状态时options数组中的一个option对象
       //2.targetOption.children，这一步是在给我们得到的这个option对象加一个属性，很简单的操作，原来options数组中的这个对象变了，多了个
       // children属性
      */
      targetOption.children = childOptions
    }else { //当前选中的分类没有二级分类
      targetOption.isLeaf = true
    }

    //更新options状态
    this.setState({
      options:[...this.state.options]
    })
  }


  submit = () => {
    //进行表单验证，如果通过了，才发送请求
    this.props.form.validateFields(async (error,values) => {
      if(!error){

        //1.收集数据，并封装成product对象
        const {name,desc,price,categoryIds} = values
        let categoryId,pCategoryId
        if(categoryIds.lenth===1){
          pCategoryId = '0'
          categoryId = categoryIds[0]
        } else {
          pCategoryId = categoryIds[0]
          categoryId = categoryIds[1]
        }
        const imgs = this.pw.current.getImgs()
        const detail = this.editor.current.getDetail()

        const product = {name,desc,price,imgs,detail,pCategoryId,categoryId}

        //如果是更新需要添加_id
        if(this.isUpdate){
          /*console.log(this.product)
          debugger*/
          product._id = this.product._id
        }

        //2.调用接口请求函数去添加/更新
        const result = await reqAddOrUpdateProduct(product)

        //3.根据结果提示
        if(result.status===0){
          message.success(this.isUpdate?'更新商品成功！':'添加商品成功！')
          this.props.history.goBack()
        }else {
          message.error(this.isUpdate?'更新商品失败！':'添加商品失败！')
        }
      }
    })
  }


  componentDidMount (){
      this.getCategorys('0')
  }

  componentWillMount (){
    //取出携带的state
    const product = this.props.location.state  //如果是添加没有值，否则有值
    //保存是否是更新的标识（加一个非是取反，加两个非强制转换布尔类型）
    this.isUpdate = !!product
    //保存商品（如果没有，保存是{}）
    this.product = product || {}
  }

  render () {

    const {isUpdate,product} = this
    const {pCategoryId,categoryId,imgs,detail} = product
    //用来接收级联分类ID的数组
    const categoryIds = []
    if(isUpdate){
      //商品是一个一级分类的商品
      if(pCategoryId==='0'){
        categoryIds.push(categoryId)
      } else {
        //商品是一个二级分类的商品
        categoryIds.push(pCategoryId)
        categoryIds.push(categoryId)
      }
    }

    //指定Item布局的配置对象
    const formItemLayout = {
      labelCol: { span: 2 }, //左侧label的宽度
      wrapperCol: { span: 8 }, //指定右侧包裹的宽度
    }

    //头部左侧标题
    const title = (
      <span>
        <LinkButton onClick={() => this.props.history.goBack()}>
          <Icon type="arrow-left" style={{fontSize:20}} />
        </LinkButton>
        <span>{isUpdate ? '修改商品' : '添加商品'}</span>
      </span>
    )

    const {getFieldDecorator}  = this.props.form //验证并收集的过程中，最后我会收集的数据形成一个product对象保存，为了方便
                                                   //设计的收集数据的名字最好和product对象的一致



    return (
      <Card title={title}>
        <Form{...formItemLayout}>
          <Item label="商品名称">
            {
              getFieldDecorator('name',{
                initialValue:product.name,
                rules:[
                  {required:true,message:'必须输入商品名称'}
                ]
              })(<Input placeholder="请输入商品名称"/>)
            }
          </Item>
          <Item label="商品描述">
            {
              getFieldDecorator('desc',{
                initialValue:product.desc,
                rules:[
                  {required:true,message:'必须输入商品描述'}
                ]
              })(<TextArea placeholder="请输入商品描述" rows={4} />

                /*<TextArea placeholder="请输入商品描述" autoSize={{minRows:2,maxRows:6}} />*/)
            }
          </Item>
          <Item label="商品价格">
            {
              getFieldDecorator('price',{
                initialValue:product.price,
                rules:[
                  {required:true,message:'必须输入商品价格'},
                  {validator:this.validatePrice}
                ]
              })(<Input type="number" placeholder="请输入商品价格" addonAfter="元"/>)
            }
          </Item>
          <Item label="商品分类">
            {
              getFieldDecorator('categoryIds',{
                initialValue:categoryIds,
                rules:[
                  {required:true,message:'必须指定商品分类'},
                ]
              })(
                <Cascader
                  placeholder="请指定商品分类"
                  options={this.state.options} /*需要显示的列表数组*/
                  loadData={this.loadData}/*当选择某个列表项，加载下一级列表的监听回调*/
                />
              )
            }
          </Item>
          <Item label="商品图片">
            <PicturesWall ref={this.pw} imgs={imgs}/>
          </Item>
          <Item label="商品详情" labelCol={{span: 2}} wrapperCol={{span: 20}}>
            {/*下一个我们来做什么呢，来做这一个富文本编辑器，就是用来编辑商品详情的。好我们来去做一把。
            一定要有概念理解:这个商品详情可以进行富文本编辑的（重点对于‘富文本’的理解：所说的富文本就是，去生成
            有网页格式的有一定样式效果的一些文本，甚至可以生成一些链接都可以都没有任何关系，甚至包含图片都可以生成，
            就是这里面是一些可以进行特定格式处理的一些东西）。
            所以我认为：1.商品详情是可以进行富文本编辑的 2.富文本编辑就是根据输入内容生成可以形成
            有网页格式的有一定样式效果的一些文本（这些文本简单的说就是形成网页形式的内容（html，css））
              3.虽然输出的内容特殊（富文本编辑），但是基本面还是和其它的表格组件标签一样的功能：用户利用这个组件输入内容，
              我们利用这个组件获取用户输入的内容*/}
            <RichTextEditor ref={this.editor} detail={detail}/>
          </Item>
          <Item>
            <Button type="primary" onClick={this.submit}>提交</Button>
            {/*这里面有几种做法，一种直接在家onClick你就不用整，它表单就不会自动提交。
              当然你在Form这里面写onsubmit也可以，如果是onsubmit就有一个问题，你必须阻止事件的默认行为*/}
          </Item>
        </Form>
      </Card>
    )
  }
}


export default  Form.create()(ProductAddUpdate)

/*
 1.子组件调用父组件的方法：将父组件的方法函数属性的形式传递给子组件，子组件就可以调用
2.父组件调用子组件的方法：（重点0：第一种方法是通过标签属性，从父组件传数据给子组件
                            重点1：组件父子关系怎么确定，A组件内部有B组件标签就说B组件是A组件的子组件。
                            重点2：其实好做，这个地方主要大家不知道一件事情：标签对象就是组件对象。
                            只要我能得到这个标签对象（我们前面通过ref读取标签对象，标签对象就是组件对象你说下一步该做什么）
                            在父组件中通过ref得到子组件标签对象（也就是组件对象），调用其方法

 */
