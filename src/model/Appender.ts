/**
 *
 * 功能描述:
 *
 * @className Appender
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/25 15:54
 */
import {Layout} from "./Layout";
import {IAppender} from "../appender/IAppender";
import {ILayout} from "../layout/ILayout";

export class Appender {
    public name: string;
    public class: string;
    public layout: Layout;
    public classObject: IAppender;
    public layoutObject: ILayout;
    public appenderExt: object;
}
