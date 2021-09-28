import {IAppender} from "./IAppender";
import {Appender} from "../model/Appender";
import {WriteStream} from "fs";
import {EventEmitter} from "events";

class BufNode {
    private next: BufNode;
    private buf: Buffer;
    private stream: WriteStream;

    constructor(buf: Buffer, next?: BufNode) {
        this.buf = buf;
        this.next = next || null;
        this.next = null;
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
        this.stream = undefined;
    }
    public getBuf() {
        return this.buf;
    }
    public setStream(stream: WriteStream) {
        this.stream = stream;
    }
    public getStream(): WriteStream {
        return this.stream;
    }
}
class LinkQueue{
    // 队头
    private front: BufNode;
    // 队尾
    private rear: BufNode;
    // 对列的长度
    private length: number = 0;
    // 流的状态map
    private streamStateMap = new Map<WriteStream, Boolean>();
    // 旧的流的list
    private oldStreamList: WriteStream[] = [];
    // 节点的stream为null的集合
    private nullNodeList: BufNode[] = [];
    constructor() {

    }
    public flush() {
        while (true) {
            const bufNode = this.pop();
            if (!bufNode) {
                break;
            }
            if (!this.streamStateMap.get(bufNode.getStream())) {
                continue;
            }
            const b = bufNode.getStream().write(bufNode.getBuf())
            bufNode.clear()
            if (!b) {
                this.streamStateMap.set(bufNode.getStream(), false)
                break;
            }
        }
    }
    public push(buf: Buffer, stream: WriteStream) {
        let current: BufNode = null;
        let node = new BufNode(buf);
        node.setStream(stream);
        // stream 可能为null
        if (!stream) {
            this.nullNodeList.push(node)
        }
        if(this.length === 0){
            this.length++;
            this.front = this.rear = node;
        }else{
            current = this.rear;
            current.setNext(node);
            this.rear = node;
            this.length++;
        }
        if (this.length >= 1) {
            this.flush();
        }
        return true;
    }
    public pop(): BufNode {
        let current: BufNode = null;
        if(this.length != 0){
            current = this.front;
            if (!this.streamStateMap.get(current.getStream())) {
                return null;
            }
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

    /**
     * 回收旧的流 打开新的流
     * @param oldStream 旧的流
     * @param stream    新的流
     */
    public pipe(oldStream: WriteStream,stream: WriteStream) {
        if (oldStream) {
            this.oldStreamList.push(oldStream);
        }
        // 大于5个就进行回收
        if (this.oldStreamList.length >= 5) {
            const s = this.oldStreamList.shift();
            s.end();
            s.close();
            this.streamStateMap.delete(s);
        }

        this.streamStateMap.set(stream, true);
        if (this.nullNodeList.length > 0) {
            this.nullNodeList.forEach(item => {
                item.setStream(stream);
            });
            this.nullNodeList = [];
        }
        stream.on('drain', (e) => {
            this.streamStateMap.set(stream, false);
        })
        stream.on('close', () => {
            this.streamStateMap.set(stream, false);
        })
    }
}
export abstract class AbstractQueueStreamAppender extends EventEmitter implements IAppender {
    // 当前的可写流
    private stream: WriteStream = null;
    // 事件的名称  开始写入的事件名称
    protected static eventStartWriteName = "startWrite";
    // 事件的名称  输出流变化的事件名称
    protected static eventStreamChangeName = "streamChange";
    private linkQueue: LinkQueue;
    // 是否可以写入
    protected isCanWrite: boolean = false;
    constructor(appender: Appender, rootDir?: string) {
        super()
        this.initListHead();
        this.initOn()
    }

    private initListHead() {
        this.linkQueue = new LinkQueue();
    }
    private initOn() {
        this.on(AbstractQueueStreamAppender.eventStreamChangeName, (stream) => {
            this.linkQueue.pipe(this.stream, stream);
            // 赋值新的流
            this.stream = stream;

            this.linkQueue.flush();
        });
    }

    private toBuffer(data: string): Buffer {
        return Buffer.from(data);
    }

    public write(data: string) {
        if (this.isCanWrite) {
            const buffer = this.toBuffer(data);
            this.emit(AbstractQueueStreamAppender.eventStartWriteName, buffer.length);
            // 注意 this.stream可能为null 后面处理了
            this.linkQueue.push(buffer, this.stream);
        }

    }
    private onStreamChange(stream) {
        this.stream = stream;
    }
}
