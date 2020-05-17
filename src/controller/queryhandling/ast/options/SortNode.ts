import {QueryParser} from "../../QueryParser";
import {ASTNode} from "../ASTNode";
import {DirectionNode} from "./DirectionNode";
import {KeysNode} from "./KeysNode";
import {InsightError} from "../../../IInsightFacade";

export class SortNode extends ASTNode {
    private anykey: string;
    private direction: DirectionNode;
    private keys: KeysNode;

    public constructor(querySort: any, parser: QueryParser) {
        super(parser);
        this.initializeChildren(querySort, parser);
    }

    private initializeChildren(querySort: any, parser: QueryParser): void {
        // TODO: handle two cases --> a single key or the direction + keys
        if (this.isAnObject(querySort)) {
            this.anykey = null;
            let direction = querySort["dir"];
            let keys = querySort["keys"];
            this.direction = new DirectionNode(direction, parser);
            this.keys = new KeysNode(keys, parser);
        } else if (typeof(querySort) === "string") {
            this.anykey = querySort;
        } else {
            throw new InsightError("Invalid input in SORT");
        }
    }

    public getAnyKey(): string {
        return this.anykey;
    }

    public getDirection(): string {
        return this.direction.getDirection();
    }

    public getKeys(): string[] {
        return this.keys.getKeys();
    }

    public getSortKeys(): string[] {
        if (this.anykey !== null) {
            return [this.getAnyKey()];
        } else {
            return this.getKeys();
        }
    }
}
