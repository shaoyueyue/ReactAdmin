import React,{Component} from 'react'
import {
  Form,
  Icon,
  Input,
  Button,
  message
} from 'antd'
import {Redirect} from 'react-router-dom'

import './login.less'
import logo from '../../assets/images/logo.png'
import {reqLogin} from '../../api'
import memoryUtils from'../../utils/memoryUtils'
import storageUtils from'../../utils/storageUtils'

const Item = Form.Item //不能写在import之前

/*
登录的路由组件【要能理解我们写的这些组件是包含了前端的html、css和js，甚至还有图片。】
 */
class Login  extends Component {

  handleSubmit = (event) => {

    //阻止事件的默认行为
    event.preventDefault()

    //对所有表单字段进行检验
    this.props.form.validateFields(async (err,values) => {
      //校验成功
      if(!err){
        //console.log('提交登录的ajax请求',values)
        //请求登录
        const {username,password} = values
        //console.log(2222222222222222222222222)//发现 await右边表达式如果 后面的代码（await左边和下面）就不会执行了
        const result =await reqLogin(username,password)//{status:0,data:user} {status:1,msg:'xxx'}
        //console.log(11111111111111111111111111)
        //console.log('请求成功',result)
        if(result.status===0){//登录成功
          //提示登录成功
          message.success('登录成功')

          //保存user
          const user = result.data
          memoryUtils.user = user //保存在内存中
          storageUtils.saveUser(user)  //保存到localStorage中【我就这么存一下还没有实现功能，我是不是登录成功了以后去存到
          // local里面去了，那什么时候用呢？刷新的时候是不是要读是不是要读到内存里来，那我在那去写读的代码呢（读到内存里来），
          // 是在admin里面去写嘛，不是，最好在入口js，说白了入口js是不是一上来就执行，我一上来就干嘛去，就读取local中保存的user】

          //跳转到管理界面(不需要在回退回到登录)
          this.props.history.replace('/')//所有的路由组件不是都接受了三个特别属性嘛

        } else {//登录失败
          //提示错误信息
          message.error(result.msg)
        }
      }else{
        console.log('校验失败！')
      }
    })

    ////得到具有强大功能的form对象
    //const form = this.props.form
    ////获取表单项的输入数据
    //const values = form.getFieldsValue()
    //console.log('handleSubmit()',values)
  }

  /*
  对密码进行自定义验证
   */
  /*
   用户名/密码的的合法性要求
   1). 必须输入
   2). 必须大于等于 4 位
   3). 必须小于等于 12 位
   4). 必须是英文、数字或下划线组成
   */
  validatorPwd = (rule,value,callback) => {
    console.log('validatorPwd()',rule,value)
    if(!value){
      callback('密码必须输入')
    }else if(value.length<4){
      callback('密码长度不能小于4位')
    }else if(value.length>12){
      callback('密码长度不能大于12位')
    }else if(!/^[a-zA-Z0-9_]+$/.test(value)){
      callback('密码必须是英文、数字或下划线组成')
    }else{
      callback() //验证通过
    }
    //callback() //验证通过
    //callback('xxxx') //验证失败，并指定提示的文本
  }

  render () {
    //如果用户已经登录，自动跳转到管理
    const user = memoryUtils.user
    //如果内存有存储user ==> 当前有登陆
    if(user && user._id) {
      //如何自动跳转到admin界面（在render（）中）
      return <Redirect to="/" />
    }


    /*那也就是说我们现在包了以后，我们的这个Form组件是不是就可以去得到那个form对象啊*/
    //得到具有强大功能的form对象
    const form = this.props.form
    const {getFieldDecorator} = form
    return (
      <div className="login"> {/*为什么是className，它为什么不能用class，因为这实际上本质是写js，而在js里面class能直接写吗,
                                   其次为什么写这些类名，让样式通过类名控制*/}
        <header className="login-header">
          <img src={logo} alt="logo"/>    {/*<img src="./images/logo.png" alt=""/>------在react里面不支持这种写法*/}
          <h1>React项目：后台管理系统</h1>
        </header>
        <section className="login-content">
          <h2>用户登录</h2>
          <Form onSubmit={this.handleSubmit} className="login-form">
            <Item>
              {/*
               用户名/密码的的合法性要求
               1). 必须输入
               2). 必须大于等于 4 位
               3). 必须小于等于 12 位
               4). 必须是英文、数字或下划线组成
               */}
              {getFieldDecorator('username',{//配置对象：属性名是特定的一些名称 (可以配置很多东西)
                //声明式验证：直接使用被人定义好的验证规则进行验证
                rules:[
                  {required:true,whitespace:true,message:'用户名必须输入'},//每一个对象对某一个规则检查
                  {min:4,message:'用户名至少4位'},
                  {max:12,message:'用户名最多12位'},
                  {pattern:/^[a-zA-Z0-9_]+$/,message:'用户名必须是英文、数字或下划线组成'}
                ],
                initialValue:'admin'//指定初始值
              })(
                <Input
                  prefix={<Icon type="user" style={{color:'rgba(0,0,0,.25)'}} />}
                  placeholder="用户名"
                  />
              )}
            </Item>
            <Item>
              {getFieldDecorator('password',{
                rules:[
                  {
                    validator:this.validatorPwd
                  }
                ]
              })(
                <Input
                  prefix={<Icon type="lock" style={{color:'rgba(0,0,0,.25)'}} />}
                  type="password"
                  placeholder="密码"
                  />
              )}
            </Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button">
                登录
              </Button>
            </Form.Item>
          </Form>
        </section>
      </div>
    )
  }
}

