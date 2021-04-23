const ResourceFinder = require('../api/resourceFinder')
const formatter = require('../utils/formatter')
const csvBuilder = require('../utils/csvBuilder')
const exporter = require('../utils/exporter')

class ScoreCalculator {
    resourceFinder;
    ratingScale;
    exportPath;

    constructor(resourceFinder, {ratingScale, exportPath}) {
        this.resourceFinder = resourceFinder;
        this.ratingScale = ratingScale;
        this.exportPath = exportPath;
    }

    async calculateAndExportScore({examId}) {
        const examScore = await this.calculateScore(examId)
        const formattedResults = formatter.examResultsFormatter(examScore.results)
        const fileContent = csvBuilder.buildCsvContent([
            {property: 'lastName', title: 'Nom'},
            {property: 'firstName', title: 'Prénom'},
            {property: 'averageWithFolderWeight', title: 'Moyenne pondérée'},
            {property: 'averageWithoutFolderWeight', title: 'Moyenne standard'}
        ], formattedResults)
        exporter.exportFile(this.exportPath, exporter.EXPORT_TYPES.examScore, exporter.FORMATS.csv, fileContent, examId)
    }

    async calculateAndExportScoreForMultipleExams() {
        const examScores = await this.calculateScoreForMultipleExams()
        const examScoresList = [];
        examScores.forEach(examScore => {examScoresList.push(...examScore.results.map(res => ({...res, exam: examScore.exam})))})
        const formattedResults = formatter.multipleExamResultsFormatter(examScoresList)
        const fileContent = csvBuilder.buildCsvContent([
            {property: 'username', title: 'Username'},
            {property: 'lastName', title: 'Nom'},
            {property: 'firstName', title: 'Prénom'},
            {property: 'exam', title: 'Examen'},
            {property: 'averageWithFolderWeight', title: 'Moyenne pondérée'},
            {property: 'averageWithoutFolderWeight', title: 'Moyenne standard'}
        ], formattedResults)
        exporter.exportFile(this.exportPath, exporter.EXPORT_TYPES.allExamsScore, exporter.FORMATS.csv, fileContent)
    }

    async calculateScore(examId) {
        const exam = await this.resourceFinder.fetchExam(examId)
            .catch(() => {
            })

        return this.getExamResults(exam)
    }

    async getExamResults(exam) {
        const resultList = (await this.resourceFinder.fetchParticipantsResults(exam['@id']))
            .filter(participantResults => participantResults.assessmentSessions[0] !== undefined && participantResults.assessmentSessions[0].status > 0)

        const participantList = await this.resourceFinder.fetchExamParticipants(exam['@id'])

        const formattedResults = [];

        for (const participantResults of resultList) {
            formattedResults.push({
                participant: await this.getParticipantName(participantResults['@id'], participantList),
                scores: this.getScoreByAssessmentSession(participantResults.assessmentSessions[0], this.ratingScale)
            })
        }

        const res = {
            exam: exam.title,
            results: formattedResults
        }

        return res
    }

    async calculateScoreForMultipleExams() {
        /** @var {[Exam]} */
        const exams = await this.resourceFinder.fetchAllExams();

        const results = [];
        for (let exam of exams) {
            results.push(await this.getExamResults(exam))
        }

        return results
    }

    getScoreByAssessmentSession (assessmentSession) {
        if (assessmentSession !== undefined && assessmentSession.hasOwnProperty('questionFoldersResults') && assessmentSession.questionFoldersResults !== null) {
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
                averageWithFolderWeight: totalWithFolderWeight.score / totalWithFolderWeight.weight * this.ratingScale,
                averageWithoutFolderWeight: totalWithoutFolderWeight.score / totalWithoutFolderWeight.weight * this.ratingScale
            }
        }
    }

    async getParticipantName(participantId, participantList) {
        const participant = participantList.filter(part => part['@id'] === participantId)[0]

        return await this.resourceFinder.fetchResource(participant.user, false)
            .then(user => ({firstName: user.firstName ?? '', lastName: user.lastName ?? '', username: user.username ?? ''}))
            .catch(() => ({firstName: 'unknown user', lastName: 'unknown user', username: 'unknown user'}))
    }
}

module.exports = {ScoreCalculator}
