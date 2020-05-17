/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = function (query) {
    return new Promise(function (fulfill, reject) {
        let url = 'http://localhost:4321/query'
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('content-type', 'application/json; charset=utf-8');
        xhr.onload = function () {
            if (xhr.status === 200) {
                fulfill(xhr.responseText);
            } else {
                reject(xhr.responseText);
            }
        };
        try {
            xhr.send(JSON.stringify(query));
        } catch (error) {
            reject({
                error
            });
        }
    });
};
