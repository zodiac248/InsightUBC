import {InsightError} from "../IInsightFacade";
import {NotImplementedError} from "restify";
import {AbstractSyntaxTree} from "./ast/AbstractSyntaxTree";

export class QueryValidator {
    private AST: AbstractSyntaxTree;
    private applyKeys: string[];
    private groupKeys: string[];
    private columnsKeys: string[];

    public validateQuerySemantics(AST: AbstractSyntaxTree): void {
        this.AST = AST;

        this.verifyUniqueApplyKeys();
        this.validateColumnsKeys();
        this.validateSortKeys();
    }

    public verifyUniqueApplyKeys(): void {
        // verify that the list of apply keys contains no duplicates
        let transformations = this.AST.getTransformations();
        if (transformations !== null && transformations !== undefined) {
            let applyKeys = transformations.getApplyKeys();
            let uniqueApplyKeys = applyKeys.filter(
                (field, i, filterFields) => applyKeys.indexOf(field) === i);
            if (uniqueApplyKeys.length !== applyKeys.length) {
                throw new InsightError("Duplicate applykeys in APPLY");
            }
            this.applyKeys = applyKeys;
            let groupKeys = transformations.getGroups();
            this.groupKeys = groupKeys;
        }
    }

    public validateColumnsKeys(): void {
        // verify that all of the apply keys contained in columns actually exist
        let options = this.AST.getOptions();
        let columnKeys = options.getColumns();
        let columnApplyKeys = options.getColumnsApplyKeys();

        let transformations = this.AST.getTransformations();
        if (transformations !== null && transformations !== undefined) {
            for (let key of columnKeys) {
                if (!this.applyKeys.includes(key) && !this.groupKeys.includes(key)) {
                    throw new InsightError("COLUMNS contains key not in APPLY or GROUP");
                }
            }
        } else {
            if (columnApplyKeys.length !== 0) {
                throw new InsightError("Invalid key in COLUMNS");
            }
        }
    }

    public validateSortKeys(): void {
        // verify that all of the apply keys contained in sort actually exist
        let options = this.AST.getOptions();
        let sortKeys = options.getSortApplyKeys();
        this.columnsKeys = options.getColumns();
        for (let key of sortKeys) {
            if (!this.columnsKeys.includes(key)) {
                throw new InsightError("SORT contains key not in COLUMNS");
            }
        }
    }

    public validateOptions(query: any): void {
        /*
        let attributes = ["dept", "id", "avg", "instructor", "title", "pass", "fail", "audit", "uuid", "year"];
        let optionBody = query["OPTIONS"];
        let currentSet = " ";
        if (Object.keys(optionBody).length === 2) {
            if (typeof optionBody["COLUMNS"] !== "undefined" && typeof optionBody["ORDER"] !== "undefined") {
                let str = optionBody["ORDER"];
                let arr = str.toString().split("_");
                if (arr.length !== 2) {
                    throw new InsightError("Invalid query");
                }
                if (!attributes.includes(arr[1])) {
                    throw new InsightError("Invalid query");
                }
                currentSet = arr[0];
                let columns = optionBody["COLUMNS"];
                if (currentSet ===  this.validateColumns(columns)) {
                    return currentSet;
                } else {
                    throw new InsightError("Invalid query");
                }
            } else {
                throw new InsightError("Invalid query");
            }
        } else if (Object.keys((optionBody)).length === 1) {
            if (typeof optionBody["COLUMNS"] !== "undefined") {
                let columns = optionBody["COLUMNS"];
                currentSet =  this.validateColumns(columns);
            } else {
                throw new InsightError("Invalid query");
            }
        } else {
            throw new InsightError("Invalid query");
        }
        return currentSet;
        */
    }


    public validateColumns(columns: any): void {
        /*
        if (!this.isAnArray(columns)) { // columns must be an array
            throw new InsightError("Invalid query");
        }
        let currentSet = "init";
        let attributes = ["dept", "id", "avg", "instructor", "title", "pass", "fail", "audit", "uuid", "year"];
        if (Object.keys(columns).length > 0) {
            for (let i of Object.values(columns)) {
                let arr = i.toString().split("_");
                if (arr.length === 2) {
                    if (attributes.includes(arr[1])) {
                        if ( currentSet === "init") {
                            currentSet = arr[0];
                        } else {
                            if (currentSet !== arr[0]) {
                                throw new InsightError("Invalid query");
                            }
                        }
                    } else {
                        throw new InsightError("Invalid query");
                    }
                } else {
                    throw new InsightError("Invalid query");
                }
            }
        } else {
            throw new InsightError("Invalid query");
        }
        return currentSet;
         */
    }

    public validateOrder (query: any): void {
        /*
        let order = query["OPTIONS"]["ORDER"];
        let columns = query["OPTIONS"]["COLUMNS"];
        let col: string[] = [];
        if (typeof order !== "undefined" && order !== null) { // what happens if null?
            if (typeof order !== "string") {
                throw new InsightError("Invalid query");
            }
            order = order.toString().split("_")[1];
            for (let i of Object.values(columns)) {
                let arr = i.toString().split("_");
                col.push(arr[1]);
            }
            if (col.includes(order) === false) {// this should be simplified
                throw new InsightError("Invalid query");
            }
        }
        */
    }

    public validateTransformations(): void {
        throw new NotImplementedError();
    }

    public validateGroup(): void {
        throw new NotImplementedError();
    }

    public validateApply(): void {
        throw new NotImplementedError();
    }

    public isAnObject(item: any): boolean {
        return Object.prototype.toString.call(item).indexOf("Object") > -1 ;
    }

    public isAnArray(item: any): boolean {
        return Object.prototype.toString.call(item).indexOf("Array") > -1;
    }
}
