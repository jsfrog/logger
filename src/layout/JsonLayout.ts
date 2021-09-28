/**
 *
 * 功能描述: 生成json字符的格式
 * 如: create_time: %date{yyyy-MM-dd HH:mm:ss.SSS}, msg: %msg
 *
 * @className JsonLayout
 * @projectName logger
 * @author yanshaowen
 * @date 2019/3/1 17:46
 */
import {Layout} from "../model/Layout";
import {LogMessage} from "../model/LogMessage";
import {PatternLayoutBase} from "./PatternLayoutBase";

export class JsonLayout extends PatternLayoutBase {
    private static valueStringRe = /%[a-zA-Z_]\w*({.*})*/g;
    private static keyStringRe = /[a-zA-Z_]\w*:\s*%/g;
    constructor(layout: Layout) {
        const kvStrList = layout.pattern.split(",");
        layout.pattern = "";
        let i = 0;
        for (let kvString of kvStrList) {
            kvString = kvString.trim();
            const kvList = kvString.split(":%");
            if (kvList.length === 2) {
                layout.pattern = layout.pattern + `"${kvList[0]}":"%${kvList[1]}"`;
                if (i !== kvStrList.length - 1) {
                    layout.pattern = layout.pattern + ",";
                }
            }
            i++;
        }
        super(layout);
    }
    public toString(logMessage: LogMessage): string {
        return "{" + super.toString(logMessage) + "}\n";
    }
}
