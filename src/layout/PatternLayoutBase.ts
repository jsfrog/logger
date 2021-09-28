import {Layout} from "../model/Layout";
import {ILayout} from "./ILayout";
import {LogMessage} from "../model/LogMessage";
import {DateUtil} from "../util/DateUtil";
import {StringUtil} from "../util/StringUtil";

/**
 *
 * 功能描述: 对日志的匹配和替换
 *
 * @className PatternLayoutBase
 * @projectName logger
 * @author yanshaowen
 * @date 2019/3/4 10:47
 */
export class PatternLayoutBase implements ILayout {
    private readonly pattern: string;
    // 匹配key和参数
    private static variableRe = /%[a-zA-Z_]\w*({.*})*/g;
    private static keyRe = /%([a-zA-Z_]\w*)/;
    private static innerField = new Set<String>(['level', 'startTime', 'stackType', 'data', 'error']);
    constructor(layout: Layout) {
        this.pattern = layout.pattern;
    }
    public toString(logMessage: LogMessage): string {
        try {
            const variables ={
                date: logMessage.startTime,
                level: logMessage.level.name,
                class: logMessage.stackType.className,
                method: logMessage.stackType.methodName,
                file: logMessage.stackType.file,
                line: logMessage.stackType.line,
                row: logMessage.stackType.row,
                msg: logMessage.data,
                n: "\n",
                stack: logMessage.error,
            }
            // 其他自定义的字段
            const fieldList = Object.keys(logMessage);

            for (let field of fieldList) {
                if (!PatternLayoutBase.innerField.has(field)) {
                    variables[field] = logMessage[field];
                }
            }
            return PatternLayoutBase.variableReplace(this.pattern, variables);
        } catch (e) {
            return e.message + e.stack;
        }
    }
    public static getVariableDateConfigStr(str: string){
        const matchList = StringUtil.match(str, PatternLayoutBase.variableRe);
        if (!Array.isArray(matchList) || matchList.length === 0) {
            return null;
        }
        for (let v of matchList) {
            const variableKey = v.value.match(PatternLayoutBase.keyRe)[1];
            if (variableKey === 'date') {
                return v.value.slice(6, v.value.length - 1)
            }
        }
        return null;

    }
    public static variableReplace(str: string, variables: object) {
        const matchList = StringUtil.match(str, PatternLayoutBase.variableRe);
        if (!Array.isArray(matchList) || matchList.length === 0) {
            return str;
        }
        const matchSet = new Set(matchList);
        let msgResult = "";
        let currentIndex = 0;
        let ofI = 0;
        // 上一次循环是否有引号
        let perHasMark = true;
        for (const v of matchSet) {
            ofI ++;

            const variableKey = v.value.match(PatternLayoutBase.keyRe)[1];
            let variableValue = variables[variableKey];
            if (variableKey === "date") {
                const params = v.value.slice(5, v.value.length);
                if (variableValue instanceof Date) {
                    let format = "yyyy-mm-dd HH:mm:ss.S";
                    if (params.length > 0) {
                        const params1 = params.split("}")[0];
                        format = params1.slice(1, params1.length);
                    }
                    variableValue = DateUtil.format(variableValue, format);
                }
            }
            if (variableValue instanceof Error) {
                const values = [];
                Object.keys(variableValue).map((k) => {
                    if (k !== "name") {
                        if (typeof variableValue[k] === "object") {
                            values.push(`${k}:${JSON.stringify(variableValue[k])}`);
                        } else {
                            values.push(`${k}:${variableValue[k]}`);
                        }
                    }
                });
                variableValue = ` ${variableValue.stack}\n${values.toString()} `;
            } else if (variableValue === null || variableValue === undefined) {
                variableValue = null;
            } else if (typeof variableValue === "object" && "toString" in variableValue) {
                variableValue = variableValue.toString();
            }
            if (typeof variableValue === "string" && variableKey !== "n") {
                variableValue = variableValue.replace(/(\r\n)|(\n)/g, "\\n");
            }
            // msgResult += str.substring(currentIndex, v.index);
            if (!perHasMark) {
                currentIndex++;
            }
            if (variableValue === null || variableValue === undefined) {
                perHasMark = false;
                msgResult += str.substring(currentIndex, v.index - 1);
                msgResult += "null";
            } else if (typeof variableValue === "number" || typeof variableValue === "boolean") {
                perHasMark = false;
                msgResult += str.substring(currentIndex, v.index - 1);
                msgResult += variableValue;
            } else {
                perHasMark = true;
                msgResult += str.substring(currentIndex, v.index);
                try {
                    msgResult += variableValue.toString().replace(/[\\]?"/g, "\\\"");
                } catch (e) {
                    msgResult += variableValue;
                }
            }
            currentIndex = v.index + v.value.length;
        }
        if (currentIndex < str.length) {
            if (!perHasMark) {
                currentIndex++;
            }
            msgResult += str.substring(currentIndex, str.length);
        }
        return msgResult;

    }
}
