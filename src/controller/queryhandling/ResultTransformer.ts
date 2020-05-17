import {InsightError} from "../IInsightFacade";
import {AbstractSyntaxTree} from "./ast/AbstractSyntaxTree";
import {Decimal} from "decimal.js";

export class ResultTransformer {
    private listOfGroupFields: string[];
    private listOfRules: object[];
    private resultMap: Map<string, object[]>;

    public constructor(AST: AbstractSyntaxTree) {
        this.initialize(AST);
    }

    public initialize(AST: AbstractSyntaxTree): void {
        let transformations = AST.getTransformations();
        if (transformations === null || transformations === undefined) {
            this.listOfRules = null;
            this.listOfGroupFields = null;
            return;
        }
        // TODO: What if these are empty
        this.listOfRules = transformations.getApplyRules();
        this.listOfGroupFields = transformations.getGroups();
    }

    public getTransformationsFields(): string[] {
        let keys: string[] = [];
        if (this.listOfRules === null) {
            return keys;
        }
        for (let rule of this.listOfRules) {
            let ruleObject = Object.values(rule)[0];
            let key: string = String(Object.values(ruleObject)[0]);
            // let field = this.getFieldFromKey(key);
            keys.push(key);
        }
        let newKeys = keys.concat(this.listOfGroupFields);
        // arrow function keeps only unique elements
        // inspired by stackexchange
        return newKeys.filter((field, i, filterKeys) => newKeys.indexOf(field) === i);
    }

// usage example:

    // takes in an array of results (courses stripped to relevant fields)
    // returns an array of groups
    // each group contains the group fields and the results with apply keys
    public transformResult(results: any[], columns: string[]): any[] {
        let transformedResults = results;
        if (this.listOfGroupFields !== null && this.listOfRules !== null) {
            transformedResults = this.groupResults(results);
            transformedResults = this.applyRules(transformedResults, columns);
        }
        return transformedResults;
    }

    // uses a hash map to sort results
    // then iterates through hash map to extract groups
    public groupResults(results: any[]): any[] {
        // for result in results
        //      add key to hashmap
        // for key value pair in hashmap
        //      add value to array
        // return array
        if (this.listOfGroupFields === null) {
            return results;
        }
        let groups: any[] = [];
        this.resultMap = new Map<string, object[]>();
        for (let result of results) {
            let key = this.extractKey(result);
            let curr = this.resultMap.get(key);
            if (curr === undefined) {
                this.resultMap.set(key, [result]);
            } else {
                curr.push(result);
            }
        }
        for (let group of this.resultMap.values()) {
            groups.push(group);
        }
        return groups;
    }

    public extractKey(result: any): string {
        let fields = [];
        for (let field of this.listOfGroupFields) {
            let objectField = result[field];
            fields.push(objectField);
        }
        let key = fields.join(" ");
        return key;
    }

    public applyRules(groupedResults: any[], columns: string[]): any[] {
    // public applyRules(): void {
        // if no groups, apply to all results
        // for group in groups
        //      for rule in rulelist
        //          construct result by applying rule to group
        //      append new group
        // return new groups
        let transformedGroupedResults = [];
        for (let entry of this.resultMap.entries()) {
            let key = entry[0];
            let group = entry[1];

            let applyObject: any = {};

            let groupFields = [];
            let firstElement: any = group[0];
            // for (let groupField of this.listOfGroupFields) {
            //    applyObject[groupField] = firstElement[groupField];
            // }
            for (let rule of this.listOfRules) {
                // apply rules are stored as objects
                // get value from function
                // get name from apply rule
                // add to empty object as field
                let ruleName = Object.keys(rule)[0];
                let ruleObject = Object.values(rule)[0];

                let field = Object.values(ruleObject)[0];
                let ruleKey = Object.keys(ruleObject)[0];

                let ruleValue = this.applyRule(ruleKey, field, group);
                applyObject[ruleName] = ruleValue;
            }
            let newObject: any = {};
            for (let columnKey of columns) {
                if (this.listOfGroupFields.includes(columnKey)) {
                    newObject[columnKey] = firstElement[columnKey];
                } else {
                    newObject[columnKey] = applyObject[columnKey];
                }
            }
            transformedGroupedResults.push(newObject);
        }
        return transformedGroupedResults;
    }

    public applyRule(key: string, field: any, group: any[]): number {
        switch (key) {
            case "MAX":
                return this.applyMax(field, group);
            case "MIN":
                return this.applyMin(field, group);
            case "AVG":
                return this.applyAvg(field, group);
            case "COUNT":
                return this.applyCount(field, group);
            case "SUM":
                return this.applySum(field, group);
            default:
                throw new InsightError(key + " is not a valid applytoken");
        }
    }

    public isNumericField(key: string): boolean {
        let mfields = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        let contents = key.split("_");
        let field = contents[1];
        return mfields.includes(field);
    }

    public applyMax(field: string, resultSet: any[]): number {
        if (!this.isNumericField(field)) {
            throw new InsightError("Invalid field type in MAX");
        }
        let result;
        let values = [];
        for (let insightResult of resultSet) {
            values.push(insightResult[field]);
        }
        result = Math.max(...values);
        return result;
    }

    public applyMin(field: string, resultSet: any[]): number {
        if (!this.isNumericField(field)) {
            throw new InsightError("Invalid field type in MIN");
        }
        let result;
        let values = [];
        for (let insightResult of resultSet) {
            values.push(insightResult[field]);
        }
        result = Math.min(...values);
        return result;
    }

    public applySum(field: string, resultSet: any[]): number {
        if (!this.isNumericField(field)) {
            throw new InsightError("Invalid field type in SUM");
        }
        let result;
        let values = [];
        for (let insightResult of resultSet) {
            values.push(insightResult[field]);
        }
        result = values.reduce((currVal, nextVal) => currVal + nextVal, 0);
        return Number(result.toFixed(2));
    }

    public applyAvg(field: string, resultSet: any[]): number {
        if (!this.isNumericField(field)) {
            throw new InsightError("Invalid field type in AVG");
        }
        let total: Decimal = new Decimal(0);
        for (let result of resultSet) {
            let newNumber = new Decimal(result[field]);
            total = Decimal.add(total, newNumber);
        }
        let numRows = resultSet.length;
        let avg = total.toNumber() / numRows;
        let res = Number(avg.toFixed(2));
        return res;
    }

    public applyCount(field: string, resultSet: any[]): number {
        let values: any[] = [];
        for (let insightResult of resultSet) {
            values.push(insightResult[field]);
        }
        values = values.filter((someValue, i, filterKeys) => values.indexOf(someValue) === i);
        return values.length;
    }
}
