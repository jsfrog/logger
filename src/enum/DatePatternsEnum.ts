/**
 *
 * 功能描述: 时间格式化对于的占位符号
 *
 * @className DatePatternsEnum
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/22 17:30
 */
export enum DatePatternsEnum {
    PATTERN_ERA = "G",  // Era 标志符 Era strings. For example: "AD" and "BC"
    PATTERN_YEAR = "y",  // 年
    PATTERN_MONTH = "M",  // 月份
    PATTERN_DAY_OF_MONTH = "d",  // 月份的天数
    PATTERN_HOUR_OF_DAY1 = "k",  // 一天中的小时数（1-24）
    PATTERN_HOUR_OF_DAY0 = "H",  // 24小时制，一天中的小时数（0-23）
    PATTERN_MINUTE = "m",  // 小时中的分钟数
    PATTERN_SECOND = "s",  // 秒
    PATTERN_MILLISECOND = "S",  // 毫秒
    PATTERN_DAY_OF_WEEK = "E",  // 一周中对应的星期，如星期一，周一
    PATTERN_DAY_OF_YEAR = "D",  // 一年中的第几天
    PATTERN_DAY_OF_WEEK_IN_MONTH = "F",  // 一月中的第几个星期(会把这个月总共过的天数除以7不够准确，推荐用W)
    PATTERN_WEEK_OF_YEAR = "w",  // 一年中的第几个星期
    PATTERN_WEEK_OF_MONTH = "W",  // 一月中的第几星期(会根据实际情况来算)
    PATTERN_AM_PM = "a",  // 上下午标识
    PATTERN_HOUR1 = "h",  // 12小时制 ，am/pm 中的小时数（1-12）
    PATTERN_HOUR0 = "K",  // 和h类型
    PATTERN_ZONE_NAME = "z",  // 时区名
    PATTERN_ZONE_VALUE = "Z",  // 时区值
    PATTERN_WEEK_YEAR = "Y",  // 和y类型
    PATTERN_ISO_DAY_OF_WEEK = "u",
    PATTERN_ISO_ZONE = "X",
}
