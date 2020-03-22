// vue的构造函数，定义一个类，用于创建vue实例
class Vue{
  // 构造器
  constructor(options = {}){
    // options = options || {}
    // 给vue实例增加属性
    this.$el = options.el
    this.$data= options.data
    this.$methods = options.methods

    //  如果指定了el参数，对el进行解析
    if(this.$el){
      // compile负责解析模板的内容
      // 需要：模板和数据
      // 数据：将整个vue实例传递过去，为了防止以后在vue中创建其他的属性
      var c = new Compile(this.$el,this)
      
    }

  }
}