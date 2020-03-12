import React from 'react'

import './index.less'

/*
外形像连接的按钮
 */

export default function LinkButton (props) {
  return <button {...props} className="link-button"></button>
  /*去用react插件看一下，button会接受通过属性传过来的onClick，和标签体传过来的children，
                                       children就是用来去接收这个标签的子节点 */
}