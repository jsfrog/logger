import { StackTypeModeEnum } from "../enum/StackTypeModeEnum";
import { StackTypePathTypeEnum } from "../enum/StackTypePathTypeEnum";
/**
 *
 * 功能描述: stack类型对象
 *
 * @className StackType
 * @projectName logger
 * @author yanshaowen
 * @date 2018/12/20 20:45
 */
export class StackType {
    // 类名
    public className: string;
    // 方法名
    public methodName: string;
    // 执行的文件路径
    public file: string;
    // 执行的所属文件行数
    public line: number;
    // 执行的所属文件的列数
    public row: number;
    // 堆栈类型 error:解析错误的信息 通常不会有,local:所属文件的为本地文件 system:所属文件的为系统文件
    public pathType: StackTypePathTypeEnum;
    // 堆栈源信息
    public source: string;
    // 模式
    public mode: StackTypeModeEnum;
}
