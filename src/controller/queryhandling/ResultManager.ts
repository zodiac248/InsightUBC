import {InsightDataObject} from "../InsightDataObject";
import {ResultTransformer} from "./ResultTransformer";
import {AbstractSyntaxTree} from "./ast/AbstractSyntaxTree";
import {SortNode} from "./ast/options/SortNode";
import {ResultTooLargeError} from "../IInsightFacade";

interface LooseObject {
    [key: string]: any;
}
export class ResultManager {
    private results: any[];
    private resultFields: string[];
    private transformer: ResultTransformer;

    constructor(AST: AbstractSyntaxTree) {
        this.results = [];
        this.transformer = new ResultTransformer(AST);
        this.initializeResultFields(AST);
    }

    public getResults(): any[] {
        if (this.isTooLarge()) {
            throw new ResultTooLargeError("ResultTooLargeError");
        }
        return this.results;
    }

    // Needs to identify all relevant fields to include in the result
    // this includes fields included in columns, as well as fields which anykeys depend on
    public initializeResultFields(AST: AbstractSyntaxTree): void {
        let options = AST.getOptions();
        let columns = options.getColumns();
        this.resultFields = [];
        for (let key of columns) {
            let field = this.getFieldFromKey(key);
            if (this.isAKey(field)) {
                this.resultFields.push(key);
            }
        }
        let keysFromTransformations = this.transformer.getTransformationsFields();
        for (let key of keysFromTransformations) {
            this.resultFields.push(key);
        }
        this.resultFields = this.resultFields.filter((field, i, newFields) => this.resultFields.indexOf(field) === i);
    }

    private getFieldFromKey(key: string): string {
        let contents = key.split("_");
        let field = contents[1];
        return field;
    }


    public isAKey(key: string): boolean {
        return (this.isAnMkey(key) || this.isAnSKey(key));
    }

    private isAnMkey(key: string): boolean {
        let mfields = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        return mfields.includes(key);

    }

    private isAnSKey(key: string): boolean {
        let sfields = ["dept", "id", "instructor", "title", "uuid", "fullname",
            "shortname", "number", "name", "address", "type", "furniture", "href"];
        return sfields.includes(key);
    }

    // Builds result based on fields from query
    public buildResult(insightObject: InsightDataObject): void {
        let newResult: LooseObject = {};
        for (let key of this.resultFields) {
            let field = this.getFieldFromKey(key);
            newResult[key] = insightObject.getField(field);
        }
        this.results.push(newResult);
    }

    // Manages a call to transformer
    public transformResults(AST: AbstractSyntaxTree): void {
        let options = AST.getOptions();
        let columns = options.getColumns();
        this.results = this.transformer.transformResult(this.results, columns);
    }

    // Needs access to direction to sort and keys to sort on
    public sortResults(AST: AbstractSyntaxTree): void {
        let options = AST.getOptions();
        let sort = options.getSort();
        if (sort == null) {
            return;
        } else if (sort.getAnyKey() !== null) {
            // sort as previously
            let field = sort.getAnyKey();
            this.sortByAnyKey(field);
        } else {
            // sort using complicated approach
            this.sortByDir(sort);
        }

    }

    public sortByAnyKey(field: string): void {
        if (this.results.length > 1) {
            this.results.sort(function (resultA: any, resultB: any) {
                if ( resultA[field] < resultB[field] ) {
                    return -1;
                }
                if ( resultA[field] > resultB[field] ) {
                    return 1;
                }
                return 0;
            });
        }
    }

    public sortByDir(sort: SortNode): void {
        let direction = sort.getDirection();
        let keys = sort.getKeys();
        let dirNum = 1;
        if (direction === "DOWN") {
            dirNum = -1;
        }
        function sortByField(resultA: any, resultB: any, field: string) {
            if ( resultA[field] < resultB[field] ) {
                return -dirNum;
            }
            if ( resultA[field] > resultB[field] ) {
                return dirNum;
            }
            return 0;
        }
        function multipleKeysComparison(resultA: any, resultB: any) {
            for (let key of keys) {
                let currResult = sortByField(resultA, resultB, key);
                if (currResult !== 0) {
                    return currResult;
                }
            }
            return 0;
        }
        if (this.results.length > 1) {
            this.results.sort(multipleKeysComparison);
        }
    }

    public isTooLarge(): boolean {
        return this.results.length > 5000;
    }
}
