import {StringUtil} from "../../../src/util/StringUtil";
describe("测试 StringUtil.test", () => {
    it("match", async () => {
        // 11 47 64
        const iRegExpMatchObjects = StringUtil.match("createTime:%date{yyyy-MM-dd HH:mm:ss.S}, level:%level,className:%class,methodName:%method,line:%line,row:%row,message:%msg,file:%file,error:%error,error:%error", /%[a-zA-Z_]\w*({.*})*/g);
        console.log(iRegExpMatchObjects);
    });
});
