/**
 *
 * 功能描述:
 *
 * @className Root
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/26 13:19
 */
import {AppenderRef} from "./AppenderRef";

export class Root {
    public level: string;
    public appenderRefs: AppenderRef[];
}
