//
// 从堆栈提取错误文件的列表
// 1:匿名函数内直接调用
// 代码：
//      (function () { console.log(new Error())})()
// 输出:
//     at D:\build\node\log4j2-node\test\simple.js:22:17
// at Object.<anonymous> (D:\build\node\log4j2-node\test\simple.js:34:3)
// 2：直接调用
// 代码：
//      console.log(new Error().stack);
// 输出：
//      at Object.<anonymous> (D:\build\node\log4j2-node\test\simple.js:90:13)
// 3: 间接通过函数调用
// 代码：
//      function func() {
//          console.log(new Error());
//      }
// func();
// 输出：
//      at func (D:\build\node\log4j2-node\test\simple.js:38:17)
// at Object.<anonymous> (D:\build\node\log4j2-node\test\simple.js:40:1)
// 4：间接通过对象的静态函数调用
// 代码：
//      const o = {
//          func2() {
//              console.log(new Error());
//          }
//      };
// o.func2();
// 输出：
//      at Object.func2 (D:\build\node\log4j2-node\test\simple.js:50:21)
// at Object.<anonymous> (D:\build\node\log4j2-node\test\simple.js:54:3)
// 5：通过es6类的实例调用和类的静态函数调用
// 代码：
//      class A {
//          constructor(){
//              console.log(new Error());
//          }
//          static func4(){
//              console.log(new Error());
//          }
//          func5(){
//              console.log(new Error());
//          }
//      }
// const a = new A();
// A.func4();
// a.func5();
// 输出：
//      at new A (D:\build\node\log4j2-node\test\stack.js:47:21)
// at Object.<anonymous> (D:\build\node\log4j2-node\test\stack.js:57:11)
// at Function.func4 (D:\build\node\log4j2-node\test\simple.js:63:21)
// at Object.<anonymous> (D:\build\node\log4j2-node\test\simple.js:72:3)
// at A.func5 (D:\build\node\log4j2-node\test\simple.js:66:21)
// at Object.<anonymous> (D:\build\node\log4j2-node\test\simple.js:71:3)
// 6：通过构造函数的实例调用
// 代码：
//      function Person() {
//          this.func6 = func7;
//          this.func8 = func8;
//      }
// function func7() {
//     console.log(new Error());
// }
// function func8() {
//     console.log(new Error());
// }
// new Person('1','2').func6();
// new Person('1','2').func8();
// 输出：
//      at Person.func7 [as func6] (D:\build\node\log4j2-node\test\stack.js:66:17)
// at Object.<anonymous> (D:\build\node\log4j2-node\test\stack.js:71:21)
// at Person.func8 (D:\build\node\log4j2-node\test\stack.js:69:17)
// at Object.<anonymous> (D:\build\node\log4j2-node\test\stack.js:72:21)
// 7：工厂模式调用
// 代码：
//      function child() {
//          const child = {};
//          child.func9 = function () {
//              console.log(new Error());
//          };
//          return child;
//      }
// child().func9();
// 输出：
//      at Object.child.func9 (D:\build\node\log4j2-node\test\stack.js:80:21)
// at Object.<anonymous> (D:\build\node\log4j2-node\test\stack.js:85:9)
// 8：原型链的实例调用和静态调用
// 代码：
//      function Pop(_name,_age) {
//      }
// Pop.prototype.func20 = function () {
//     console.log(new Error());
// };
// Pop.func21 = function () {
//     console.log(new Error());
// };
// new Pop().func20();
// Pop.func21()
// 输出：
//      at Pop.func20 (D:\build\node\log4j2-node\test\stack.js:92:17)
// at Object.<anonymous> (D:\build\node\log4j2-node\test\stack.js:99:11)
// at Function.Pop.func21 (D:\build\node\log4j2-node\test\stack.js:96:17)
// at Object.<anonymous> (D:\build\node\log4j2-node\test\stack.js:100:5)

import * as path from "path";
import { StackTypeModeEnum } from "../enum/StackTypeModeEnum";
import { StackTypePathTypeEnum } from "../enum/StackTypePathTypeEnum";
import { StackType } from "../model/StackType";

