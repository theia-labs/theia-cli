/**
 * @param results
 * @return {{}[]}
 */
const examResultsFormatter = (results) => {
    return results.map(res => ({...res.participant, ...res.scores}))
}

module.exports = {examResultsFormatter}
