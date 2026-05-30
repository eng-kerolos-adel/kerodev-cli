import { type Ora } from 'ora';
export declare const brand: {
    logo(): string;
    header(): void;
    tagline(): string;
};
export declare function createSpinner(text: string): {
    start: () => Ora;
    succeed: (msg?: string) => Ora;
    fail: (msg?: string) => Ora;
    warn: (msg?: string) => Ora;
    update: (msg: string) => void;
    instance: Ora;
};
export declare const box: {
    info(title: string, body: string): void;
    success(title: string, body: string): void;
    error(title: string, body: string): void;
    warn(title: string, body: string): void;
};
export declare const log: {
    step(n: number, total: number, msg: string): void;
    info(msg: string): void;
    success(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
    dim(msg: string): void;
    blank(): void;
    section(title: string): void;
};
export declare function printKeyValueTable(rows: [string, string][]): void;
export declare function printSuccessScreen(projectName: string, framework: string, pm: string, extras: string[]): void;
export declare function printErrorScreen(title: string, message: string, hints?: string[]): void;
export declare function printHelpBanner(): void;
//# sourceMappingURL=ui.d.ts.map