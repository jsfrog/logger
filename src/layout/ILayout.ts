/**
 *
 * 功能描述:
 *
 * @className ILayout
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/26 12:46
 */
import {LogMessage} from "../model/LogMessage";

export interface ILayout {

    toString(logMessage: LogMessage): string;
}
