import * as path from "path";
import {FileSockets} from "../../../src/core/FileSockets";
import * as fs from "fs";
import {Duplex} from "stream";
import {WriteStream} from "fs";
import {DailyRollingFileAppender} from "../../../src/appender/DailyRollingFileAppender";
import {readdir, stat} from "fs/promises";

describe("测试 RollingFileAppender.test", () => {
    it("write", async () => {
        new DailyRollingFileAppender({
            name: "APPLICATION",
            class: "RollingFileAppender",
            layout: {
                class: "JsonLayout",
                pattern: "create_time: %date",
            },
            appenderExt: {
                fileNamePattern: "@logs/application/application-%date{yyyy-MM-dd}",
                maxFileSize: "100KB",
            }
        } as any).write("444\n");
        new DailyRollingFileAppender({
            name: "APPLICATION",
            class: "RollingFileAppender",
            layout: {
                class: "JsonLayout",
                pattern: "create_time: %date",
            },
            appenderExt: {
                fileNamePattern: "@logs/database/database-%date{yyyy-MM-dd}",
                maxFileSize: "100KB",
                // 保留几天的文件
                holdDay: 0,
            }
        } as any, path.join(__dirname, '../../../')).write("444\n");
    });
    it('test', async() => {
        class BufNode {
            private next: BufNode;
            private buf: Buffer;

            constructor(buf: Buffer, next?: BufNode) {
                this.buf = buf;
                this.next = next || null;
            }

            public setNext(next: BufNode) {
                this.next = next;
            }

            public getNext() {
                return this.next;
            }

            public clear() {
                this.next = undefined;
                this.buf = undefined;
            }
            public getBuf() {
                return this.buf;
            }
        }

        class LinkedList {
            private head: BufNode
            private totalAllocSize: number;
            private size: number;
            private next: BufNode;

            constructor() {
                // this.head = new BufNode(Buffer.alloc(0), null);
                this.totalAllocSize = 0;
                this.size = 0;
            }

            getSize() {
                return this.size;
            }

            getTotalAllocSize() {
                return this.totalAllocSize;
            }

            public append(buf): boolean {
                let node = new BufNode(buf);
                this.next = node;
                if (!this.head) {
                    this.head = node;
                    this.next = node;
                    return true;
                }

                this.size++;
                return true;
            }

            public forEach(cb): void {
                if (!this.head) {
                    return
                }
                let current: BufNode = this.head;
                while (current.getNext()) {
                    current = current.getNext();
                    cb(current)
                }
            }

            public clear() {
                if (!this.head) {
                    return true;
                }
                let current: BufNode = this.head;
                while (current.getNext()) {
                    current.clear();
                    current = current.getNext();
                }
                this.head = undefined;
                return true;
            }
            public unshift() {
                if (!this.head) {
                    return null
                }
                const next = this.head.getNext();
                if (next) {
                    this.head.setNext(next.getNext());
                    return next.getBuf()
                } else {
                    return null;
                }
            }

        }
        class LinkQueue{
            // 队头
            private front: BufNode;
            // 队尾
            private rear: BufNode;
            private length: number = 0;
            private stream: WriteStream;
            private canWriteStream: boolean = false;
            private errorList = [];
            constructor() {

            }
            private flush() {
                while (true) {
                    if (!this.canWriteStream) {
                        break;
                    }
                    const bufNode = this.pop();
                    if (!bufNode) {
                        break;
                    }
                    const b = this.stream.write(bufNode.getBuf())
                    if (!b) {
                        this.canWriteStream = false;
                        this.errorList.push(bufNode.getBuf())
                        break;
                    }
                }
            }
            public push(buf: Buffer) {
                let current: BufNode = null,
                    node = new BufNode(buf);
                if(this.length == 0){
                    this.length++;
                    this.front = this.rear = node;
                }else{
                    current = this.rear;
                    current.setNext(node);
                    this.rear = node;
                    this.length++;
                }
                if (this.length >= 1) {
                    process.nextTick(() => {
                        this.flush();
                    })
                }

                return true;
            }
            public pop(): BufNode {
                let current: BufNode = null;
                if(this.length != 0){
                    current = this.front;
                    this.front = current.getNext();
                    this.length--;
                    return current;
                }else{
                    return null;
                }
            }
            public toString() {
                let str = "",
                    current = this.front;

                while(current){
                    str += current.getBuf().toString() + " ";
                    current = current.getNext();
                }

                return str;
            }
            public pipe(stream: WriteStream) {
                this.stream = stream;
                this.canWriteStream = true;
                this.stream.on('drain', () => {
                    this.canWriteStream = true;
                    this.flush();
                })
                this.stream.on('close', () => {
                    this.canWriteStream = false;
                })
            }
        }

        const stream  = fs.createWriteStream('./1.log', {
            flags: 'a',
            highWaterMark: 1000
        });

        let linkQueue = new LinkQueue();
        linkQueue.pipe(stream);
        for (let i=0; i< 10000;i++) {
            linkQueue.push(Buffer.from(i+ ' '))
        }
        let i = 0
        setInterval(() => {
            console.log(i)
            i++
        }, 1)
    })
    it("writeByStream", async () => {
        const {Duplex} = require('stream');
        class BufDuplex extends Duplex {
            private buf: Buffer = Buffer.alloc(0);

            constructor() {
                super();
            }

            _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
                // console.log(chunk, encoding,)
                this.buf = Buffer.concat([this.buf, chunk]);
                callback(null);
            }

            _read(size: number) {
                console.log(this.buf.length, size)
                // this.buf.re
                if (this.buf.length === 0) {
                    this.push(null);
                    return
                }
                if (this.buf.length < size) {
                    this.push(this.buf.slice());
                    this.buf.fill(0)
                    return
                }

                let buffer = this.buf.slice(0, size - 1);
                this.buf = this.buf.slice(size)
                this.push(buffer);
                return
            }
        }

        // const d1 = new BufDuplex()
        // const d2 = new BufDuplex()
        // for (let i =0 ;i<16384; i++) {
        //     console.log(d1.write(Buffer.from('1111')))
        // }
        // d2.on('finish', () => {
        //     console.log('22222')
        // })
        // d2.on('pipe', () => {
        //     console.log('333')
        // })
        // d1.pipe(d2, {end: true});
        // const c  = Buffer.from('123456').fill();
        // console.log(c.toString(), c.length)


        // console.log(d2.read(1000).toString())


    })

});
// A1<-->A2<-->A3<-->A4
// <-A1
