import {AbstractSyntaxTree} from "./ast/AbstractSyntaxTree";
import {QueryValidator} from "./QueryValidator";
import {ResultManager} from "./ResultManager";
import {ResultTransformer} from "./ResultTransformer";
import {InsightDataset, InsightError, ResultTooLargeError} from "../IInsightFacade";
import {Courseset} from "../Courseset";
import InsightFacade from "../InsightFacade";
import {QueryParser} from "./QueryParser";
import {RoomSet} from "../RoomSet";
import {InsightDataObject} from "../InsightDataObject";
import {AbstractInsightDataset} from "../AbstractInsightDataset";

export class QueryEngine {
    private parent: InsightFacade;
    private AST: AbstractSyntaxTree;
    private validator: QueryValidator;
    private manager: ResultManager;

    public executeQuery(query: any, parent: InsightFacade): any[] {

        this.parent = parent;
        this.validator = new QueryValidator();
        let parser = new QueryParser();

        this.AST = parser.parse(query);
        this.validator.validateQuerySemantics(this.AST);
        this.manager = new ResultManager(this.AST);

        let id = this.AST.getID();
        this.initializeDataset(id);


        let contents: InsightDataObject[];


        let datasets: AbstractInsightDataset[] = this.parent.getDatasetList();
        let dataset = datasets.find((t) => t.id === id);
        contents = dataset.getContents();

        for (let element of contents) {
            if (this.AST.evaluate(element)) {
                this.manager.buildResult(element);
            }
        }

        this.manager.transformResults(this.AST);
        this.manager.sortResults(this.AST);
        return this.manager.getResults();
    }

    public initializeDataset(id: string): void {
        let datasetSetID: string = null;

        let ids = this.parent.getIdList();

        for (let t of ids) {
            if (t === id) {
                datasetSetID = t;
            }
        }
        if (datasetSetID === null) {
            throw new InsightError("Invalid query, no dataset with that ID found");
        }
    }
}
