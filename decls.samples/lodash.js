declare module lodash {
    declare function isBoolean(x: any): boolean;    
    declare function isInteger(x: any): boolean;
    declare function uniq<T>(arr: Array<T>): Array<T>;
    declare function isEmpty<T>(arr: Array<T>): boolean;
    declare function isArray(o: any): boolean;
    declare function sortBy <T>(arr : Array<T>, someSortingFunction  : ?(t: T)=>     any): Array<T>;
    declare function filter <T>(arr : Array<T>, someFilteringFunction:  (t: T)=> boolean): Array<T>;
    declare function some   <T>(coll: Array<T>, somePredicateFunction:  (t: T)=> boolean): boolean;
    declare function every  <T>(coll: Array<T>, somePredicateFunction:  (t: T)=> boolean): boolean;
    declare function includes <T>(coll: Array<T>, t: T): boolean;
//    declare function map <T, V> (coll: Array<T>, someFunction: (t: T)=> V): Array<V>;
}