/**
 *
 * 功能描述: 堆栈信息解析工具类
 * @className StackAnalysisUtil
 * @projectName logger
 * @author yanshaowen
 * @date 2018/12/20 20:24
 */
export class StackAnalysisUtil {
    /**
     * 获取标准的堆栈信息  执行时间大致为(4-7)ms
     * @param stack         new Error().stack
     * @param pathType      获取指定的堆栈类型 值对应下面的类型 其他值为获取所有所有类型
     * @return              返回的为数组 每个对象包括当前执行的所有堆栈信息
     */
    public static parseStack(stack: string, pathType: StackTypePathTypeEnum): StackType[]  {
        const list = [];
        const trimSurplusRe = /\s+at\s{1,4}/;
        const asFuncRe = /\s\[as\s.*\]/;
        const lineRowRe = /(.*)(:\d+:\d+$)/;
        const stackList = stack.split("\n");
        for (let current of stackList) {
            if (!trimSurplusRe.test(current)) {
                continue;
            }
            const stackType = new StackType();
            stackType.className = "-";
            stackType.methodName = "-";
            stackType.mode = StackTypeModeEnum.OBJECT;
            stackType.file = "";
            stackType.line = 0;
            stackType.row = 0;
            stackType.pathType = StackTypePathTypeEnum.ERROR;
            current = current.replace(trimSurplusRe, "");
            let fileLineRow;
            if (current[current.length - 1] !== ")") {
                stackType.mode = StackTypeModeEnum.NONE;
                fileLineRow = current;
            } else {
                const split = current.split(" (");
                if (split.length !== 2) {
                    continue;
                }
                const o = split[0];
                fileLineRow = split[1].substring(0, split[1].length - 1);

                const a = o.split(".");
                if (a.length === 1) {
                    if (/^new\s/.test(a[0])) {
                        stackType.mode = StackTypeModeEnum.CLASS;
                        stackType.className = a[0].substring(4, a[0].length);
                        stackType.methodName = "constructor";
                    } else {
                        stackType.mode = StackTypeModeEnum.FUNCTION;
                        stackType.methodName = a[0];
                    }
                } else if (a.length === 2) {
                    if (o === "Object.<anonymous>") {
                        stackType.mode = StackTypeModeEnum.OBJECT_ANONYMOUS;
                        stackType.className = "Object";
                    } else if (a[0] === "Object") {
                        stackType.mode = StackTypeModeEnum.OBJECT_FUNCTION;
                        stackType.className = "Object";
                        stackType.methodName = a[1];
                    } else if (a[0] === "Function") {
                        stackType.mode = StackTypeModeEnum.FUNCTION_FUNCTION;
                        stackType.className = "Function";
                        stackType.methodName = a[1];
                    } else {
                        stackType.mode = StackTypeModeEnum.CLASS_FUNCTION;
                        stackType.className = a[0];
                        stackType.methodName = a[1].replace(asFuncRe, "");
                    }

                } else if (a.length === 3) {
                    stackType.mode = a[0] === "Object" ? StackTypeModeEnum.OBJECT_DOUBLE_FUNCTION : StackTypeModeEnum.FUNCTION_PROTOTYPE_FUNCTION;
                    stackType.className = a[1];
                    stackType.methodName = a[2].replace(asFuncRe, "");
                } else {
                    stackType.mode = StackTypeModeEnum.OBJECT;
                }
            }
            const match = fileLineRow.match(lineRowRe);
            if (match && match.length === 3) {
                stackType.file = match[1];
                const split = match[2].split(":");
                stackType.line = isNaN(split[1]) ? 0 : +split[1];
                stackType.row = isNaN(split[2]) ? 0 : +split[2];
                stackType.pathType = path.isAbsolute(stackType.file) ? StackTypePathTypeEnum.LOCAL : StackTypePathTypeEnum.SYSTEM;
            }
            if (pathType === StackTypePathTypeEnum.ALL || stackType.pathType === pathType) {
                list.push(stackType);
            }
        }

        return list;
    }
    public static parseStackAll(stack: string): StackType[] {
        return StackAnalysisUtil.parseStack(stack, StackTypePathTypeEnum.ALL);
    }

}
