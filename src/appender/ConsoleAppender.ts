/**
 *
 * 功能描述:
 *
 * @className ConsoleAppender
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/26 9:56
 */
import {IAppender} from "./IAppender";
import * as fs from "fs";
import {Appender} from "../model/Appender";
import {AbstractQueueStreamAppender} from "./AbstractQueueStreamAppender";

export class ConsoleAppender extends AbstractQueueStreamAppender {
    private appender: Appender;
    private is
    constructor(appender: Appender) {
        super(appender)
        this.appender = appender;
        this.isCanWrite = true;
        this.emit(ConsoleAppender.eventStreamChangeName, process.stdout);
    }
    private onStartWrite(bufLength: number) {
    }

}
