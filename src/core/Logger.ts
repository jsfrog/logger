/**
 *
 * 功能描述:
 *
 * @className Logger
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/25 15:14
 */
import {ILogger} from "./ILogger";
import {LogMessage} from "../model/LogMessage";
import {Level} from "../model/Level";
import {Configuration} from "./Configuration";
import {StackAnalysisUtil} from "../util/StackAnalysisUtil";
import {Logger as LoggerModel} from "../model/Logger";
import {AppenderRef} from "../model/AppenderRef";
import {Appender} from "../model/Appender";
const TRACE_LEVEL = new Level();
TRACE_LEVEL.code = 5000;
TRACE_LEVEL.name = "TRACE";
TRACE_LEVEL.colour = "blue";
const DEBUG_LEVEL = new Level();
DEBUG_LEVEL.code = 10000;
DEBUG_LEVEL.name = "DEBUG";
DEBUG_LEVEL.colour = "cyan";
const INFO_LEVEL = new Level();
INFO_LEVEL.code = 20000;
INFO_LEVEL.name = "INFO";
INFO_LEVEL.colour = "green";
const WARN_LEVEL = new Level();
WARN_LEVEL.code = 30000;
WARN_LEVEL.name = "WARN";
WARN_LEVEL.colour = "yellow";
const ERROR_LEVEL = new Level();
ERROR_LEVEL.code = 40000;
ERROR_LEVEL.name = "ERROR";
ERROR_LEVEL.colour = "red";
const levelCodeMap = new Map<string, number>();
levelCodeMap.set(TRACE_LEVEL.name, TRACE_LEVEL.code);
levelCodeMap.set(DEBUG_LEVEL.name, DEBUG_LEVEL.code);
levelCodeMap.set(INFO_LEVEL.name, INFO_LEVEL.code);
levelCodeMap.set(WARN_LEVEL.name, WARN_LEVEL.code);
levelCodeMap.set(ERROR_LEVEL.name, ERROR_LEVEL.code);

export class Logger implements ILogger {
    public kind: "ILogger";
    public minLevelCode: number;
    private readonly name: string;
    private appendersLevel: Map<string, Appender[]>;
    private loggers: LoggerModel[];
    constructor(name: string) {
        this.name = name;
        const configure = Configuration.getConfigure();
        if (configure) {
            this.loggers = configure.getLoggerByName(name);
            this.initAppendersLevel();
        }
    }
    private initAppendersLevel() {
        this.appendersLevel = new Map<string, Appender[]>();
        for (const levelCode of ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"]) {
            let appenderRefs: AppenderRef[] = [];
            if (this.loggers.length === 0) {
                return;
            }
            for (const logger of this.loggers) {
                if (levelCodeMap.get(levelCode) >= levelCodeMap.get(logger.level) ) {
                    appenderRefs = appenderRefs.concat(logger.appenderRefs);
                }
            }
            const apps = Configuration.getConfigure().getAppendersByRef(appenderRefs);
            this.appendersLevel.set(levelCode, apps);
        }
    }

    public debug(msg: string): void;
    public debug(msg: string, args: any): void;
    public debug(msg: string, ...args: any[]): void;
    public debug(msg: string, e: Error): void;
    public debug(msg: string, ...args: Array<any | Error>): void {
        this.exec(DEBUG_LEVEL, msg, args);
    }

    public error(msg: string): void;
    public error(msg: string, args: any): void;
    public error(msg: string, ...args: any[]): void;
    public error(msg: string, e: Error): void;
    public error(msg: string, ...args: Array<any | Error>): void {
        this.exec(ERROR_LEVEL, msg, args);
    }

    public getName(): string {
        return this.name;
    }

    public info(msg: string): void;
    public info(msg: string, args: any): void;
    public info(msg: string, ...args: any[]): void;
    public info(msg: string, e: Error): void;
    public info(msg: string, ...args: Array<any | Error>): void {
        this.exec(INFO_LEVEL, msg, args);
    }

    public isDebugEnabled(): boolean {
        return false;
    }

    public isErrorEnabled(): boolean {
        return false;
    }

    public isInfoEnabled(): boolean {
        return false;
    }

    public isTraceEnabled(): boolean {
        return false;
    }

    public isWarnEnabled(): boolean {
        return false;
    }

    public trace(msg: string): void;
    public trace(msg: string, args: any): void;
    public trace(msg: string, ...args: any[]): void;
    public trace(msg: string, e: Error): void;
    public trace(msg: string, ...args: Array<any | Error>): void {
        this.exec(TRACE_LEVEL, msg, args);
    }

    public warn(msg: string): void;
    public warn(msg: string, args: Object): void;
    public warn(msg: string, ...args: Object[]): void;
    public warn(msg: string, e: Error): void;
    public warn(msg: string, ...args: Array<Object | Error>): void {
        this.exec(WARN_LEVEL, msg, args);
    }

    protected exec(level: Level, msg: string, args: any[]) {
        if (!this.appendersLevel) {
            return;
        }
        const appenders = this.appendersLevel.get(level.name);
        // build message
        const logMessage = this.buildMessage(level, msg, args);
        appenders.forEach((app) => {
            app.classObject.write(app.layoutObject.toString(logMessage));
        });
    }
    protected buildMessage(level: Level, msg: string, args: any[]):LogMessage {
        const logMessage = new LogMessage();
        logMessage.stackType = StackAnalysisUtil.parseStackAll(new Error().stack)[3];
        logMessage.level = level;
        logMessage.startTime = new Date();
        logMessage.pid = process.pid;
        // logMessage.data = msg;
        if (args[0] instanceof Error) {
            logMessage.error = args[0];
            args.shift();
        }
        // 把{} 替换为对应的值
        const indexResult = Logger.indexes(msg, "{}");
        let msgResult = "";
        let currentIndex = 0;
        indexResult.forEach((index, idx) => {
            let currentArg = "{}";
            if (idx < args.length) {
                currentArg = args[idx];
            }
            msgResult += msg.substring(currentIndex, index);
            if (currentArg === null) {
                msgResult += "null";
            } else if (currentArg === undefined) {
                msgResult += "undefined";
            } else {
                try {
                    msgResult += currentArg.toString();
                } catch (e) {
                    msgResult += currentArg;
                }
            }
            currentIndex = index + 2;
        });
        if (currentIndex < msg.length) {
            msgResult += msg.substring(currentIndex, msg.length);
        }
        logMessage.data = msgResult;
        return logMessage;
    }
    protected static indexes(str, find): number[] {
        const result = [];
        for (let i = 0; i < str.length; ++i) {
            if (str.substring(i, i + find.length) === find) {
                result.push(i);
            }
        }
        return result;
    }
}
