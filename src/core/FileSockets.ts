import * as fs from "fs";
import * as path from "path";
import {FileUtil} from "../util/FileUtil";

/**
 *
 * 功能描述:
 *
 * @className FileSockets
 * @projectName logger
 * @author yanshaowen
 * @date 2019/3/4 20:41
 */
export class FileSockets {
    private static fileSocket: Map<string, number> = new Map<string, number>();
    private static aliasFileName: Map<string, string[]> = new Map<string, string[]>();
    private static normalRe = /.*\.log$/;
    private static aliasRe = /.*\.\d+\.log$/;
    private static aliasClearRe = /\.\d+\.log$/;
    /**
     * 方法功能描述: 打开文件
     * @author yanshaowen
     * @date 2019/3/4 20:43
     * @param filePath  对应的文件路径
     * @return
     */
    public static openFile(filePath: string) {
        const fd = fs.openSync(filePath, "a+");
        FileSockets.fileSocket.set(filePath, fd);
        return fd;
    }
    /**
     * 方法功能描述: 打开别名文件
     * @author yanshaowen
     * @date 2019/3/4 20:43
     * @param filePath  对应的文件路径
     * @return
     */
    public static openAliasFile(filePath: string) {
        if (!FileSockets.aliasFileName.has(filePath)) {
            FileSockets.aliasFileName.set(filePath, []);
        }
        const list = FileSockets.aliasFileName.get(filePath);
        let nextFilePath: string = filePath.slice(0, filePath.length - 4);
        if (list.length > 0) {
            const alias = list[list.length - 1];
            const strings = alias.split(".");
            const num = +strings[strings.length - 2];
            if (isNaN(num)) {
                nextFilePath = nextFilePath + ".1";
            } else {
                nextFilePath = nextFilePath + "." + (num + 1);
            }
        } else {
            nextFilePath = nextFilePath + ".1";
        }
        nextFilePath += ".log";
        list.push(nextFilePath);
        FileSockets.aliasFileName.set(filePath, list);
        const fd = fs.openSync(nextFilePath, "a+");
        FileSockets.fileSocket.delete(filePath);
        FileSockets.fileSocket.set(nextFilePath, fd);
        return fd;
    }
    /**
     * 方法功能描述: 关闭文件
     * @author yanshaowen
     * @date 2019/3/4 20:43
     * @param filePath  对应的文件路径
     * @return
     */
    public static closeFile(filePath: string) {
        fs.closeSync(FileSockets.fileSocket.get(filePath));
        FileSockets.fileSocket.delete(filePath);
    }
    public static getAliasOrOrigin(filePath: string): object {
        if (FileSockets.aliasFileName.has(filePath) && FileSockets.aliasFileName.get(filePath).length > 0) {
            const alias = FileSockets.aliasFileName.get(filePath);
            return {fd: FileSockets.fileSocket.get(alias[alias.length - 1]), filePath: alias[alias.length - 1]};
        } else {
            return {fd: FileSockets.fileSocket.get(filePath), filePath};
        }
    }
    public static loadDir(dir: string) {
        // 获取目录下的文件名称
        const files = FileUtil.loadDirFiles(dir);
        const currentDir = new Map<string, string[]>();
        files.forEach((f) => {
            if (FileSockets.aliasRe.test(f)) {
                const originFile = f.replace(FileSockets.aliasClearRe, ".log");
                if (!currentDir.has(originFile)) {
                    currentDir.set(originFile, [f]);
                } else {
                    currentDir.get(originFile).push(f);
                }
            } else if (FileSockets.normalRe.test(f)) {
                if (!currentDir.has(f)) {
                    currentDir.set(f, []);
                }
            }
        });
        // 合并currentDir 至fileSocket和aliasFileName
        currentDir.forEach((v, k) => {
            const realFile = v.length > 0 ? v[v.length - 1] : k;
            if (!FileSockets.fileSocket.has(realFile)) {
                FileSockets.openFile(realFile);
            }
            if (!FileSockets.aliasFileName.has(k)) {
                FileSockets.aliasFileName.set(k, []);
            }
            // 加载别名文件
            v.forEach((alias) => {
                if (FileSockets.aliasFileName.get(k).indexOf(alias) === -1) {
                    FileSockets.aliasFileName.get(k).push(alias);
                }
            });
        });

    }
}
