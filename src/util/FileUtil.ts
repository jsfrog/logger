/**
 *
 * 功能描述:
 *
 * @className FileUtil
 * @projectName logger
 * @author yanshaowen
 * @date 2019/1/3 13:07
 */
import * as fs from "fs";
import * as path from "path";
export class FileUtil {
    /**
     *
     * @param startPath  起始目录文件夹路径
     * @returns {Array}
     */
    public static loadDirFiles(startPath: string): string[] {
        const result: string[] = [];
        function finder(p) {
            let files;
            try {
                files  = fs.readdirSync(p);
            } catch (e) {
            }
            if (files) {
                files.forEach((val, index) => {
                    const fPath = path.join(p, val);
                    const stats = fs.statSync(fPath);
                    if (stats.isDirectory()) { finder(fPath); }
                    if (stats.isFile()) { result.push(path.resolve(fPath)); }
                });
            }
        }

        finder(startPath);
        return result;
    }

    /**
     * 方法功能描述: 查找包括自己的所有父级路径
     * @author yanshaowen
     * @date 2019/1/22 20:32
     * @param source    原始路径
     * @return          路径列表
     */
    public static findParents(source: string) {
        const arr: string[] = [];
        function func(current) {
            arr.push(current);
            current = path.join(current);
            const parent = path.resolve(current, "..");
            if (parent !== current) {
                func(parent);
            }
        }
        func(source);
        return arr;
    }
}
