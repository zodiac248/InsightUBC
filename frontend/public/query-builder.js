/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */

const CoursNeedToBeNumberKeys = [
    "avg", "pass", "fail", "audit", "year"
];
const RoomNeedToBeNumberKeys = [
    "lat", "lon", "seats"
];

const Keys = ["audit", "avg", "dept", "fail", "id", "instructor", "pass", "title", "uuid", "year", "address", "fullname", "furniture", "href", "lat", "lon", "name", "number", "shortname", "type",
    "seats"
];
const TYPE_COURSE = "courses";
const TYPE_ROOM = "rooms";

CampusExplorer.buildQuery = function () {
    //get the current webpage that is active, whether it is a rooms or courses
    let type = getActiveType();
    //create a json variable where to get all the conditions in the document
    let WHERE = generateConditions(type);
    //create a jason object where to get all the conditions in the document
    let COLUMNS = generateColumns(type);
    let ORDER = generateOrder(type);
    let GROUP = generateGroup(type);
    let APPLY = generateTransformations(type);
    let query = {
        WHERE,
        OPTIONS: {
            COLUMNS
        }
    };
    if (ORDER.length > 0) {
        query.OPTIONS.ORDER = {
            dir: getOrderDirection(type),
            keys: ORDER
        }
    }
    if (APPLY.length > 0) {
        query.TRANSFORMATIONS = {
            GROUP,
            APPLY
        }
    }
    return query;
};

function getActiveType() {
    //if the text inside the element nav-item tab active is courses, then set the active type to courses, otherwise set to room
    if (document.getElementsByClassName("nav-item tab active")[0].text === "Courses") {
        return TYPE_COURSE;
    } else {
        return TYPE_ROOM;
    }
}

function getOrderDirection(type) {
    //fitst check the current active type, and then go into the corresponding control descending element to check whether the checkbox is checked
    let index = type == TYPE_COURSE ? 0 : 1;
    if (document.getElementsByClassName("control descending")[index].getElementsByTagName("input")[0].checked) {
        //if it is checked, we set the direction to down, otherwise we set it to up
        return "DOWN";
    } else {
        return "UP";
    }
}

function generateTransformations(type) {
    //first check the type
    let index = type == TYPE_COURSE ? 0 : 1;
    let result = [];
    //then we have to go into the corresponding type transformations-container element and get all transformations
    let trans = document.getElementsByClassName("transformations-container")[index].getElementsByClassName('control-group transformation');
    //then we iterate over all transformations, and for each transformation, we will get the fields they choose, and the alias they enter and also the aggregation they apply
    for (let tran of trans) {
        let term = tran.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value;
        let transSelect = tran.getElementsByClassName("control operators")[0].getElementsByTagName("select")[0];
        let operator = transSelect.options[transSelect.selectedIndex].text.trim().toUpperCase();
        let keySelect = tran.getElementsByClassName("control fields")[0].getElementsByTagName("select")[0];
        let trans_key = keySelect.options[keySelect.selectedIndex].value.trim().toLowerCase();
        //we create an object, you can think it as a single transformation
        let obj = {};
        obj[term] = {};
        obj[term][operator] = type + "_" + trans_key;
        result.push(obj)
    }
    return result;
}

function generateGroup(type) {
    let index = type == TYPE_COURSE ? 0 : 1;
    let result = [];
    let columns = document.getElementsByClassName("form-group groups")[index].getElementsByClassName("control field");
    for (const column of columns) {
        let input = column.getElementsByTagName("input")[0]
        if (input.checked) {
            result.push(type + "_" + input.getAttribute("data-key").trim());
        }
    }
    return result;
}

function generateOrder(type) {
    let index = type == TYPE_COURSE ? 0 : 1;
    let result = [];
    let orders = document.getElementsByClassName("form-group order")[index].getElementsByTagName("option");
    for (const order of orders) {
        if (order.selected) {
            let key = order.value.trim().toLowerCase();
            key = Keys.includes(key) ? (type + "_" + key) : key
            result.push(key)
        }
    }
    return result;
}

function generateConditions(type) {
    let index = type == TYPE_COURSE ? 0 : 1;
    let count = 0;
    let arr = [];
    let conditions = document.getElementsByClassName("conditions-container")[index].getElementsByClassName('control-group condition');
    for (const condition of conditions) {
        let control_not = condition.getElementsByClassName("control not")[0].getElementsByTagName("input")[0].checked;
        let fieldSelect = condition.getElementsByClassName("control fields")[0].getElementsByTagName("select")[0];
        let key = fieldSelect.options[fieldSelect.selectedIndex].value.trim().toLowerCase();
        let operatorSelect = condition.getElementsByClassName("control operators")[0].getElementsByTagName("select")[0];
        let operator = operatorSelect.options[operatorSelect.selectedIndex].text.trim().toUpperCase();
        let controlValue = condition.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value.trim();
        let obj = {};
        obj[operator] = {};
        if ((type === TYPE_COURSE && CoursNeedToBeNumberKeys.includes(key)) || (type === TYPE_ROOM && RoomNeedToBeNumberKeys.includes(key))) {
            obj[operator][type + "_" + key] = Number(controlValue);
        } else {
            obj[operator][type + "_" + key] = controlValue;
        }
        obj = control_not ? {
            NOT: obj
        } : obj
        arr.push(obj);
        count++;
    }

    let select = 0;
    //0 is  all of the following, 1 is any of the following and 2 is none of the following
    let conditionTypes = document.getElementsByClassName("control-group condition-type")[index].getElementsByTagName('input');
    for (let i = 0; i < conditionTypes.length; i++) {
        if (conditionTypes[i].checked) {
            select = i;
        }
    }
    let result;
    if (count == 0) {
        result = {};
    } else if (count == 1) {
        result = select === 2 ? {
            NOT: arr[0]
        } : arr[0];
    } else {
        if (select === 0) {
            result = {
                AND: arr
            }
        } else if (select === 1) {
            result = {
                OR: arr
            }
        } else {
            result = {
                NOT: {
                    AND: arr
                }
            }
        }
    }
    return result;
}

function generateColumns(type) {
    let index = type == TYPE_COURSE ? 0 : 1;
    let result = [];
    let columns = document.getElementsByClassName("form-group columns")[index]
        .getElementsByClassName("control field");
    for (const column of columns) {
        let input = column.getElementsByTagName("input")[0];
        if (input.checked) {
            result.push(type + "_" + input.getAttribute("data-key").trim());
        }
    }

    let transformationcolumns = document.getElementsByClassName("form-group columns")[index].getElementsByClassName("control transformation");
    for (const column of transformationcolumns) {
        let input = column.getElementsByTagName("input")[0];
        if (input.checked) {
            result.push( input.getAttribute("data-key").trim());
        }
    }
    return result;
}
