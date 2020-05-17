import {Course} from "../../../Course";
import {InsightError} from "../../../IInsightFacade";
import {BodyNode} from "./BodyNode";
import Log from "../../../../Util";
import {QueryParser} from "../../QueryParser";

export class SNode extends BodyNode {
    private queryRegExp: RegExp;
    private queryString: string;
    private objectField: string;

    public constructor(value: object, parser: QueryParser) {
        super(parser);
        this.SComparison(value);
    }

    public evaluateNode(course: Course): boolean {
        if (this.queryRegExp !== null) {
            return this.queryRegExp.test(course.getField(this.objectField));
        } else {
            return this.queryString === course.getField(this.objectField);
        }
    }

    private SComparison(value: any): void {
        let courseParameters: string[];
        let courseParameter: string;
        let queryParameter;
        if (!this.isAnObject(value)) {
            throw new InsightError("IS must be an object");
        }
        if (Object.keys(value).length !== 1) {
            throw new InsightError("IS should have 1 key, has " + Object.keys(value).length );
        }
        if (Object.values(value).length !== 1) {
            throw new InsightError("IS should have 1 value, has " + Object.values(value).length);
        }
        let fields = Object.keys(value);
        try {
            courseParameters = this.parseSKey(fields[0]); // returns [courseID, parameter]
            courseParameter = courseParameters[1];
            this.objectField = courseParameter;
        } catch (err) {
            if (err.message === "Invalid key") { // TODO: add error name
                throw new InsightError("Invalid key " + fields[0] + " in IS");
            } else if (err.message === "Invalid ID") {
                throw new InsightError("Cannot query more than one dataset");
            } else {
                Log.trace(err);
            }
        }
        try {
            this.setSValue(value);
        } catch (err) {
            if (err.message === "Invalid Type") { // TODO: add error name
                throw new InsightError("Invalid Type in IS");
            } else if (err.message === "Invalid key") {
                throw new InsightError("Invalid key " + fields[0] + " in IS");
            } else {
                Log.trace(err);
            }
        }
    }

    private setSValue(value: any): void {
        let contents = Object.values(value);
        let str = contents[0];
        let template: string;
        if (!(typeof str === "string")) {
            throw new InsightError("Invalid Type");
        }
        let splits = str.split("*");
        if (splits.length > 3) {
            throw new InsightError("Invalid key");
        }
        let regex0 = RegExp("^[*][^*]+$");
        let regex1 = RegExp("^[*][^*]*[*]$");
        let regex2 = RegExp("^[^*]+[*]$");
        let regex3 = RegExp("^[^*]*$");
        let regex4 = RegExp("^[*]$");
        if (regex0.test(str)) {
            template = splits[1];
            this.queryRegExp =  RegExp(".*" + "(" + template + ")" + "$");
        } else if (regex1.test(str)) {
            template = splits[1];
            this.queryRegExp =  RegExp(".*" + "(" + template + ")" + ".*");
        } else if (regex2.test(str)) {
            template = splits[0];
            this.queryRegExp =  RegExp(   "^" + "(" + template + ")" + ".*");
        } else if (regex3.test(str)) {
            template = splits[0];
            this.queryRegExp = null;
            this.queryString = template;
        } else if (regex4.test(str)) {
            this.queryRegExp =  RegExp(".*");
        } else {
            throw new InsightError("Invalid key");
        }
    }

    private parseSKey(input: string): string[] {
        let contents = input.split("_");
        if (contents.length !== 2) {
            throw new InsightError("Invalid key");
        }
        try {
            this.setId(contents[0]);
        } catch (err) {
            if (err.message === "id invalid") {
                throw new InsightError("Referenced multiple datasets in SComparison");
            } else {
                Log.trace(err);
            }
        }
        let sField = this.parseSField(contents[1]);
        let parameters = [contents[0], sField];
        return parameters;
    }

    private parseSField(input: string): string {
        let sfields = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number",
            "name", "address", "type", "furniture", "href"];
        if (!sfields.includes(input)) {
            throw new InsightError("Invalid key"); // no valid field found
        }
        return input;
    }
}
