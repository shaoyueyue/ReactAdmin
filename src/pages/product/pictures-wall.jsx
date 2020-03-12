import React from 'react'
import PropTypes from 'prop-types'
import { Upload,Icon,Modal,message } from 'antd';  //上传    再说一遍这些都是组件

import {reqDeleteImg} from '../../api'
import {BASE_IMG_URL} from '../../utils/constants'

/*
用于图片上传的组件
 */
export default class PicturesWall extends React.Component {

  static propTypes = {
    imgs:PropTypes.array
  }

 /* state = {
    previewVisible: false, //标识是否显示大图预览Modal
    previewImage: '', //大图的url
    fileList: [
      /!*{
        uid: '-1',  //每个file都有自己唯一的id
        name: 'xxx.png',//图片文件名
        status: 'done',//图片状态：done-已上传  状态有：uploading：正在上传中 done error removed：已删除
        url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',//图片地址
      },*!/
    ],
  }*/

  /*问题分析：在讨论传入的imgs属性相关问题时，那这个地方就说上面的state里的fileList属性一定是一个空数组嘛，不一定吧，
  * 如果我的imgs有值你是不是要根据我这个生成一个有好多file对象的数组啊（imgs不是让你初始显示的嘛，初始显示就看你的
  * fileList有没有值，你数组里面是空的它不会显示效果），所以这样直接设置实例对象的属性已经不对了。比较适合的是用
  * constructor()去写，因为constructor这种写法，它可以做一些事情，去指定初始状态*/
  constructor(props) {
    super(props)
    let fileList = []

    //如果传入imgs属性
    const {imgs} = this.props
    if(imgs && imgs.length>0){
      fileList = imgs.map((img,index) => ({
        uid: -index, //每个file都有自己唯一的id
        name: img, //图片文件名
        status: 'done', //图片状态：done-已上传  状态有：uploading：正在上传中 done error removed：已删除
        url:BASE_IMG_URL + img //图片地址
      }))
    }

    //初始化状态
    this.state={
      previewVisible: false, //标识是否显示大图预览Modal
      previewImage: '', //大图的url
      fileList  //所有以上传图片的数组
    }
  }


  /*
  获取所有已上传图片文件名的数组
   */
  getImgs = () => {
    return this.state.fileList.map(file => file.name)
  }

  /*
  隐藏Modal
   */
  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    //显示指定file对应的大图
    console.log('handlePreview()',file)
    this.setState({
      previewImage:file.url || file.thumbUrl,  /*file.thumbUrl是针对状态不是done的文件，你上传的时候会添加这个属性thumbUrl，
                                                  这个值它指定为，对应的就是那一张图片的base64编码的串,因为上传是一个过程*/
      previewVisible:true,
    })
  };

  /*
   fileList:所有已上传图片文件对象的数组
   file:当前操作的图片文件（上传/删除）
  */
  handleChange = async ({ file,fileList }) => {//-----是一个过程的状态监视。
                                         // 用来监视‘我目前内存形成的界面中的’文件发生改变的监听，根据相应文件的变化使对应信息合理
    console.log('handleChange()',file.status,fileList.length,file===fileList[fileList.length-1])//这个打印很重要，知道你有什么数据

    //一旦上传成功，将当前上传的file的信息修正(name.url)
    if(file.status==='done'){
      const result = file.response  //{status：0，data:{name:'xxx.jpg',url:'图片地址'}}
      if(result.status===0){
        message.success('图片上传成功')
        const {name,url} = result.data
        file = fileList[fileList.length-1]
        file.name = name
        file.url = url
      }else{
        message.error('图片上传失败')
      }
    }else if (file.status==='removed') {//删除图片
      const result = await reqDeleteImg(file.name)
      if(result.status===0){
        message.success('删除图片成功')
      }else{
        message.error('删除图片失败')
      }
    }
    //在操作（上传/删除）过程中更新fileList状态：（如果一直不更新，状态是不是老是只有一个元素【也就是fileList，你不更新嘛
    // 那不就是本来就是原来的代码不变嘛】，所以上传过程中是不是要对他界面不断的更新，让组件得到渲染）
    this.setState({ fileList })
  };

  render() {
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus"/>
        <div>Upload</div>
      </div>
    );
    return (
      <div>
        <Upload
          action="/manage/img/upload" /*上传图片的接口地址*/
          accept="image/*"  /*只接收图片格式*/
          name="image" /*请求参数名*/
          listType="picture-card"  /*上传文件显示的样式，“picture-card”是卡片样式*/
          fileList={fileList}  /*fileList指定所有已上传图片文件对象的数组*/
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          >
          {fileList.length >= 3 ? null : uploadButton}
        </Upload>

        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}
