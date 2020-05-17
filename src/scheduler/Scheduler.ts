import {IScheduler, SchedRoom, SchedSection, TimeSlot} from "./IScheduler";

export default class Scheduler implements IScheduler {
    private distanceNormalizer: number = 1372;
    private totalEnrollment: number;
    private timeSlots: TimeSlot[] = ["MWF 0800-0900", "MWF 0900-1000", "MWF 1000-1100",
        "MWF 1100-1200", "MWF 1200-1300", "MWF 1300-1400",
        "MWF 1400-1500", "MWF 1500-1600", "MWF 1600-1700",
        "TR  0800-0930", "TR  0930-1100", "TR  1100-1230",
        "TR  1230-1400", "TR  1400-1530", "TR  1530-1700"];

    private result: Array<[SchedRoom, SchedSection, TimeSlot]>;
    private maxDistance: number;
    // map each room by its id to its capacity
    private roomsMap: Map<string, number>;
    // Map each section by uuid to its number of students
    private sectionsMap: Map<string, number>;
    // Store times when rooms are booked
    private roomsBookingsMap: Map<string, TimeSlot[]>;
    // Stores buildings in order of preference
    private buildings: string[];
    // Stores buildings in order of preference
    private selectedBuildings: string[];
    // Stores rooms that haven't been selected yet by building
    private availableRoomsByBuilding: Map<string, SchedRoom[]>;
    // Stores building geo locations
    private buildingLocations: Map<string, object>;
    // Stores building geo locations
    private maxDistances: Map<string, number>;
    // Store rooms that are not fully booked
    private availableSelectedRooms: SchedRoom[];

    public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {

        this.initializeScheduler(sections, rooms);
        sections  = this.sortSections(sections);
        let scheduledEnrollment = 0;
        for (let section of sections) {
            let fitResult = this.findBestFit(section);
            let room =  fitResult[0];
            let slot = fitResult[1];
            if (!(room === null || typeof room === "undefined")) {
                scheduledEnrollment += this.sectionsMap.get(section["courses_uuid"]);
                this.maxDistance = Math.max(this.maxDistance, this.getMaxDistance(room["rooms_shortname"]));
                this.buildResult(section, room, slot);
            }
        }
        return this.result;
    }

    private isWorthAdding(scheduledEnrollment: number, room: SchedRoom): boolean {
        if (this.result.length === 0 ) {
            this.maxDistances.set(room["rooms_shortname"], 0);
            return true;
        }
        let E = scheduledEnrollment / this.totalEnrollment;
        let newMax  = Math.max(this.maxDistance, this.getMaxDistance(room["rooms_shortname"]));
        let changeInD = Math.abs(this.maxDistance - newMax) / this.distanceNormalizer;
        return 0.7 * (1 - E) > 0.3 * changeInD;
    }

    public findBestFit(section: SchedSection): [SchedRoom, TimeSlot] {
        let bestRoom: SchedRoom;
        let bestTime: TimeSlot;
        if (this.isCurrentRoomAvailable(section)) {
            [bestRoom, bestTime] = this.findCurrentRoom(section);
            this.updateRoomStatus(bestRoom, bestTime);
            return [bestRoom, bestTime];
        } else {
            [bestRoom, bestTime] = this.findAvailableRoom(section);
            return [bestRoom, bestTime];
        }
    }

    public isCurrentRoomAvailable(section: SchedSection): boolean {
        for (let room of this.availableSelectedRooms) {
            if (this.fitsSection(room, section)) {
                return true;
            }
        }
        return false;
    }

    private fitsSection(room: SchedRoom, section: SchedSection) {
        return this.roomsMap.get(room["rooms_shortname"] + room["rooms_number"])
            >= this.sectionsMap.get(section["courses_uuid"]);
    }

    public findCurrentRoom(section: SchedSection): [SchedRoom, TimeSlot] {
        for (let room of this.availableSelectedRooms) {
            if (this.fitsSection(room, section)) {
                let time = this.findAvailableTime(room);
                return [room, time];
            }
        }
    }

    private findAvailableTime(room: SchedRoom) {
        let roomTimeSlots = this.roomsBookingsMap.get(room["rooms_shortname"] + room["rooms_number"]);
        for (let time of this.timeSlots) {
            if (!roomTimeSlots.includes(time)) {
                return time;
            }
        }
    }

    public updateRoomStatus(room: SchedRoom, slot: TimeSlot): void {
        let slots = this.roomsBookingsMap.get(room["rooms_shortname"] + room["rooms_number"]);
        slots.push(slot);
        if (slots.length >= this.timeSlots.length) {
            this.availableSelectedRooms = this.availableSelectedRooms.filter(
                (selRoom) => (selRoom["rooms_shortname"] + selRoom["rooms_number"])
                    !== (room["rooms_shortname"] + room["rooms_number"]));
        }
    }

    public findAvailableRoom (section: SchedSection): [SchedRoom, TimeSlot] {
        // Otherwise search for rooms that are closest to chosen buildings
        if (this.roomsBookingsMap.keys.length === 0) {
            this.updateInitialRankings();
        } else {
            this.updateRankings();
        }
        for (let building of this.buildings) {
            let buildingRooms: SchedRoom[] = this.availableRoomsByBuilding.get(building);
            for (let room of buildingRooms) {
                if (this.fitsSection(room, section)) {
                    // validRooms.push(room);
                    buildingRooms = buildingRooms.filter(
                        (selRoom) => (selRoom["rooms_shortname"] + selRoom["rooms_number"])
                            !== (room["rooms_shortname"] + room["rooms_number"]));
                    this.availableRoomsByBuilding.set(building, buildingRooms);
                    this.availableSelectedRooms.push(room);
                    this.roomsBookingsMap.set(room["rooms_shortname"] + room["rooms_number"], ["MWF 0800-0900"]);
                    return [room, "MWF 0800-0900"];
                }
            }
        }
        return [null, null];
    }

