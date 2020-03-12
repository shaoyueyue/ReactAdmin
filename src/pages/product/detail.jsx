import React,{Component} from 'react'
import {
  Card,
  Icon,
  List
} from 'antd'

import LinkButton from '../../components/link-button'
import {BASE_IMG_URL} from '../../utils/constants'
import {reqCategory} from '../../api'

const Item = List.Item

/*
Product的详情子路由组件
 */
export default class ProductDetail  extends Component {

  state ={
    cName1:"", // 一级分类名称
    cName2:"" // 二级分类名称
  }

  async componentDidMount () {

    //得到当前商品的分类ID
    const {categoryId,pCategoryId} = this.props.location.state.product
    if(pCategoryId==='0'){//一级分类下的商品
      const result = await reqCategory(categoryId)
      const cName1 = result.data.name
      this.setState({cName1})
    } else {//二级分类下的商品
      /*
      //通过多个await方式发多个请求：后面一个请求是在前一个请求成功返回之后才发送
      const result1 = await reqCategory(pCategoryId)  //获取一级分类列表
      const result2 = await reqCategory(categoryId)  //获取二级分类列表
      //debugger
      const cName1 = result1.data.name
      const cName2 = result2.data.name
      */

      //一次性发送多个请求，只有都成功了，才正常处理
      const results = await Promise.all([reqCategory(pCategoryId),reqCategory(categoryId)])
      const cName1 = results[0].data.name
      const cName2 = results[1].data.name

      this.setState({
        cName1,
        cName2
      })

    }
  }

  render () {

    //读取携带过来的state数据
    const {name,desc,price,detail,imgs} = this.props.location.state.product
    const {cName1,cName2} =this.state

    const title = (
      <span>
        <LinkButton>
          <Icon
            type="arrow-left"
            style={{marginRight:10,fontSize:20}}
            onClick={() => this.props.history.goBack()}
          />
        </LinkButton>
        <span>商品详情</span>
      </span>
    )

    return (
      <Card title={title} className="product-detail">
        <List>
          <Item>
            <span className="left">商品名称:</span>
            <span>{name}</span>
          </Item>
          <Item>
            <span className="left">商品描述:</span>
            <span>{desc}</span>
          </Item>
          <Item>
            <span className="left">商品价格:</span>
            <span>{price}元</span>
          </Item>
          <Item>
            <span className="left">所属分类:</span>
            <span>{cName1} {cName2?'-->'+cName2:''}</span>
            {/*我们商品里面吧，记住我们商品里面只有两个id，两个特别的分类id，一个是当前分类id和父分类id。
            我们现在要显示的是分类id嘛，不行我们显示分类id我们看不懂，我们是不是要根据分类id去查询它的分类对象里面的
            分类的名称来显示，这里面是不是另外发请求去才行。这个要额外发请求来获取分类的名称。*/}
          </Item>
          <Item>
            <span className="left">商品图片:</span>
            <span>
              {
                imgs.map(img => (
                  <img
                    key={img}
                    src = {BASE_IMG_URL + img}
                    className="product-img"
                    alt="img"
                    />
                ))
              }
            </span>
          </Item>
          <Item>
            <span className="left">商品详情:</span>
            <span dangerouslySetInnerHTML={{__html:detail}}>
            </span>
          </Item>
        </List>
      </Card>
    )
  }
}