import {QueryParser} from "../../QueryParser";
import {InsightDataObject} from "../../../InsightDataObject";
import {ASTNode} from "../ASTNode";

export abstract class BodyNode extends ASTNode {

    protected constructor(parser: QueryParser) {
        super(parser);
    }

    abstract evaluateNode(insightItem: InsightDataObject): boolean;
}
