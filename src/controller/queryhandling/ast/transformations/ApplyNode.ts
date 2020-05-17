import {QueryParser} from "../../QueryParser";
import {ASTNode} from "../ASTNode";
import {InsightError} from "../../../IInsightFacade";
import Log from "../../../../Util";

export class ApplyNode extends ASTNode {
    private applyRules: object[];
    private applyKeys: string[];
    private applyRuleFields: string[];

    public constructor(queryApply: any, parser: QueryParser) {
        super(parser);
        this.initializeApplyRules(queryApply);
    }

    public initializeApplyRules(queryApply: any): void {
        this.applyRules = [];
        this.applyKeys = [];
        this.applyRuleFields = [];
        for (let applyRule of queryApply) {
            this.validateApplyRule(applyRule);
            this.applyRules.push(applyRule);
        }
    }

    private validateApplyRule(applyRule: object): void {
        let applyKey = Object.keys(applyRule)[0];
        let parsedApplyKeyContents = applyKey.split("_");
        if (parsedApplyKeyContents.length !== 1) {
            throw new InsightError("Invalid applyKey in APPLY");
        }
        this.applyKeys.push(applyKey);

        let applyValue = Object.values(applyRule);
        let applyValueObject = applyValue[0];
        let innerApplyValues = Object.values(applyValueObject);
        let key = String(innerApplyValues[0]);

        let parsedKeyContents = this.parseKey(key);
        let id = parsedKeyContents[0];
        try {
            this.setId(id);
        } catch (err) {
            if (err.message === "id invalid") {
                throw new InsightError("Referenced multiple datasets in APPLY");
            } else {
                Log.trace(err);
            }
        }
        let field = parsedKeyContents[1];
        if (!this.isFieldValid(field)) {
            throw new InsightError("Invalid key in APPLY");
        }
    }

    private parseKey(key: string): string[] {
        if (typeof key !== "string") {
            throw new InsightError("Apply key must be string");
        }
        let contents = key.split("_");
        if (contents.length !== 2) {
            throw new InsightError("Invalid key in APPLY");
        }
        return contents;
    }

    private isFieldValid(key: string): boolean {
        let allFields = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats",
        "dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number",
            "name", "address", "type", "furniture", "href"];
        return allFields.includes(key);
    }

    public getApplyRules() {
        return this.applyRules;
    }

    public getApplyKeys() {
        return this.applyKeys;
    }
}
