import {QueryParser} from "../../QueryParser";
import {ASTNode} from "../ASTNode";
import {InsightError} from "../../../IInsightFacade";
import Log from "../../../../Util";

export class ColumnsNode extends ASTNode {
    private columns: string[];
    private columnsApplyKeys: string[];

    public constructor(queryColumns: any, parser: QueryParser) {
        super(parser);
        this.id = parser.getID();

        if (!this.isAnArray(queryColumns)) {
            throw new InsightError("Columns must be an array");
        }
        if (queryColumns.length === 0) {
            throw new InsightError("Columns must not be empty");
        }

        this.initializeColumns(queryColumns);
    }

    public initializeColumns(queryColumns: any) {
        this.columns = [];
        this.columnsApplyKeys = [];
        for (let key of queryColumns) {
            this.validateColumnKey(key);
            this.columns.push(key);
        }
    }

    public validateColumnKey(key: string): void {
        if (typeof key !== "string") {
            throw new InsightError("Column key must be string");
        }
        let parsedKeyContents = this.parseKey(key);
        if (parsedKeyContents.length === 1) {
            this.columnsApplyKeys.push(parsedKeyContents[0]);
        } else {
            let id = parsedKeyContents[0];
            try {
                this.setId(id);
            } catch (err) {
                if (err.message === "id invalid") {
                    throw new InsightError("Referenced multiple datasets in COLUMNS");
                } else {
                    Log.trace(err);
                }
            }
            let field = parsedKeyContents[1];
            if (!this.isFieldValid(field)) {
                throw new InsightError("Invalid key in COLUMNS"); // no valid field found
            }
        }
    }

    private parseKey(key: string): string[] {
        let contents = key.split("_");
        /*
        if (contents.length > 2) {
            throw new InsightError("Invalid key");
        }
        */
        return contents;
    }

    private isFieldValid(key: string): boolean {
        let allFields = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats",
        "dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number",
            "name", "address", "type", "furniture", "href"];
        return allFields.includes(key);
    }

    public getColumns(): string[] {
        return this.columns;
    }

    public getColumnsApplyKeys(): string[] {
        return this.columnsApplyKeys;
    }
}
