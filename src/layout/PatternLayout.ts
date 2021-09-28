/**
 *
 * 功能描述: 格式化日志类
 * %date: 当前的时间 支持格式化输出 如{yyyy-MM-dd HH:mm:ss.SSS}
 * %level: 当前日志的级别
 * %class:     类名称
 * %method:  方法名称
 * %file:       文件路径
 * %line:       行号
 * %row:       列号
 * %msg:        日志文本
 * %n:          换行
 * @className PatternLayout
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/27 9:16
 */
import {LogMessage} from "../model/LogMessage";
import {Layout} from "../model/Layout";
import {PatternLayoutBase} from "./PatternLayoutBase";

export class PatternLayout extends PatternLayoutBase {
    constructor(layout: Layout) {
        super(layout);
    }
    public toString(logMessage: LogMessage): string {
        let errorStack = "";
        if (logMessage.error) {
            errorStack = logMessage.error.stack;
        }
        return super.toString(logMessage) + errorStack;
    }
}
