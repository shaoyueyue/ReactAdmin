/*
要求：能根据接口文档定义接口请求函数
包含应用中所有接口请求函数的模块
每个函数的返回值都是promise【因为你要不返回但时候就没有办法取到正确数据了】


基本要求：能根据接口文档定义接口请求函数
 */
import jsonp from 'jsonp'
import {message} from 'antd'
import ajax from './ajax'

//const BASE = 'http://localhost:5000'
const BASE = ''

//登录
/*export function reqLogin (username,password) {
  return ajax('/login',{username,password},'POST')
}*/
export const reqLogin = (username,password) => ajax(BASE + '/login',{username,password},'POST')

//获取一级/二级分类的列表
export const reqCategorys = (parentId) => ajax(BASE + '/manage/category/list',{parentId})/*{parentId}这个函数的参数会成为
                                   ajax的请求参数， 所以这个参数的对象名会成为请求参数的参数名和
                                                        这个参数的对象值会成为请求参数的参数值*/

//添加分类
export const reqAddCategorys = (categoryName,parentId) => ajax(BASE + '/manage/category/add',{categoryName,parentId},'POST')

//更新分类
export const reqUpdateCategorys = ({categoryId,categoryName}) => ajax(BASE + '/manage/category/update',{categoryId,categoryName},'POST')

//获取一个分类
export const reqCategory = (categoryId) => ajax(BASE + '/manage/category/info',{categoryId})

//获取商品分页列表
export const reqProducts = (pageNum,pageSize) => ajax(BASE + '/manage/product/list',{pageNum,pageSize})

//跟新商品的状态（上架/下架）
export const reqUpdateStatus = (productId,status) => ajax(BASE + '/manage/product/updateStatus',{productId,status},'POST')

/*
 搜索商品分页列表(根据商品名称/商品描述)
 searchType:搜索的类型，productName/productDesc
 */
export const reqSearchProducts = ({pageNum,pageSize,searchName,searchType}) => ajax(BASE + 'manage/product/search',{
  pageNum,
  pageSize,
  [searchType]:searchName,
})

//删除指定名称的图片
export const reqDeleteImg = (name) => ajax(BASE + '/manage/img/delete',{name},'POST')

//添加/删除商品
export const reqAddOrUpdateProduct = (product) => ajax(BASE + '/manage/product/' + (product._id?'update':'add'),product,'POST')

//获取所有角色的列表
export const reqRoles = () => ajax(BASE + '/manage/role/list')

//添加角色的列表
export const reqAddRole = (roleName) => ajax(BASE + '/manage/role/add',{roleName},'POST')
//更新角色(给角色设置权限)
export const reqUpdateRole = (role) => ajax(BASE + '/manage/role/update',role,'POST')

//获取所有用户的列表
export const reqUsers = () => ajax(BASE + '/manage/user/list')

//删除指定用户
export const reqDeleteUser = (userId) => ajax(BASE + '/manage/user/delete',{userId},'POST')


//添加/更新用户
export const reqAddOrUpdateUser = (user) => ajax('/manage/user/'+(user._id ? 'update' : 'add'),user,'POST')

/*
jsonp请求的接口请求函数
 */
export const reqWeather = (ctiy) => {

  return new Promise((resolve,reject) => {
    const url = 'http://api.map.baidu.com/telematics/v3/weather?location='+ctiy+'&output=json&ak=3p49MVra6urFRGOT9s8UBWr2'
    //发送jsonp请求
    jsonp(url,{},(err,data) => {
      console.log('jsonp()',err,data)
      //如果成功了
      if(!err && data.status==='success') {
        //取出需要的数据
        const {dayPictureUrl,weather} = data.results[0].weather_data[0]
        resolve({dayPictureUrl,weather})
      }else{
        //如果失败了
        message.error('获取天气信息失败')
      }
    })
  })
}
//reqWeather('北京')

/*
 jsonp解决ajax跨域的原理
 1). jsonp只能解决GET类型的ajax请求跨域问题
 2). jsonp请求不是ajax请求, 而是一般的get请求
 3). 基本原理
 浏览器端:
 动态生成<script>来请求后台接口(src就是接口的url)
 定义好用于接收响应数据的函数(fn), 并将函数名通过请求参数提交给后台(如: callback=fn)
 服务器端:
 接收到请求处理产生结果数据后, 返回一个函数调用的js代码, 并将结果数据作为实参传入函数调用
 浏览器端:
 收到响应自动执行函数调用的js代码, 也就执行了提前定义好的回调函数, 并得到了需要的结果数据
 */

