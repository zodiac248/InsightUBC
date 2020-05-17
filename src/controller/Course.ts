import {InsightDataObject} from "./InsightDataObject";
import {InsightError} from "./IInsightFacade";
import {QueryValidator} from "./queryhandling/QueryValidator";

export class Course implements InsightDataObject {
    public section: string;
    public dept: string;
    public id: string;
    public avg: number;
    public instructor: string;
    public title: string;
    public pass: number;
    public fail: number;
    public audit: number;
    public uuid: string;
    public year: number;
    constructor() {
        this.dept = null;
        this.id = null;
        this.avg = null;
        this. instructor = null;
        this.title = null;
        this.pass = null;
        this.fail = null;
        this.audit = null;
        this.uuid = null;
        this.year = null;
        this.section = null;
    }

    public getField(val: string): any {
        switch (val) {
            case "section":
                return this.section;
            case "dept":
                return this.dept;
            case "id":
                return this.id;
            case "avg":
                return this.avg;
            case "instructor":
                return this.instructor;
            case "title":
                return this.title;
            case "pass":
                return this.pass;
            case "fail":
                return this.fail;
            case "audit":
                return this.audit;
            case "uuid":
                return this.uuid;
            case "year":
                return this.year;
            default:
                throw new InsightError("Invalid field for type COURSE");
        }
    }

    public generateCourse(val: object): Course {
        let isOverall: boolean;
        let validated: QueryValidator = new QueryValidator();
        for (let entry of Object.entries(val)) {
            if (entry[0] === "Section") {
                if (entry[1] === "overall") {
                    isOverall = true;
                }
                this.section = entry[1];
            }
        }
        for (let entry of Object.entries(val)) {
            if (entry[0] === "Avg") {
                this.avg = Number(entry[1]);
            } else if (entry[0] === "Professor") {
                this.instructor = entry[1];
            } else if (entry[0] === "Title") {
                this.title = entry[1];
            } else if (entry[0] === "Pass") {
                this.pass = Number(entry[1]);
            } else if (entry[0] === "Fail") {
                this.fail = Number(entry[1]);
            } else if (entry[0] === "Audit") {
                this.audit = Number(entry[1]);
            } else if (entry[0] === "id") {
                this.uuid = String(entry[1]);
            } else if (entry[0] === "Year") {
                if (isOverall === true) {
                    this.year = 1900;
                } else  {
                    this.year = Number(entry[1]);
                }
            }  else if ( entry[0] === "Subject" ) {
                this.dept = entry[1];
            } else if (entry[0] === "Course") {
                this.id = entry[1];
            }
        }
        if (this.validateCourse() === false) {
            return null;
        }
        return this;
    }


    public validateCourse(): boolean {
        if (this.year === null) {
            return false;
        } else if (this.id === null) {
            return false;
        } else if (this.dept === null) {
            return false;
        } else if (this.audit === null) {
            return false;
        } else if (this.fail === null) {
            return false;
        } else if (this.pass === null) {
            return false;
        } else if (this.title === null) {
            return false;
        } else if (this.year === null) {
            return false;
        } else if (this.instructor === null) {
            return false;
        } else if (this.avg === null) {
            return false;
        } else if (this.section === null) {
            return false;
        } else if (this.uuid === null) {
            return false;
        }
        return true;
    }
}

