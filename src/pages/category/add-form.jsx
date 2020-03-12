import React,{Component} from 'react'
import PropsTypes from 'prop-types'
import {
  Form,
  Select,
  Input
} from  'antd'

const Item = Form.Item
const Option = Select.Option

/*
添加分类的form组件
 */
class AddForm  extends Component {

  static propTypes = {
    setForm:PropsTypes.func.isRequired, //用来传递form对象的函数
    categorys:PropsTypes.array.isRequired, //一级分类的数组
    parentId:PropsTypes.string.isRequired  //父分类的ID
  }

  componentWillMount () {
    this.props.setForm(this.props.form)
  }

  render () {

    const {getFieldDecorator} = this.props.form
    const {categorys,parentId} = this.props

    return (
      <Form>
        <Item>
          {
            getFieldDecorator('parentId',{
              initialValue:parentId
            })(
              <Select>
                <Option value="0">一级分类</Option>
                {
                  categorys.map((c,index) => <Option value={c._id} key={index}>{c.name}</Option>)
                }
              </Select>
            )
          }
        </Item>
        <Item>
          {
            getFieldDecorator('categoryName',{
              initialValue:'',
              rules:[
                {required:true,message:'分类名称必须输入'}
              ]
            })(
              <Input placeholder="请输入分类名称"/>
            )
          }
        </Item>
      </Form>
    )
  }
}

export default  Form.create()(AddForm)
