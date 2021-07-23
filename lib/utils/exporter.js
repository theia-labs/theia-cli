const fs = require('fs')
const path = require('path')

function exportFile (locationPath, exportType, format, content, resourceId = null) {
    const date = new Date();

    let filename;
    if (resourceId === null) {
        filename = path.join(locationPath, `${exportType}_${date.getTime()}.${format}`);
    } else {
        filename = path.join(locationPath, `${exportType}_${resourceId}_${date.getTime()}.${format}`);
    }
    fs.writeFileSync(filename, content);
}

const EXPORT_TYPES = {
    examScore: 'exam_score',
    allExamsScore: 'all_exams_scores',
    groupSubscriptionRules: 'group_subscription_rules'
}

const FORMATS = {
    csv: 'csv',
    json: 'json'
}

module.exports = {exportFile, EXPORT_TYPES, FORMATS}
