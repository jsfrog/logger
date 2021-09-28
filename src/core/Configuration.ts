/**
 *
 * 功能描述:
 *
 * @className Configuration
 * @projectName logger
 * @author yanshaowen
 * @date 2019/2/25 14:50
 */
import {Config} from "../model/Config";
import {Root} from "../model/Root";
import {AppenderRef} from "../model/AppenderRef";
import {Appender} from "../model/Appender";
import {Layout} from "../model/Layout";
import {Logger} from "../model/Logger";
import {IAppender} from "../appender/IAppender";
import {ConsoleAppender} from "../appender/ConsoleAppender";
import {SimpleLayout} from "../layout/SimpleLayout";
import {PatternLayout} from "../layout/PatternLayout";
import {ILayout} from "../layout/ILayout";
import {JsonLayout} from "../layout/JsonLayout";
import {DailyRollingFileAppender} from "../appender/DailyRollingFileAppender";
const defaultConfig: Config = new Config();
const appenderRef = new AppenderRef();
appenderRef.ref = "default";

defaultConfig.root = new Root();
defaultConfig.root.level = "INFO";
defaultConfig.root.appenderRefs = [appenderRef];
const defaultAppender = new  Appender();
defaultAppender.class = "logger.appender.ConsoleAppender";
defaultAppender.name = "default";
defaultAppender.layout = new Layout();
defaultAppender.layout.class = "logger.layout.SimpleLayout";
defaultConfig.appenders = [defaultAppender];

const appenderMaps = new Map<string, new (appender: Appender, rootDir: string) => IAppender>()
    .set("ConsoleAppender", ConsoleAppender)
    .set("DailyRollingFileAppender", DailyRollingFileAppender)
const layoutMaps = new Map<string, new (layout: Layout) => ILayout>()
    .set("SimpleLayout", SimpleLayout)
    .set("PatternLayout", PatternLayout)
    .set("JsonLayout", JsonLayout);
export class Configuration {
    private static configuration: Configuration;
    public config: Config;
    public appenderRealizeMap: Map<string, Appender>;
    private rootLogger: Logger;
    private rootDir: string;
    constructor(config: Config, rootDir?: string) {
        this.config = config;
        this.rootDir = rootDir;
        this.check();
        this.rootLogger = new Logger();
        this.rootLogger.name = "*";
        this.rootLogger.additivity = false;
        this.rootLogger.level = this.config.root.level;
        this.rootLogger.appenderRefs = this.config.root.appenderRefs;
    }
    /**
     * 加载配置 json格式
     */
    public static configure(config: Config, rootDir?: string) {
        if (!config) { config = defaultConfig; }
        Configuration.configuration = new Configuration(config, rootDir);
    }

    public static getConfigure(): Configuration {
        return Configuration.configuration;
    }
    /**
     * 方法功能描述: 检查配置
     * @author yanshaowen
     * @date 2019/3/1 10:17
     * @return
     */
    private check() {
        const prefix = "logger check: ";
        const levels = new Set(["TRACE", "DEBUG", "INFO", "WARN", "ERROR"]);
        this.appenderRealizeMap = new Map<string, Appender>();

        if (this.config.appenders) {
            for (const app of this.config.appenders) {
                if (!app.name) {
                    throw new Error(prefix + "config.appender name is undefined");
                }
                if (!app.class) {
                    throw new Error(prefix + `config.appender(${app.name}) class is undefined`);
                }
                if (!appenderMaps.has(app.class)) {
                    throw new Error(prefix + `config.appender(${app.name}) class not in ["ConsoleAppender"]`);
                } else {
                    const objectType = appenderMaps.get(app.class);
                    app.classObject = new objectType(app, this.rootDir);
                }
                if (!app.layout) {
                    throw new Error(prefix + `config.appender(${app.name}) layout is undefined`);
                }
                if (!layoutMaps.has(app.layout.class)) {
                    throw new Error(prefix + `config.appender(${app.name}) layout not in ["SimpleLayout", "PatternLayout"]`);
                } else {
                    const objectType = layoutMaps.get(app.layout.class);
                    app.layoutObject = new objectType(app.layout);
                }
                this.appenderRealizeMap.set(app.name, app);
            }
        }
        if (!this.config.root) {
            throw new Error(prefix + "not found root");
        }
        if (!this.config.root.appenderRefs || this.config.root.appenderRefs.length === 0) {
            throw new Error(prefix + "root.appenderRefs is empty");
        }
        for (const app of this.config.root.appenderRefs) {
            if (!this.appenderRealizeMap.has(app.ref)) {
                throw new Error(prefix + `root.appenderRefs.ref(${app.ref}) not undefined`);
            }
        }
        if (!this.config.root.level) {
            this.config.root.level = "TRACE";
        }
        if (!levels.has(this.config.root.level)) {
            throw new Error(`${prefix}root.level(${this.config.root.level}) not in ("TRACE", "DEBUG", "INFO", "WARN", "ERROR")`);
        }
        if (this.config.loggers) {
            // logger按name的长度排顺序
            this.config.loggers.sort(((a, b) => {
                if (a.name && b.name) {
                    if (a.name.length < b.name.length) {
                        return -1;
                    } else if (a.name.length > b.name.length) {
                        return 1;
                    }
                }
                return 0;
            }));
            for (const value of this.config.loggers) {
                if (!value.name) {
                    throw new Error(prefix + "config.loggers name is undefined");
                }
                if (value.additivity === null || value.additivity === undefined) {
                    value.additivity = true;
                }
                if (!value.appenderRefs || value.appenderRefs.length === 0 ) {
                    throw new Error(`${prefix}logger(name${value.name}).appenderRefs is empty`);
                }
                for (const app of value.appenderRefs) {
                    if (!this.appenderRealizeMap.has(app.ref)) {
                        throw new Error(prefix + `logger(name${value.name}).appenderRefs.ref${app.ref} not undefined`);
                    }
                }
                if (!value.level) {
                    value.level = "TRACE";
                }
                if (!levels.has(value.level)) {
                    throw new Error(`${prefix}root.level(${value.level}) not in ("TRACE", "DEBUG", "INFO", "WARN", "ERROR")`);
                }
            }
        } else {
            this.config.loggers = [];
        }
    }
    /**
     * 方法功能描述: 根据name匹配logger配置
     * @author yanshaowen
     * @date 2019/3/1 10:19
     * @param name
     * @return
     */
    public getLoggerByName(name: string) {
        const loggers: Logger[] = [];
        for (const logger of this.config.loggers) {
            const re = new RegExp(logger.name);
            if (re.test(name)) {
                loggers.push(logger);
                if (!logger.additivity) {
                    break;
                }
            }
        }
        if (loggers.length === 0 || loggers[loggers.length - 1].additivity) {
            loggers.push(this.rootLogger);
        }
        return loggers;
    }
    /**
     * 方法功能描述: 根据ref获取Appenders
     * @author yanshaowen
     * @date 2019/3/1 13:09
     * @param refs
     * @return
     */
    public getAppendersByRef(refs: AppenderRef[]) {
        const list: Appender[] = [];
        refs.forEach((v) => {
            list.push(this.appenderRealizeMap.get(v.ref));
        });
        return list;
    }
}
