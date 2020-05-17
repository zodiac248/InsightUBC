import {QueryParser} from "../../QueryParser";
import {ASTNode} from "../ASTNode";
import {InsightError} from "../../../IInsightFacade";
import Log from "../../../../Util";
export class KeysNode extends ASTNode {
    private keys: string[];
    private sortApplyKeys: string[];
    public constructor(queryKeys: any[], parser: QueryParser) {
        super(parser);
        this.id = parser.getID();
        this.initializeKeys(queryKeys);
    }

    public initializeKeys(keys: any[]) {
        if (keys.length === 0) {
            throw new InsightError("keys must not be empty");
        }
        this.keys = [];
        this.sortApplyKeys = [];
        for (let key of keys) {
            this.validateKey(key);
            this.keys.push(key);
            if (this.isAnApplyKey(key)) {
                this.sortApplyKeys.push(key);
            }
        }
    }

    public validateKey(key: string): void {
        let parsedKeyContents = this.parseKey(key);
        if (parsedKeyContents.length !== 1) {
            let id = parsedKeyContents[0];
            try {
                this.setId(id);
            } catch (err) {
                if (err.message === "id invalid") {
                    throw new InsightError("Referenced multiple datasets in SORT");
                } else {
                    Log.trace(err);
                }
            }
            let field = parsedKeyContents[1];
            if (!this.isFieldValid(field)) {
                throw new InsightError("Invalid key in SORT");
            }
        }
    }

    private isAnApplyKey(key: string): boolean {
        let parsedKeyContents = this.parseKey(key);
        return parsedKeyContents.length === 1;
    }

    private parseKey(key: string): string[] {
        if (typeof key !== "string") {
            throw new InsightError("Sort key must be string");
        }
        let contents = key.split("_");
        if (contents.length > 2) {
            throw new InsightError("Invalid key");
        }
        return contents;
    }

    private isFieldValid(key: string): boolean {
        let allFields = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats",
            "dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number",
            "name", "address", "type", "furniture", "href"];
        return allFields.includes(key);
    }

    public getKeys(): string[] {
        return this.keys;
    }

    public getSortApplyKeys(): string[] {
        return this.sortApplyKeys;
    }
}
