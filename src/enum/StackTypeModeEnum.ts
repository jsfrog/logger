/**
 *
 * 功能描述:
 * c:自定义类,o:Object 包含c,f:方法包含了t和s, t:构造方法,s:静态方法,p:工厂模式的方法
 * n:没有,h:有,a:匿名
 * n:正常模式 s: 工厂模式,p:原型模式,o:其他
 * @className StackTypeModeEnum
 * @projectName logger
 * @author yanshaowen
 * @date 2018/12/20 20:54
 * 1 n.no.nf: 如第一种  ''
 * 2 n.ho.af: 如第二种  Object.<anonymous>
 * 3 n.no.hf: 如第三种  func
 * 4 n.ho.hf: 如第四种  Object.func2
 * 5 n.hc.ht: 如第五种  new A
 * 6 n.nc.hs: 如第五种  Function.func4
 * 7 n.hc.hs: 如第五、六种  A.func5 or Person.func7 [as func6]
 * 8 s.ho.hp: 如第七种 Object.child.func9
 * 9 p.hc.hp: 如第八种 Function.Pop.func21
 * 10 other:  其他
 */
export enum StackTypeModeEnum {
    NONE = "n.no.nf",
    OBJECT_ANONYMOUS = "n.ho.af",
    FUNCTION = "n.no.hf",
    OBJECT_FUNCTION = "n.ho.hf",
    CLASS = "n.hc.ht",
    FUNCTION_FUNCTION = "n.nc.hs",
    CLASS_FUNCTION = "n.hc.hs",
    OBJECT_DOUBLE_FUNCTION = "s.ho.hp",
    FUNCTION_PROTOTYPE_FUNCTION = "p.hc.hp",
    OBJECT = "o",
}
