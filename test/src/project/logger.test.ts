import {Configuration, LoggerFactory} from "../../../src";

class A {
    public toString(): string {
        return "A";
    }
}
import * as path from 'path'
import {promisify} from 'util'
Configuration.configure(require("./logger.json"), path.join(__dirname, '../../../'));
const logger = LoggerFactory.getLogger("geek.logger.test.project.logger");
describe("测试 logger.test", () => {



    it("simple", async () => {
        logger.info("211111")
        logger.trace("111A {}, {}, {}, {}, {}, {}, {}, {}\"222", 1, "sssd", {}, new A(), true, null, JSON.stringify({"a": "1"}));
        logger.info("B111\n333\n");
        logger.error("C1112, [{}]", new Error("11"), 11, 223, 44);

    });
    it("whileTrue", async () => {
        while (true) {
            await promisify(setTimeout)(10);
            console.log('22222222222')
            logger.info("211111")
            logger.trace("111A {}, {}, {}, {}, {}, {}, {}, {}\"222", 1, "sssd", {}, new A(), true, null, JSON.stringify({"a": "1"}));
            logger.info("B111\n333\n");
            logger.error("C1112, [{}]", new Error("11"), 11, 223, 44);
        }
    });
    it("for10000", async () => {
        process.nextTick(async () => {
            let i = 0;
            while (true) {
                if (i >= 1000000) {
                    break;
                }
                if (i % 1000 === 0) {
                    console.log('===', i, process.memoryUsage())
                }

                await promisify(setTimeout)(10);
                logger.info(i + '')
                i++;
            }
        })

    });
    it("one-log", async () => {
        logger.info( 'one {} {}', '{}', '{}');
    });
});
