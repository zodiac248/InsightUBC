import {QueryParser} from "../../QueryParser";
import {ASTNode} from "../ASTNode";
import {ColumnsNode} from "./ColumnsNode";
import {SortNode} from "./SortNode";
import {InsightError} from "../../../IInsightFacade";

export class OptionsNode extends ASTNode {
    private columns: ColumnsNode;
    private sort: SortNode;

    public constructor(queryOptions: any, parser: QueryParser) {
        super(parser);
        this.initializeChildren(queryOptions, parser);
    }

    public initializeChildren(queryOptions: any, parser: QueryParser) {
        let optionsValues = Object.values(queryOptions);

        if (optionsValues.length > 2) {
            throw new InsightError("Too many arguments in OPTIONS");
        }
        if (optionsValues.length === 0) {
            throw new InsightError("OPTIONS must not be empty");
        }

        let queryColumns = queryOptions["COLUMNS"];
        let querySort = queryOptions["ORDER"];

        // TODO: conduct syntactic checking
        this.columns = new ColumnsNode(queryColumns, parser);
        this.sort = null;

        if (querySort !== null && querySort !== undefined) {
            this.sort = new SortNode(querySort, parser);
        }
    }

    public getSort(): SortNode {
        return this.sort;
    }

    public getColumns(): string[]  {
        return this.columns.getColumns();
    }

    public getColumnsApplyKeys(): string[]  {
        return this.columns.getColumnsApplyKeys();
    }

    public getSortApplyKeys(): string[] {
        let sortKeys: string[] = [];
        if (this.sort !== null) {
            sortKeys = this.sort.getSortKeys();
        }
        return sortKeys;
    }
}
