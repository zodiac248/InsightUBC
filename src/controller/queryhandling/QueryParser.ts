import {BodyNode} from "./ast/body/BodyNode";
import {InsightError} from "../IInsightFacade";
import {MNode} from "./ast/body/MNode";
import {SNode} from "./ast/body/SNode";
import {NNode} from "./ast/body/NNode";
import {LNode} from "./ast/body/LNode";
import {AbstractSyntaxTree} from "./ast/AbstractSyntaxTree";
import {OptionsNode} from "./ast/options/OptionsNode";
import {TransformationsNode} from "./ast/transformations/TransformationsNode";
import {RootNode} from "./ast/RootNode";

export class QueryParser {
    private id: string;

    public parse(query: any): AbstractSyntaxTree {
        this.validateQuerySyntax(query);
        let queryWhere = query["WHERE"];
        let queryOptions = query["OPTIONS"];
        let queryTransformations = query["TRANSFORMATIONS"];
        let newAST = new AbstractSyntaxTree();

        let body = this.buildBody(queryWhere, this);
        let options = this.buildOptions(queryOptions, this);

        let transformations = null;
        if (queryTransformations !== null && queryTransformations !== undefined) {
            transformations = this.buildTransformations(queryTransformations, this);
        }
        let root = new RootNode(this);

        root.setBody(body);
        root.setOptions(options);
        root.setTransformations(transformations);

        newAST.setRoot(root);
        newAST.setID(this.getID());
        return newAST;
    }

    public setID(id: string): void {
        this.id = id;
    }

    public getID(): string {
        return this.id;
    }

    public buildBody(queryBody: any, parser: QueryParser): BodyNode {
         return this.buildBodyNode(queryBody);
    }

    public buildOptions(queryOptions: any, parser: QueryParser) {

        return new OptionsNode(queryOptions, parser);
    }

    public buildTransformations(queryTransformations: any, parser: QueryParser) {
        return new TransformationsNode(queryTransformations, parser);
    }

    public buildBodyNode(curr: any): BodyNode {
        let keys = Object.keys(curr);
        let values: any = Object.values(curr);
        let filter = keys[0];
        let value = values[0];
        if (!keys.length) {
            return null;
        } else if (filter === "EQ" || filter === "LT" || filter === "GT") {
            return new MNode(filter, value, this);
        } else if (filter === "IS") {
            return new SNode(value, this);
        } else if (filter === "NOT") {
            return new NNode(value, this);
        } else if (filter === "AND" || filter === "OR") {
            return new LNode(filter, value, this);
        } else {
            throw new InsightError("Invalid Filter");
        }
    }

    public isAnObject(item: any): boolean {
        return Object.prototype.toString.call(item).indexOf("Object") > -1 ;
    }

    public isAnArray(item: any): boolean {
        return Object.prototype.toString.call(item).indexOf("Array") > -1;
    }

    // TODO: query can now have length 3 provided it has a transformations block
    public validateQuerySyntax(query: any): void {
        if (query["WHERE"] === null ||  query["OPTIONS"] === null) {
            throw new InsightError("Invalid query, WHERE or OPTIONS is null");
        }
        if (query["WHERE"] === undefined ||  query["OPTIONS"] === undefined) {
            throw new InsightError("Invalid query");
        }
        if (typeof query["WHERE"] !== "undefined" && typeof query["OPTIONS"] !== "undefined") {
            if (!this.isAnObject(query)) { // query must be an object
                throw new InsightError("Invalid query");
            }
            if (!this.isAnObject(query["WHERE"])) { // where must be an object
                throw new InsightError("Invalid query");
            }
            if (Object.keys(query["WHERE"]).length > 1) {
                throw new InsightError("WHERE should have at most 1 key, has " + Object.keys(query["WHERE"]).length);
            }
            if (Object.keys(query).length === 2 ||
                Object.keys(query).length === 3
                && (query["TRANSFORMATIONS"] !== undefined && query["TRANSFORMATIONS"] !== undefined )) {
                return;
            } else {
                throw new InsightError("Invalid query");
            }
        } else {
            throw new InsightError("Invalid query");
        }
    }
}
