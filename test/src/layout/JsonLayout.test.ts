import {PatternLayout} from "../../../src/layout/PatternLayout";
import {LogMessage} from "../../../src/model/LogMessage";
import {Level} from "../../../src/model/Level";
import {StackAnalysisUtil} from "../../../src/util/StackAnalysisUtil";
import { assert, expect } from "chai";
import {JsonLayout} from "../../../src";

const DEBUG_LEVEL = new Level();
DEBUG_LEVEL.code = 10000;
DEBUG_LEVEL.name = "DEBUG";
DEBUG_LEVEL.colour = "cyan";
describe("测试 PatternLayout.test", () => {
    it("toString", async () => {
        const jsonLayout = new JsonLayout({pattern: "create_time: %date{yyyy-MM-dd HH:mm:ss.S}", class: "JsonLayout"});
        const message = new LogMessage();
        message.data = "11";
        message.level = DEBUG_LEVEL;
        message.startTime = new Date("2019-02-27 20:14:22.111");
        message.stackType = StackAnalysisUtil.parseStackAll(new Error().stack)[0];
        expect(jsonLayout.toString(message)).to.equal("{\"create_time\":\"2019-02-27 20:14:22.111\"}");
    });
});