/*
1.高阶函数
【这里面那个是高阶函数，create，为什么它是高阶函数因为它返回的是一个函数】
  1).一类特别的函数（也就是说不是所有函数都是高阶函数）
      a.接收函数类型的参数
      b.返回值是函数
  2）.常见
      a.定时器：setTimeOut()/setInterval()
      b.Promise:Promise(() => {})   then(value => {},reason => {})
      c.数组遍历相关的方法：forEach()/filter()/map()/reduce()/find()/findIndex()
      d.函数对象的bind()
      e.Form.create()()------>也就是说这个函数返回的函数是不是能包装一个组件生成一个新的组件啊
      f.connect()()
      g.getFieldDecorator()()
 【好，那这个地方要说个事情，我们这个高阶函数和我们一般的非高阶函数，它的区别在那呢
        是不是就在于一般的函数可能接受的参数是一般的类型不是函数对不对，或者返回的不是函数对不对。
     那你要知道一个函数代表着一个动态的功能，代表着一个功能你能听懂吗，也就是说比如说我一个函数接收一个数值或者说
     接收一个字符串，和你接收一个新的函数那谁具有一个更大的变化性呢，那肯定接收函数我的可扩展能力更强大啊，我接收函数
     就接收了一个变化的功能那个功能是不是后面可以执行啊，我返回一个函数是不是就返回了一个将来可以反复只用的功能啊 】
  3）.高阶函数更加动态，更加具有扩展性

2.高阶组件
    1).（本质）
    本质就是一个函数
    2）.（这个函数需要具有什么特点）
    接收一个组件（被包装组件），返回一个新的组件（【产生】包装组件【，具有包装功能的组件】），包装组件会向被包装组件
    传入特定属性
    【你说现在我这个create是一个高阶组件吗，不是，它本质是一个函数但是它接收的不是组件，不是这一个函数是高阶组件而是
    它返回的函数是高阶组件。它返回的函数是高阶组件而那个函数是不是接收一个组件产生一个新的组件，我们渲染的时候是不是
    渲染那个具有包装功能的组件，那个具有包装功能的组件的内部是不是包含了它（Login）。听懂了嘛，那也就是说这个被包装
    的组件是包装组件的一个子组件吧，那父组件会向子组件传递一个什么东西，我们刚才看到现象了传的是什么是不是穿了一个
    很重要的属性对象叫form啊，而这个form对象是不是具有强大的功能，能听懂嘛，这样其实它是用来扩展一个组件的】
    3）.作用：扩展组件的功能
    【getFieldDecorator()()，返回的函数不是高阶组件，因为它传入的不是组件而是组件的标签对象（我们说要传入的是组件，而
    它传的是标签对象）。但是这一个它虽然说不是高阶组件但是它是不是相当于扩展这一个标签对象的功能。
    【【1.要理解组件本质上是一个函数。2.要区别虚拟DOM和组件是由本质的区别的。3.然后一起来理解组件作为一个函数发挥的功能】】
    区分：大家知道啊组件和标签对象是一个什么关系，组件本质上是不是一个函数是一个构造函数吧是个函数吧最后是不是产生
    组件的实例，而组件的实例就是谁：标签对象。那也就是说我组件是一个类型而我的标签呢是组件的某一个实例吧。
    我们的高阶组件是用来去包装组件的，包装这个组件类型的。而它的这个函数刚才返回的这个函数（getFieldDecorator()()），
    它包装的是谁是不是包装的是实例。区别一个针对的是类型，一个是针对的类型的实例】
    4）.高阶组件也是一个高阶函数：接收一个组件函数，返回一个新的组件函数
 【【1.要理解组件本质上是一个函数。2.要区别虚拟DOM和组件是由本质的区别的。3.然后一起来理解组件作为一个函数发挥的功能】】
 */
/*
也就是说我简单的说，现在做的事情简单的表达是什么呢
包装Form组件
（什么叫Form组件，就是内部有Form标签的组件的组件我们成Form组件，就是这个组件内部包含Form）
生成一个新的组件（要理解什么是Form组件，然后这句话是“包装Form组件生成一个新的组件”）：是这个名字---->Form(login)
新组件会向Form组件传递一个强大对象属性（react-redux的connect函数）：form【能听懂吧，也就是说大家都知道我们某一个组件
接收组件是不是父组件传的（【这里就是邵越越的废话了：最后生成一个组件，这个组件作为父组件给子组件传递一个对象属性】）】
 */
const WrapLogin = Form.create()(Login)/*理解这个Form.create()(Login)整体的时候，可以结合connect函数的作用（将外部接收
                                        到的数据传给一个组件）来理解*/
export default WrapLogin

/*
1.前台表单验证
2.收集表单输入数据【antd的form组件说它都能做到】
 */

/*
async和await
1.作用？
  (具体)简化promise对象的使用，不用再使用then()来指定成功/失败的回调函数
  (抽象)以同步编码方式(没有回调函数了)实现异步流程
2.哪里写await？
  再返回promise的表达式左侧写await：不想要promise，想要promise异步执行的成功的value数据
3.哪里写async？
  await所在函数（最近）定义的左侧写async
 */
