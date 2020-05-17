import {Course} from "../../../Course";
import {InsightError} from "../../../IInsightFacade";
import {BodyNode} from "./BodyNode";
import Log from "../../../../Util";
import {AbstractSyntaxTree} from "../AbstractSyntaxTree";
import {InsightDataObject} from "../../../InsightDataObject";
import {QueryParser} from "../../QueryParser";

export class MNode extends BodyNode {
    private key: string;
    private queryValue: number;
    private objectField: string;

    public constructor(keyValue: string, value: object, parser: QueryParser) {
        super(parser);
        this.MComparison(keyValue, value);
    }

    public evaluateNode(insightItem: InsightDataObject): boolean {
        if (this.key === "EQ") {
            return this.queryValue === insightItem.getField(this.objectField);
        } else if (this.key === "LT") {
            return this.queryValue > insightItem.getField(this.objectField);
        } else if (this.key === "GT") {
            return this.queryValue < insightItem.getField(this.objectField);
        }
    }

    private MComparison(filter: string, value: any): void {
        let courseParameters: string[];
        let courseParameter: string;
        let queryParameter: number;
        this.key = filter;
        if (!this.isAnObject(value)) { // check that MComparison argument is an object
            throw new InsightError(filter + "must be an object");
        }
        if (Object.keys(value).length !== 1) { // check that argument length is 1
            throw new InsightError(filter + "should have 1 key, has " + Object.keys(value).length);
        }
        if (Object.values(value).length !== 1) {
            throw new InsightError(filter + "should have 1 value, has " + Object.values(value).length);
        }
        let fields = Object.keys(value);
        try {
            courseParameters = this.parseMKey(fields[0]); // returns [courseID, parameter] parameter
            courseParameter = courseParameters[1];
            this.objectField = courseParameter;
        } catch (err) {
            if (err.message === "Invalid key") { // TODO: add error name
                throw new InsightError("Invalid key " + fields[0] + " in " + filter);
            } else if (err.message === "Invalid ID") {
                throw new InsightError("Cannot query more than one dataset");
            } else {
                Log.trace(err);
            }
        }
        try {
            queryParameter = this.getMValue(value); // get query_value
            this.queryValue = queryParameter;
        } catch (err) {
            if (err.message === "Invalid Type") { // TODO: add error name
                throw new InsightError("Invalid value type in " + filter + ", should be a number");
            } else {
                Log.trace(err);
            }
        }
    }

    private getMValue(value: any): any {
        let contents = Object.values(value);
        if (!(typeof contents[0] === "number")) { // check that value is a number
            throw new InsightError("Invalid Type");
        }
        return contents[0];
    }

    private parseMKey(input: string): string[] {
        let contents = input.split("_");
        if (contents.length !== 2) {
            throw new InsightError("Invalid key");
        }
        try {
            this.setId(contents[0]);
        } catch (err) {
            if (err.message === "id invalid") {
                throw new InsightError("Referenced multiple datasets in MComparison");
            } else {
                Log.trace(err);
            }
        }
        let mField = this.parseMField(contents[1]);
        let parameters = [contents[0], mField];
        return parameters;
    }

    private parseMField(input: string): string { // this is slightly redundant with the get method in Course
        let mfields = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
        if (!mfields.includes(input)) {
            throw new InsightError("Invalid key"); // no valid field found
        }
        return input;
    }
}
