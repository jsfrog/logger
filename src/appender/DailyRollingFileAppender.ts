import {Appender} from "../model/Appender";
import * as fs from "fs";
import * as path from "path";
import {AbstractFileAppender} from "./AbstractFileAppender";
import {PatternLayoutBase} from "../layout/PatternLayoutBase";
import {DateUtil} from "../util/DateUtil";
import { readdir, stat, unlink } from 'fs/promises';

/**
 *
 * 功能描述: 按日期分隔记录至本地
 *
 * @className DailyRollingFileAppender
 * @projectName logger
 * @author yanshaowen
 * @date 2019/3/4 10:42
 */
export class DailyRollingFileAppender extends AbstractFileAppender{
    // 当前文件的日期
    private currentDate: string;
    // 文件名称的时间格式  如yyyy-MM-dd
    private variableDateConfigStr: string;
    // 当前写入的总大小 单位: 字节
    private currentSize: number = 0;
    // 当前名称的下标
    private currentNameIndex: number = -1;

    constructor(appender: Appender, rootDir?: string) {
        super(appender, rootDir);
        this.variableDateConfigStr = PatternLayoutBase.getVariableDateConfigStr(this.fileNamePattern);
        if (!this.variableDateConfigStr) {
            throw new Error('fileNamePattern error. example: %date{yyyy-DD-mm}');
        }
        this.on(DailyRollingFileAppender.eventStartWriteName, this.onStartWrite);
    }
    private onStartWrite(bufLength: number) {
        this.currentSize = this.currentSize + bufLength;
        const nowDate = new Date();
        const now = DateUtil.format(nowDate, this.variableDateConfigStr);
        // 是否需要刷新名称
        let isRefreshName = false;
        // 配置了单个文件 最大限制 并且超过了
        if (this.maxFileSize && this.currentSize >= this.maxFileSize) {
            isRefreshName = true;
        }
        if (this.currentDate !== now) {
            isRefreshName = true;
            this.currentNameIndex = -1;
        }

        if (isRefreshName) {
            this.currentSize = 0;
            let originFilePath = PatternLayoutBase.variableReplace(this.fileNamePattern, {
                date: nowDate,
            });
            this.currentNameIndex++;
            if (this.currentNameIndex > 0) {
                // .log
                const ex = path.extname(originFilePath);
                // /a/b/xxx
                const removeEx = originFilePath.substring(0, originFilePath.length - ex.length);
                originFilePath = removeEx + '-' + this.currentNameIndex + ex;
            }
            let writeStream = fs.createWriteStream(originFilePath, {
                flags: 'a',
                // 设置10Mb的写缓冲
                highWaterMark: 10 * 1024 * 1024
            });
            this.currentDate = now;
            this.asyncClearOldLogFile();
            this.emit(DailyRollingFileAppender.eventStreamChangeName, writeStream);
        }

    }
    private asyncClearOldLogFile() {
        // 清除之前的日志
        if (this.holdDay !== null && this.holdDay !== undefined) {
            setTimeout(async () => {
                const dir = path.dirname(this.fileNamePattern);
                let nowTime = new Date().getTime();
                const fileList = await readdir(dir);
                for (let fileName of fileList) {
                    const filePath = path.join(dir, fileName);
                    const fileState = await stat(filePath);
                    let fileTime = Math.floor(fileState.ctimeMs);
                    const diffMs = nowTime - fileTime;
                    const diffDay = Math.floor(diffMs / 86400000);
                    if (diffDay > this.holdDay) {
                        await unlink(filePath);
                    }
                }
            }, 100)
        }


    }

}
