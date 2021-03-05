/**
 * @param results
 * @return {{}[]}
 */
const examResultsFormatter = (results) => {
    return results.map(res => ({...res.participant, ...res.scores}))
}

const multipleExamResultsFormatter = (results) => {
    return results.map(res => ({...res.participant, ...res.scores, exam: res.exam}))
}

module.exports = {examResultsFormatter, multipleExamResultsFormatter}
