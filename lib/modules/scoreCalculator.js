const ResourceFinder = require('../api/resourceFinder')
const formatter = require('../utils/formatter')
const csvBuilder = require('../utils/csvBuilder')
const exporter = require('../utils/exporter')

async function calculateAndExportScore({examId, token, environment}) {
    const examScore = await calculateScore({examId, token, environment})
    const formattedResults = formatter.examResultsFormatter(examScore.results)
    const fileContent = csvBuilder.buildCsvContent([
        {property: 'participant', title: 'Participant'},
        {property: 'averageWithFolderWeight', title: 'Moyenne pondérée'},
        {property: 'averageWithoutFolderWeight', title: 'Moyenne standard'}
    ], formattedResults)
    exporter.exportFile(process.env.EXPORT_PATH, exporter.EXPORT_TYPES.examScore, examId, exporter.FORMATS.csv, fileContent)
}

async function calculateScore({examId, token, environment}) {
    const resourceFinder = new ResourceFinder(token, environment)

    const exam = await resourceFinder.fetchExam(examId)
        .catch(() => {
        })

    const results = await resourceFinder.fetchParticipantsResults(examId)
        .catch(() => {
        })

    const participantList = await resourceFinder.fetchExamParticipants(examId)
        .then(res => res['hydra:member'])
        .catch(() => {
        })

    const formattedResults = results['hydra:member'].map(async (participantResults) => ({
        participant: await getParticipantName(participantResults['@id'], participantList, resourceFinder),
        scores: getScoreByAssessmentSession(participantResults.assessmentSessions[0])
    }))

    return {
        exam: exam.title,
        results: await Promise.all(formattedResults).then(res => res)
    }
}

const getScoreByAssessmentSession = (assessmentSession) => {
    if (assessmentSession !== undefined && assessmentSession.hasOwnProperty('questionFoldersResults')) {
        const foldersScore = assessmentSession.questionFoldersResults.map(
            ({correctionConfiguration, questionResults}) => (
                {
                    folder: correctionConfiguration.questionnaireQuestionFolder,
                    folderWeight: correctionConfiguration.weight,
                    questionsTotalScore: questionResults.reduce((acc, curr) => (acc + (curr.score * curr.correctionConfiguration.weight)), 0),
                    questionsTotalWeight: questionResults.reduce((acc, curr) => acc + curr.correctionConfiguration.weight, 0)
                }
            )
        )
        const totalWithFolderWeight = foldersScore.reduce((acc, curr) => ({
            score: acc.score + (curr.questionsTotalScore * curr.folderWeight),
            weight: acc.weight + (curr.folderWeight * curr.questionsTotalWeight)
        }), {score: 0, weight: 0})
        const totalWithoutFolderWeight = foldersScore.reduce((acc, curr) => ({
            score: acc.score + curr.questionsTotalScore,
            weight: acc.weight + curr.questionsTotalWeight
        }), {score: 0, weight: 0})

        return {
            foldersScore,
            averageWithFolderWeight: totalWithFolderWeight.score / totalWithFolderWeight.weight,
            averageWithoutFolderWeight: totalWithoutFolderWeight.score / totalWithoutFolderWeight.weight
        }
    }
}

async function getParticipantName(participantId, participantList, resourceFinder) {
    const participant = participantList.filter(part => part['@id'] === participantId)[0]
    const user = await resourceFinder.fetchResource(participant.user)
        .catch(() => {
        })

    return `${user.firstName} ${user.lastName}`
}

module.exports = {calculateAndExportScore}