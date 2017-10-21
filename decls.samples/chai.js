// this is how I used to annotate chai in the past:

     declare class ChaiAssert {
         isFalse       (o: any)        : boolean;    
         instanceOf    (x: any, t: any): boolean;
         isNumber      (x: any)        : boolean;
         isString      (x: any)        : boolean;
         isTrue        (x: any)        : boolean;
         isNull        (x: any)        : boolean;
         throws        (f:   F)        : boolean;
     }

// the above was used with:
//
// const assert: ChaiAssert = require('chai').assert; 
//
// ... in my code. For more see:
//
//      http://stackoverflow.com/q/40668097/274677
