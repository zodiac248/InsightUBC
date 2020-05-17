import {QueryParser} from "../../QueryParser";
import {ASTNode} from "../ASTNode";
import {ApplyNode} from "./ApplyNode";
import {GroupNode} from "./GroupNode";
import {InsightError} from "../../../IInsightFacade";

export class TransformationsNode extends ASTNode {
    private groupNode: GroupNode;
    private applyNode: ApplyNode;

    public constructor(queryTransformations: any, parser: QueryParser) {
        super(parser);
        this.id = parser.getID();
        this.initializeChildren(queryTransformations, parser);
    }

    public initializeChildren(queryTransformations: any, parser: QueryParser) {
        let transformationsValues = Object.values(queryTransformations);
        if (transformationsValues.length !== 2) {
            throw new InsightError("TRANSFORMATIONS must have 2 arguments, has " + transformationsValues.length);
        }

        let queryGroup = queryTransformations["GROUP"];
        let queryApply = queryTransformations["APPLY"];

        this.groupNode = new GroupNode(queryGroup, parser);
        this.applyNode = new ApplyNode(queryApply, parser);
    }

    public getGroups(): string[] {
        return this.groupNode.getGroups();
    }

    public getApplyRules() {
        return this.applyNode.getApplyRules();
    }

    public getApplyKeys() {
        return this.applyNode.getApplyKeys();
    }

}
