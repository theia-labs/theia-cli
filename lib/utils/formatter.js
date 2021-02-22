/**
 * @param results
 * @return {{}[]}
 */
const examResultsFormatter = (results) => {
    return results.map(res => ({participant: res.participant, ...res.scores}))
}

module.exports = {examResultsFormatter}