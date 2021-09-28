/**
 *
 * 功能描述: 简单的记录器
 *
 * @className SimpleLayout
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/28 13:17
 */
import {ILayout} from "./ILayout";
import {LogMessage} from "../model/LogMessage";
import {Layout} from "../model/Layout";

export class SimpleLayout implements ILayout {
    private pattern: string;
    constructor(layout: Layout) {
        this.pattern = layout.pattern;
    }
    public toString(logMessage: LogMessage): string {
        return logMessage.data;
    }
}
