import {QueryParser} from "../../QueryParser";
import {ASTNode} from "../ASTNode";
import {InsightError} from "../../../IInsightFacade";

export class DirectionNode extends ASTNode {
    private dirKey: string;

    public constructor(queryDirection: string, parser: QueryParser) {
        super(parser);
        this.id = parser.getID();
        this.setDirection(queryDirection);
    }

    private setDirection(queryDirection: string): void {
        if (queryDirection === "UP" || queryDirection === "DOWN") {
            this.dirKey = queryDirection;
        } else {
            throw new InsightError("Invalid direction key in dir");
        }
    }

    public getDirection(): string {
        return this.dirKey;
    }

}
