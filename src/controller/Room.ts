import {InsightDataObject} from "./InsightDataObject";
import {InsightError} from "./IInsightFacade";

export class Room implements InsightDataObject {
    public fullname: string;
    public shortname: string;
    public num: string;
    public name: string;
    public address: string;
    public lat: number;
    public lon: number;
    public seats: number;
    public type: string;
    public furniture: string;
    public href: string;

    constructor() {
        this.fullname = null;
        this.shortname = null;
        this.num = null;
        this.name = null;
        this.address = null;
        this.lat = null;
        this.lon = null;
        this.seats = null;
        this.type = null;
        this.furniture = null;
        this.href = null;
    }

    public getField(val: string): any {
        switch (val) {
            case "fullname":
                return this.fullname;
            case "shortname":
                return this.shortname;
            case "number":
                return this.num;
            case "name":
                return this.name;
            case "address":
                return this.address;
            case "lat":
                return this.lat;
            case "lon":
                return this.lon;
            case "seats":
                return this.seats;
            case "type":
                return this.type;
            case "furniture":
                return this.furniture;
            case "href":
                return this.href;
            default:
                throw new InsightError("Invalid field for type ROOM");
        }
    }

    public validateRoom(): boolean {
        if (this.href === null || typeof this.href === "undefined") {
            return false;
        } else if (this.num === null || typeof this.num === "undefined") {
            return false;
        } else if (this.shortname === null || typeof this.shortname === "undefined") {
            return false;
        } else if (this.type === null || typeof this.type === "undefined") {
            return false;
        } else if (this.furniture === null || typeof this.furniture === "undefined") {
            return false;
        } else if (this.seats === null || typeof this.seats === "undefined") {
            return false;
        } else if (this.address === null || typeof this.address === "undefined") {
            return false;
        } else if (this.fullname === null || typeof this.fullname === "undefined") {
            return false;
        } else if (this.lat === null || typeof this.lat === "undefined") {
            return false;
        } else if (this.lon === null || typeof this.lon === "undefined") {
            return false;
        } else if (this.name === null || typeof this.name === "undefined") {
            return false;
        }
        return true;
    }

    public validateRoomTable (): boolean {
        if (typeof this.seats !== "undefined" && typeof this.num !== "undefined") {
            if (typeof this.furniture !== "undefined" && typeof this.type !== "undefined") {
                if (typeof this.href !== "undefined") {
                    if (this.seats !== null && this.furniture !== null && this.num !== null && this.type !== null ) {
                        if (this.href !== null) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

}
