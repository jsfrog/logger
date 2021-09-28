import {DateUtil} from "../../../src/util/DateUtil";
import {expect} from "chai";

describe("测试 DateUtil", () => {
    it("parse", async () => {
        const s = "2019-02-23 11:11:11.000"
        const date = DateUtil.parse(s, "yyyy-MM-dd HH:mm:ss.S");
        expect(new Date(s).toISOString()).to.equals(date.toISOString());
    });
    it("format", async () => {
        const date = new Date("2019-02-23 11:11:11.000");
        const str = DateUtil.format(date, "yyyy-MM-dd HH:mm:ss.S");
        expect(str).to.equals("2019-02-23 11:11:11.000");
    })
})
