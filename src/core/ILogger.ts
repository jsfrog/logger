/**
 *
 * 功能描述:
 *
 * @className ILogger
 * @projectName type-interface
 * @author yanshaowen
 * @date 2019/2/23 15:22
 */
export interface ILogger {
    kind: "ILogger";
    getName(): string;
    isTraceEnabled(): boolean;
    trace(msg: string): void;
    trace(msg: string, args: any): void;
    trace(msg: string, ...args: any[]): void;
    trace(msg: string, e: Error): void;

    isDebugEnabled(): boolean;
    debug(msg: string): void;
    debug(msg: string, args: any): void;
    debug(msg: string, ...args: any[]): void;
    debug(msg: string, e: Error): void;

    isInfoEnabled(): boolean;
    info(msg: string): void;
    info(msg: string, args: any): void;
    info(msg: string, ...args: any[]): void;
    info(msg: string, e: Error): void;

    isWarnEnabled(): boolean;
    warn(msg: string): void;
    warn(msg: string, args: any): void;
    warn(msg: string, ...args: any[]): void;
    warn(msg: string, e: Error): void;

    isErrorEnabled(): boolean;
    error(msg: string): void;
    error(msg: string, args: any): void;
    error(msg: string, ...args: any[]): void;
    error(msg: string, e: Error): void;
}
