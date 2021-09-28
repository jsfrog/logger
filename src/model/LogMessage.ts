/**
 *
 * 功能描述: log 消息bean对象
 *
 * @className LogMessage
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/25 17:33
 */
import {Level} from "./Level";
import {StackType} from "./StackType";

export class LogMessage {
    public level: Level;
    public data: string;
    public startTime: Date;
    public pid: number;
    public stackType: StackType;
    public error: Error;
}
