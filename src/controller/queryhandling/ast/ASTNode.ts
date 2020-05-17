import {QueryParser} from "../QueryParser";
import {InsightDataObject} from "../../InsightDataObject";
import {InsightError} from "../../IInsightFacade";

export abstract class ASTNode {
    protected parser: QueryParser;
    protected id: string;

    public constructor(parser: QueryParser) {
        this.parser = parser;
    }

    public setId(id: string): void {
        if (this.parser.getID() === null || this.parser.getID() === undefined) {
            this.parser.setID(id);
        } else if (this.parser.getID() !== id) {
            throw new InsightError("id invalid");
        }
        this.id = id;
    }

    public isAnObject(item: any): boolean {
        return Object.prototype.toString.call(item).indexOf("Object") > -1 ;
    }

    public isAnArray(item: any): boolean {
        return Object.prototype.toString.call(item).indexOf("Array") > -1;
    }
}
