import {InsightError} from "../../IInsightFacade";
import {Course} from "../../Course";
import {BodyNode} from "./body/BodyNode";
import {MNode} from "./body/MNode";
import {SNode} from "./body/SNode";
import {NNode} from "./body/NNode";
import {LNode} from "./body/LNode";
import {InsightDataObject} from "../../InsightDataObject";
import {RootNode} from "./RootNode";
import {OptionsNode} from "./options/OptionsNode";
import {TransformationsNode} from "./transformations/TransformationsNode";

export class AbstractSyntaxTree {
    private root: RootNode;
    private id: string;

    public setID(id: string) {
        this.id = id;
    }

    public setRoot(rootNode: RootNode): void {
        this.root = rootNode;
    }

    public getID(): string {
        return this.id;
    }

    public evaluate(insightItem: InsightDataObject): boolean {
        let body: BodyNode = this.root.getBody();
        if (body == null) {
            return true;
        }
        return body.evaluateNode(insightItem);
    }

    public getBody(): BodyNode {
        return this.root.getBody();
    }

    public getOptions(): OptionsNode {
        return this.root.getOptions();
    }

    public getTransformations(): TransformationsNode {
        return this.root.getTransformations();
    }
}
