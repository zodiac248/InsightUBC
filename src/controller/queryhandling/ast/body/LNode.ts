import {Course} from "../../../Course";
import {InsightError} from "../../../IInsightFacade";
import {BodyNode} from "./BodyNode";
import {InsightDataObject} from "../../../InsightDataObject";
import {QueryParser} from "../../QueryParser";

export class LNode extends BodyNode {
    private key: string;
    private nodeValue: BodyNode;
    private nodeChild: BodyNode;

    public constructor(keyValue: string, value: object, parser: QueryParser) {
        super(parser);
        this.LComparison(keyValue, value);
    }

    public evaluateNode(insightItem: InsightDataObject): boolean {
        if (this.key === "AND") {
            if (this.nodeChild === null) {
                let bool = this.nodeValue.evaluateNode(insightItem);
                return bool;
            } else {
                return (this.nodeValue.evaluateNode(insightItem) && this.nodeChild.evaluateNode(insightItem));
            }
        } else if (this.key === "OR") {
            if (this.nodeChild === null) {
                return this.nodeValue.evaluateNode(insightItem);
            } else {
                return (this.nodeValue.evaluateNode(insightItem) || this.nodeChild.evaluateNode(insightItem));
            }
        }
    }

    private LComparison(filter: string, value: any): void {
        if (!this.isAnArray(value)) {
            throw new InsightError(filter + " must be an array");
        }
        if (!value.length) { // value is an empty array
            throw new InsightError(filter + " must be nonempty array");
        }
        this.key = filter;

        let clone = value.slice(0);
        let firstObj = clone.shift();
        if (!this.isAnObject(firstObj)) {
            throw new InsightError("LComparison argument must be object");
        }
        if (Object.keys(firstObj).length === 0) {
            throw new InsightError("LComparison argument must be not be empty");
        }
        let firstValue = this.parser.buildBodyNode(firstObj);

        let restOfArrayValues = clone;

        if (!clone.length) { // if length 1, return object with single field
            this.nodeValue = firstValue;
            this.nodeChild = null;
        } else { // else recurse
            let newObject: any = {};
            newObject[filter] = restOfArrayValues;
            // {nextFilter: restOfArrayValues}
            let restValue = this.parser.buildBodyNode(newObject);
            this.nodeValue = firstValue;
            this.nodeChild =  restValue;
        }
    }
}
