const fetch = window.fetch
const alert = window.alert

const _get = url => fetch(url, {
    method: "GET",
    headers: {
        "Accept": "application/json"
    },
    credentials: "same-origin"
})
    .then(res => res.json(),
        err => alert(err))

/**
 * Generic POST. Posts JSON, expects JSON.
 */
const _post = (url, data) => fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    credentials: "same-origin"
})
    .then(res => res.json(),
        err => alert(err))

/**
 * Generic PUT. Posts JSON, expects JSON.
 */
const _put = (url, data) => fetch(url, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    credentials: "same-origin"
})
    .then(res => res.json(),
        err => alert(err))

/**
 * Generic DELETE. Expects JSON.
 */
const _delete = url => fetch(url, {
    method: "DELETE",
    headers: {
        "Accept": "application/json"
    },
    credentials: "same-origin"
})
    .then(res => res.json(),
        err => alert(err))

/**
 * SPECIFIC REQUESTS
 */

const FETCH_LIMIT = 15

async function getValues() {
    return _get("/values")
}

/**
 * If pid is undefined, fetch records from all radiology otherwise fetch records for the patient with `pid`
 * @param pid
 * @param offset
 * @returns {Promise<*>}
 */
async function getRadiologyFor(pid, offset) {
    return !pid ? _get(`/radiology/records/${FETCH_LIMIT}/${offset}`) : _get(`/radiology/records/for/${pid}/${FETCH_LIMIT}/${offset}`)
}

async function getRadiologyTotalRowsFor(pid) {
    return !pid ? _get(`/radiology/rows`) : _get(`/radiology/rows/for/${pid}`)
}

async function getFeaturesFor(report_uid) {
    return _get(`/features/for/${report_uid}`)
}

async function getStrokeFeaturesFor(report_uid) {
    return _get(`/features/stroke/for/${report_uid}`)
}

async function getAngioFeaturesFor(report_uid) {
    return _get(`/features/angio/for/${report_uid}`)
}

async function getDegenerativeFeaturesFor(report_uid) {
    return _get(`/features/degenerative/for/${report_uid}`)
}

async function createStrokeFeature(data) {
    return _post("/features/stroke", data)
}

async function createAngioFeature(data) {
    return _post("/features/angio", data)
}

async function createDegenerativeFeature(data) {
    return _post("/features/degenerative", data)
}

async function updateStrokeFeature(data) {
    return _put("/features/stroke", data)
}

async function updateAngioFeature(data) {
    return _put("/features/angio", data)
}

async function updateDegenerativeFeature(data) {
    return _put("/features/degenerative", data)
}

async function deleteStrokeFeature(id) {
    return _delete(`/features/stroke/${id}`)
}

async function deleteAngioFeature(id) {
    return _delete(`/features/angio/${id}`)
}

async function deleteDegenerativeFeature(id) {
    return _delete(`/features/degenerative/${id}`)
}

export {
    FETCH_LIMIT,
    getValues,
    getRadiologyFor,
    getRadiologyTotalRowsFor,
    getFeaturesFor,
    getStrokeFeaturesFor,
    getAngioFeaturesFor,
    getDegenerativeFeaturesFor,
    createStrokeFeature,
    createAngioFeature,
    createDegenerativeFeature,
    updateStrokeFeature,
    updateAngioFeature,
    updateDegenerativeFeature,
    deleteStrokeFeature,
    deleteAngioFeature,
    deleteDegenerativeFeature
}
