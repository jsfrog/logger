import {PatternLayoutBase} from "../../../src/layout/PatternLayoutBase";
import {LogMessage} from "../../../src/model/LogMessage";
import {Level} from "../../../src/model/Level";
import {StackAnalysisUtil} from "../../../src/util/StackAnalysisUtil";
import { assert, expect } from "chai";

const DEBUG_LEVEL = new Level();
DEBUG_LEVEL.code = 10000;
DEBUG_LEVEL.name = "DEBUG";
DEBUG_LEVEL.colour = "cyan";
describe("测试 PatternLayoutBase.test", () => {
    it("variableReplace1", async () => {
        expect(PatternLayoutBase.variableReplace("logs/application/application-%date{yyyy-MM-dd}", {date: new Date(1610591925166)})).to.equal("logs/application/application-2021-01-14}");
    });
    it("getVariableDateConfigStr1", async () => {
        expect(PatternLayoutBase.getVariableDateConfigStr("@logs/application/application-%date{yyyy-MM-dd}")).to.equal("yyyy-MM-dd");
    });
});
