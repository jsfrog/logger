/**
 *
 * 功能描述:
 *
 * @className Config
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/25 15:53
 */
import {Appender} from "./Appender";
import {Root} from "./Root";
import {Logger} from "./Logger";

export class Config {
    // 输出出口
    public appenders: Appender[];
    // 父级配置
    public root: Root;
    // 指定的记录器
    public loggers: Logger[];
}
