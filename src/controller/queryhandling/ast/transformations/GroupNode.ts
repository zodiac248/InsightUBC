import {QueryParser} from "../../QueryParser";
import {ASTNode} from "../ASTNode";
import {InsightError} from "../../../IInsightFacade";
import Log from "../../../../Util";

export class GroupNode extends ASTNode {
    private groups: string[];

    public constructor(queryGroup: any, parser: QueryParser) {
        super(parser);
        this.initializeGroups(queryGroup);
    }

    private initializeGroups(queryGroup: any): void {
        this.groups = [];
        for (let key of queryGroup) {
            this.validateKey(key);
            this.groups.push(key);
        }
    }

    public validateKey(key: string): void {
        let parsedKeyContents = this.parseKey(key);
        let id = parsedKeyContents[0];
        try {
            this.setId(id);
        } catch (err) {
            if (err.message === "id invalid") {
                throw new InsightError("Referenced multiple datasets in GROUPS");
            } else {
                Log.trace(err);
            }
        }
        let field = parsedKeyContents[1];
        if (!this.isFieldValid(field)) {
            throw new InsightError("Invalid key in GROUPS");
        }
    }

    private parseKey(key: string): string[] {
        if (typeof key !== "string") {
            throw new InsightError("Group key must be string");
        }
        let contents = key.split("_");
        if (contents.length !== 2) {
            throw new InsightError("Invalid key in GROUPS");
        }
        return contents;
    }

    private isFieldValid(key: string): boolean {
        let allFields = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats",
        "dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number",
            "name", "address", "type", "furniture", "href"];
        return allFields.includes(key);
    }

    public getGroups(): string[] {
        return this.groups;
    }
}
