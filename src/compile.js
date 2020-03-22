// 定义一个类，专门负责解析模板内容
class Compile {
  // 参数1：模板
  // 参数2：vue实例
  constructor(el,vm) {
    // 如果el传递过来为字符串就获取DOM元素，如果传过来为对象则传递的就为DOM对象
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    this.vm = vm
    // console.log(this.vm);

    // 编译模板
    if(this.el) {
      // 1. 把el中所有的子节点都放入到内存中，fragment
      let fragment = this.node2fragment(this.el)
      // 2. 在内存中编译fragment,编译插值表达式和指令
      this.compile(fragment)
      // 3. 把fragment一次性添加到页面中
      this.el.appendChild(fragment)
    }
  }
  // 核心模块
  // 把节点转成代码片段
  node2fragment(node) {
    let fragment = document.createDocumentFragment()

    // 把el中所有的子节点挨个添加到文档碎片中
    let childNodes = node.childNodes
    this.toArray(childNodes).forEach(node => {
      // 把所有的子节点添加到fragment中
      fragment.appendChild(node)
    })
    return fragment
   }

  //  编译内存中的文档碎片
  compile(fragment) {
    let childrenNodes = fragment.childNodes
    this.toArray(childrenNodes).forEach(node => {
      // 编译子节点
      if(this.isElementNode(node)){
        // 如果是元素，需要解析指令
        this.compileElement(node)
      }
      if(this.isTextNode(node)) {
        // 如果是文本节点，需要解析插值表达式
        this.compileText(node)
      }
      // 如果当前节点还有子节点，需要递归解析
      if(node.childNodes && node.childNodes.length > 0) {
        // 如果当前节点有子节点，重新调用compile,编译文档碎片
        this.compile(node)
      }
    })
  }


  // 解析html标签
  compileElement(node) {
    // 1-获取到当前节点下所有的属性
    let attributes = node.attributes
    // console.log(attributes);
    this.toArray(attributes).forEach(attr => {
      // 2-解析vue指令（所有以v-开头的属性
      let attrName = attr.name
      if(this.isDirective(attrName)){
        // 获取指令的类型以及指令的值
        let type = attrName.slice(2)
        let expr = attr.value
        // 如果是v-text指令
        // if(type === 'text') {
        //   node.textContent = this.vm.$data[expr]
        //   // node.innerText = this.vm.$data[expr]
        // }
        // 如果是v-html指令
        // if(type === 'html') {
        //   node.innerHTML = this.vm.$data[expr]
        // }
        // 如果是v-model指令
        // if(type === 'model') {
        //   node.value = this.vm.$data[expr]
        // }
        // 如果是v-on指令
        if(this.isEventDirective(type)){
          CompileUtil['eventHandel'](node,this.vm,type,expr)
        }else {
          // CompileUtil[type]是为了防止在标签中传的指令在CompileUtil报错
          CompileUtil[type] && CompileUtil[type](node,this.vm,expr)
        }
      }
    })
  }
  // 解析text文本节点
  compileText(node) {
    // 节点的文本内容
    CompileUtil.musttache(node,this.vm)
    
  }
  // 工具方法
  toArray(likeArray) {
    return [].slice.call(likeArray)
  }
  isElementNode(node){
    // nodeType:节点的类型 1：元素类型  3：文本节点
    return node.nodeType === 1
  }
  isTextNode(node){
    return node.nodeType === 3
  }
  // 判断是否是一个指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  // 是否是事件指令
  isEventDirective(type) {
    return type.split(':')[0] === 'on'
  }
}
// 解析标签工具，将compileElement的判断语句简化封装
let CompileUtil = {
  // 处理文本节点
  musttache(node,vm){
    let txt = node.textContent
    let reg = /\{\{(.+)\}\}/
    if(reg.test(txt)) {
      let expr = RegExp.$1
      // node.textContent = txt.replace(reg,vm.$data[expr])
      node.textContent = txt.replace(reg,this.getVMValue(vm,expr))
    }
  },
  text(node,vm,expr) {
    node.textContent = this.getVMValue(vm,expr)
  },
  html(node,vm,expr) {
    node.innerHTML = this.getVMValue(vm,expr)
  },
  model(node,vm,expr){
    node.value = this.getVMValue(vm,expr)
  },
  eventHandel(node,vm,type,expr) {
    let eventType = type.split(':')[1]
    let fn = vm.$methods && vm.$methods[expr]
    if(eventType && fn) {
      node.addEventListener(eventType,vm.$methods[expr].bind(vm))
    }
  },
  // 这个方法用于获取vm中的数据
  getVMValue(vm,expr) {
    let data = vm.$data
    console.log(expr.split('.'))
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data
  }
}