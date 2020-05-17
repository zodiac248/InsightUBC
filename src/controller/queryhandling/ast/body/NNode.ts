import {Course} from "../../../Course";
import {InsightError} from "../../../IInsightFacade";
import {BodyNode} from "./BodyNode";
import {AbstractSyntaxTree} from "../AbstractSyntaxTree";
import {InsightDataObject} from "../../../InsightDataObject";
import {QueryParser} from "../../QueryParser";

export class NNode extends BodyNode {
    private nodeValue: BodyNode;

    public constructor(value: object, parser: QueryParser) {
        super(parser);
        this.negation(value);
    }

    public evaluateNode(insightItem: InsightDataObject): boolean {
        return !this.nodeValue.evaluateNode(insightItem);
    }

    private negation(value: any): void {
        if (!this.isAnObject(value)) {
            throw new InsightError("NOT must be an object");
        }
        if (Object.keys(value).length !== 1) {
            throw new InsightError("Not should have 1 key, has " + Object.keys(value).length);
        }
        this.nodeValue = this.parser.buildBodyNode(value);
    }

}
