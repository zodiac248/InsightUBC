import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightDataObject} from "./InsightDataObject";

export abstract class AbstractInsightDataset implements InsightDataset {
    public id: string;
    public kind: InsightDatasetKind;
    public numRows: number;

    abstract getContents(): InsightDataObject[];
}
