// for this approach see:
//     http://stackoverflow.com/q/40668097/274677

declare module "chai" {

    declare class AssertClass {
        static isBoolean     (o: any)             : void;
        static isFalse       (o: any, m: ?string) : void;
        static instanceOf    (x: any, t: any)     : void;
        static isNumber      (x: any)             : void;
        static isString      (x: any)             : void;
        static isTrue        (x: any, m: ?string) : void;
        static isNull        (x: any, m: ?string) : void;
        static isNotNull     (x: any, m: ?string) : void;        
        static throws        (f:   F, errorLike: ?any, errorMatcher: ?any, msg: ?string): void;
        static fail          (m: ?string)         : void;
        static fail          (x: any, y: any, m: ?string)         : void;        
        static strictEqual   (actual: any, expected: any, m: ?string): void;
        static deepEqual     (actual: any, expected: any, m: ?string): void; // TODO: update in archetype
        static isOk          (x: any)             : void;
    }

    declare export var assert: typeof AssertClass;
}

