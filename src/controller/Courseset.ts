import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import {Course} from "./Course";
import {AbstractInsightDataset} from "./AbstractInsightDataset";

export class Courseset extends AbstractInsightDataset {
    public courses: Course[];


    public getContents(): Course[] {
        return this.courses;
    }

    public parseCourseset(tmplist: object[], id: string) {
        let finalCourses: Course[] = [];
        for (let i in Object.values(tmplist)) {
            if (tmplist[i] !== null) {
                let saves = Object.values(tmplist[i]);
                for (let j in Object.values(saves)) {
                    if (saves[j] !== null) {
                        finalCourses.push(saves[j]);
                    }
                }
            }
        }
        this.courses = finalCourses;
        this.id = id;
        this.kind = InsightDatasetKind.Courses;
        this.numRows = finalCourses.length;
        if (this.numRows === 0) {
            throw new InsightError();
        }
    }
}
