/**
 *
 * 功能描述: 字符串工具类
 *
 * @className StringUtil
 * @projectName logger
 * @author yanshaowen
 * @date 2018/12/24 12:51
 */
interface IRegExpMatchObject {
    value: string;
    index: number;
}
export class StringUtil {
    /**
     * 方法功能描述: 判断是否为null或undefined
     * @author yanshaowen
     * @date 2018/12/24 13:00
     * @param str       字符串
     * @return boolean
     */
    public static isEmpty(str: string): boolean {
        return str === null || str === undefined;
    }
    /**
     * 方法功能描述: 判断是否不为null或undefined
     * @author yanshaowen
     * @date 2018/12/24 13:00
     * @param str       字符串
     * @return boolean
     */
    public static isNotEmpty(str: string): boolean {
        return !StringUtil.isEmpty(str);
    }
    /**
     * 方法功能描述: 判断是否为全为空格或者null undefined
     *
     * @author yanshaowen
     * @date 2018/12/24 13:00
     * @param str       字符串
     * @return boolean
     */
    public static isBank(str: string): boolean {
        if (str !== null && str !== undefined) {
            if (str.trim().length > 0) {
                return false;
            }
        }
        return true;
    }
    /**
     * 方法功能描述: 判断是否不为全为空格或者null undefined
     * @author yanshaowen
     * @date 2018/12/24 13:00
     * @param str       字符串
     * @return boolean
     */
    public static isNotBank(str: string): boolean {
        return !StringUtil.isBank(str);
    }
    /**
     * 方法功能描述: 找到对应的匹配值和对应的下标
     * @author yanshaowen
     * @date 2018/12/24 13:00
     * @param str        字符串
     * @param re         匹配
     * @return boolean
     */
    public static match(str: string, re: string | RegExp): IRegExpMatchObject[] | null {
        const matchArray = str.match(re);
        if (!matchArray) {
            return null;
        }
        const result: IRegExpMatchObject[] = [];
        let sourceIndex = 0;
        let matchStr = str;

        matchArray.forEach((value) => {
            const index = matchStr.indexOf(value);
            if (index !== -1) {
                result.push({
                    value,
                    index: sourceIndex + index,
                });
                sourceIndex += index + value.length;
                matchStr = str.substring(sourceIndex);
            }
        });
        return result;
    }
}
