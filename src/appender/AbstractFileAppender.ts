import {Appender} from "../model/Appender";
import * as path from "path";
import * as fs from "fs";
import {AbstractQueueStreamAppender} from "./AbstractQueueStreamAppender";
interface IFileAppenderExt {
    "fileNamePattern": string;
    // "maxHistory?": number;
    // 单个文件的最大写入大小  kb mb gb 不设置则不限制
    "maxFileSize"?: string;
    // 保留几天的文件 从0开始的正整数  不传则不清除
    "holdDay"?: number;

}
export abstract class AbstractFileAppender extends AbstractQueueStreamAppender {
    protected appender: Appender;
    protected maxFileSize: number;
    protected fileNamePattern: string;
    protected holdDay: number;
    constructor(appender: Appender, rootDir?: string) {
        super(appender, rootDir);
        this.appender = appender;
        if (!appender.appenderExt) {
            throw new Error(`appenderName(${appender.name}) not found appenderExt`);
        }
        const appenderExt = appender.appenderExt as IFileAppenderExt;
        if (!appenderExt.fileNamePattern) {
            throw new Error(`appenderName(${appender.name}).appenderExt.fileNamePattern is null`);
        }
        if (appenderExt.holdDay !== undefined && appenderExt.holdDay !== null) {
            if (!Number.isInteger(+appenderExt.holdDay)) {
                throw new Error(`appenderName(${appender.name}).appenderExt.holdDay must int`);
            }
            if (+appenderExt.holdDay < 0) {
                throw new Error(`appenderName(${appender.name}).appenderExt.holdDay must gte 0`);
            }
            this.holdDay = +appenderExt.holdDay
        }
        this.fileNamePattern = path.join(appenderExt.fileNamePattern.replace(/^@/, rootDir + "/"));
        try {
            let stats = fs.statSync(path.dirname(this.fileNamePattern));
            this.isCanWrite = stats.isDirectory()
        }catch (e) {
            this.isCanWrite = false;
        }
        // 检查maxFileSize是否正确
        if (appenderExt.maxFileSize) {
            const unit = appenderExt.maxFileSize.slice(appenderExt.maxFileSize.length - 2);
            if (["KB", "MB", "GB"].indexOf(unit) === -1) {
                throw new Error(`appenderExt.maxFileSize(${appenderExt.maxFileSize}) unit error,(MB, KB, GB)`);
            }
            const num = +appenderExt.maxFileSize.slice(0, appenderExt.maxFileSize.length - 2);
            if (isNaN(num)) {
                throw new Error(`appenderExt.maxFileSize(${appenderExt.maxFileSize}) error, example 100MB`);
            }
            if (unit === "MB") {
                this.maxFileSize = num * 1024 * 1024;
            } else if (unit === "GB") {
                this.maxFileSize = num * 1024 * 1024 * 1024;
            } else {
                this.maxFileSize = num * 1024;
            }
        }
    }



}
