import {ConsoleAppender} from "../../../src/appender/ConsoleAppender";

describe("测试 ConsoleAppender.test", () => {
    it("write", async () => {
       new ConsoleAppender({} as any).write("11");
    });
});
