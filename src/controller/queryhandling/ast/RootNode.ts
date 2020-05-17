import {QueryParser} from ".././QueryParser";
import {ASTNode} from "./ASTNode";
import {BodyNode} from "./body/BodyNode";
import {OptionsNode} from "./options/OptionsNode";
import {TransformationsNode} from "./transformations/TransformationsNode";

export class RootNode extends ASTNode {
    private bodyNode: BodyNode;
    private optionsNode: OptionsNode;
    private transformationsNode: TransformationsNode;

    public constructor(parser: QueryParser) {
        super(parser);
        this.id = parser.getID();
    }

    public setBody(body: BodyNode): void {
        this.bodyNode = body;
    }

    public setOptions(options: OptionsNode):  void {
        this.optionsNode = options;
    }

    public setTransformations(transformations: TransformationsNode): void {
        this.transformationsNode = transformations;
    }

    public getBody(): BodyNode {
        return this.bodyNode;
    }

    public getOptions(): OptionsNode {
        return this.optionsNode;
    }

    public getTransformations(): TransformationsNode {
        return this.transformationsNode;
    }
}
