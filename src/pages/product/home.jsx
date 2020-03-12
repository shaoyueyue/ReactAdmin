import React,{Component} from 'react'
import {
  Card,
  Select,
  Input,
  Button,
  Icon,
  Table,
  message
} from 'antd'

import LinkButton from '../../components/link-button'
import {reqProducts,reqSearchProducts,reqUpdateStatus} from '../../api'
import {PAGE_SIZE} from '../../utils/constants'

const Option = Select.Option
/*
Product的默认子路由组件
 */
export default class ProductHome  extends Component {

  state = {
    total:0, //商品的总数量
    products:[], //商品的数组
    loading:false, //是否正在加载中
    searchName:'', //搜索的关键字
    searchType:'productName', //根据那个字段搜索
    searchStatus:false //现在是是否是搜索状态【我自己加的，用来解决bug】
  }

  /*
  初始化table的列的数组
   */
  initColumns = () => {
    this.columns = [
      {
        title: '商品名称',
        dataIndex: 'name',
      },
      {
        title: '商品描述',
        dataIndex: 'desc',
      },
      {
        title: '价格',
        dataIndex: 'price',
        render: (price) => '￥' + price   //当前指定了对应的属性，传入的是对应的属性值
      },
      {
        width:100,
        title: '状态',
        //dataIndex: 'status',
        render: (product) => {
          const {status,_id} = product
          const newStatus = status === 1 ? 2 : 1
          return (
            <span>
              <Button
                type="primary"
                onClick={() => this.updateStatus(_id,newStatus)}
              >
                {status===1?'下架':'上架'}
              </Button>
              <span>{status===1?'在售':'已下架'}</span>
            </span>
          )
        }
      },
      {
        width:100,
        title: '操作',
        render: (product) => {
          return (
            <span>
              {/*将product对象使用state传递给目标路由组件*/}
              <LinkButton onClick={() => this.props.history.push('/product/detail',{product})}>详情</LinkButton>
              <LinkButton onClick={() => this.props.history.push('/product/addupdate',product)}>修改</LinkButton>
            </span>
          )
        }
      },
    ];
  }


  /*
  获取指定页码的列表数据显示
   */
  getProducts =  async (pageNum) => {

    //我们每一次去发请求是不是都指定了是那一页，我应该把这个数据存起来吧，让别的方法也能看的见，也不一定放在状态里面，
    //能不放在状态里面就不放在状态里面
    this.pageNum = pageNum  //保存pageNum，让其他方法可以看见（就是其他方法需要刷新显示时，可以知道当前页码）


    this.setState({loading:true}) //显示loading

    const {searchName,searchType,searchStatus} = this.state

    //如果搜索关键字有值，说明我们要做搜索分页
    let result
    if(searchName&&searchStatus){
      result = await reqSearchProducts({pageNum,pageSize:PAGE_SIZE,searchName,searchType})
    } else {
      this.setState({searchStatus:false})
      result = await reqProducts(pageNum,PAGE_SIZE)
    }
    this.setState({loading:false}) //隐藏loading
    if(result.status === 0){
      //取出分页数据，更新状态，显示分页列表
      const {total,list} = result.data
      this.setState({
        total,
        products:list
      })
    }
  }

  /*
  更新指定商品的状态
   */
  updateStatus = async (productId,status) => {
    const result = await reqUpdateStatus(productId,status)
    console.log(productId,status)
    console.log(result)
    if(result.status===0) {
      message.success('更新商品成功')
      this.getProducts(this.pageNum)
    }
  }

  componentWillMount () {
    this.initColumns()
  }

  componentDidMount () {
    this.getProducts(1)
  }

  render () {

    //取出状态数据
    const {products,total,loading,searchName,searchType} = this.state

    const title = (
      <span>
        <Select
          value={searchType}
          style={{width:150}}
          onChange={value =>this.setState({searchType:value})}
        >
          <Option value="productName">按名称搜索</Option>
          <Option value="productDesc">按描述搜索</Option>
        </Select>
        <Input
          placeholder="关键字"
          style={{width:150,margin:'0 15px'}}
          value={searchName}
          onChange={event =>this.setState({searchName:event.target.value })}
        />
        <Button type="primary" onClick={() => {
          //更新状态
          this.setState({
            searchStatus:true,
          },() => { //在状态更新且重新render()后执行
            this.getProducts(1)
          })
        }}>搜索</Button>
      </span>
    )

    const extra = (
      <Button type="primary" onClick={() => this.props.history.push('/product/addupdate')}>
        <Icon type="plus"/>
        添加商品
      </Button>
    )

    return (
      <Card title={title} extra={extra}>
        <Table
          bordered
          rowKey="_id"
          loading={loading}
          dataSource={products}
          columns={this.columns}
          pagination={{
            current:this.pageNum,
            defaultPageSize:PAGE_SIZE,
            showQuickJumper:true,
            total,
            onChange:this.getProducts
          }}
        />
      </Card>
    )
  }
}