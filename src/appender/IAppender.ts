/**
 *
 * 功能描述:
 *
 * @className IAppender
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/26 12:34
 */
export interface IAppender {
    write(data: string): void;
}