    private updateInitialRankings(): void {
        // Choose building with the most seats
        let buildings = this.buildings;
        // Sort based on maximum distances
        let privateMap = new Map<string, number>();
        for (let building of buildings) {
            let rooms = this.availableRoomsByBuilding.get(building);
            let total = 0;
            for (let room of rooms) {
                total += this.roomsMap.get(room["rooms_shortname"] + room["rooms_number"]);
            }
            privateMap.set(building, total);
        }
        if (buildings.length > 1) {
            buildings.sort((buildingA: string, buildingB: string) => {
                if (privateMap.get(buildingA) < privateMap.get(buildingB)) {
                    return 1;
                }
                if (privateMap.get(buildingA) > privateMap.get(buildingB)) {
                    return -1;
                }
                return 0;
            });
        }
        this.buildings = buildings;
    }

    private updateRankings(): void {
        let buildings = this.buildings;
        // Update maximum distances
        for (let building of buildings) {
            let newMax = this.computeMaxDistance(building);
            this.maxDistances.set(building, newMax);
        }
        // Sort based on maximum distances
        if (buildings.length > 1) {
            buildings.sort((buildingA: string, buildingB: string) => {
                if (this.getMaxDistance(buildingA) < this.getMaxDistance(buildingB)) {
                    return -1;
                }
                if (this.getMaxDistance(buildingA) > this.getMaxDistance(buildingB)) {
                    return 1;
                }
                return 0;
            });
        }
        this.buildings = buildings;
    }

    private getMaxDistance( buildingName: string): number {
        return this.maxDistances.get(buildingName);
    }

    private computeMaxDistance(buildingName: string): number {
        let maxDistance = 0;
        for (let selectedBuilding of this.selectedBuildings) {
            let newDistance = this.computeDistance(selectedBuilding, buildingName);
            if (newDistance > maxDistance) {
                maxDistance = newDistance;
            }
        }
        return maxDistance;
    }

    private computeDistance( buildingName1: string, buildingName2: string): number {
        function toRad(x: number) {
            return x * Math.PI / 180;
        }
        // Computes distance using the haversine formula code
        // from the linked source at https://www.movable-type.co.uk/scripts/latlong.html
        let geo1: any = this.buildingLocations.get(buildingName1);
        let geo2: any = this.buildingLocations.get(buildingName2);
        let lat1 = geo1["lat"];
        let lon1 = geo1["lon"];
        let lat2 = geo2["lat"];
        let lon2 = geo2["lon"];

        let R = 6371e3; // metres
        let φ1 = lat1.toRadians();
        let φ2 = lat2.toRadians();
        let Δφ = toRad(lat2 - lat1);
        let Δλ = toRad(lon2 - lon1);

        let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        let d = R * c;
        return  d;
    }

    public sortSections(sections: SchedSection[]): SchedSection[] {
        if (sections.length > 1) {
            sections.sort((resultA: SchedSection, resultB: SchedSection) => {
                if (this.getSectionSize(resultA) < this.getSectionSize(resultB)) {
                    return 1;
                }
                if (this.getSectionSize(resultA) > this.getSectionSize(resultB)) {
                    return -1;
                }
                return 0;
            });
        }
        return sections;
    }

    public getSectionSize(section: SchedSection): number {
        return this.sectionsMap.get(section["courses_uuid"]);
    }

    public initializeScheduler(sections: SchedSection[], rooms: SchedRoom[]): void {
        // Initialize results
        this.result = [];
        let totalEnrollment = 0;
        // Initialize map from sections to size
        this.sectionsMap = new Map<string, number>();
        for (let section of sections) {
            this.sectionsMap.set(section["courses_uuid"], this.initializeSectionSize(section));
            totalEnrollment += this.sectionsMap.get(section["courses_uuid"]);
        }
        this.totalEnrollment = totalEnrollment;
        this.maxDistance = 0;
        // Initialize map from rooms to size
        this.roomsMap = new Map<string, number>();
        for (let room of rooms) {
            this.roomsMap.set(room["rooms_shortname"] + room["rooms_number"], room["rooms_seats"]);
        }
        // Initialize rooms maps
        this.buildings = [];
        // Stores rooms that haven't been selected yet by building
        this.availableRoomsByBuilding = new Map<string, SchedRoom[]>();
        // Stores building geo locations
        this.buildingLocations = new Map<string, object>();
        for (let room of rooms) {
            if (!this.buildings.includes(room["rooms_shortname"])) {
                this.buildings.push(room["rooms_shortname"]);
                this.buildingLocations.set(room["rooms_shortname"], {lat: room["rooms_lat"], lon: room["rooms_lon"]});
                this.availableRoomsByBuilding.set(room["rooms_shortname"], [room]);
            } else {
                this.availableRoomsByBuilding.get(room["rooms_shortname"]).push(room);
            }
        }
        this.selectedBuildings = [];
        this.availableSelectedRooms = [];
        // Initialize map from rooms to bookings
        this.roomsBookingsMap = new Map<string, TimeSlot[]>();
        this.maxDistances = new Map<string, number>();
    }

    public initializeSectionSize(section: SchedSection): number {
        return section["courses_pass"] + section["courses_fail"] + section["courses_audit"];
    }

    public buildResult(section: SchedSection, room: SchedRoom, slot: TimeSlot): void {
        this.result.push([room, section, slot]);
    }
}
