const os = require('os')

/**
 * @param columnTitles {{title: string, property: string}[]}
 * @param content {{}[]}
 */
const buildCsvContent = (columnTitles, content) => {
    const output = []

    output.push(columnTitles.map(titles => titles.title).join())

    content.forEach(row => {
        output.push(columnTitles.map(titles => {
            if (row.hasOwnProperty(titles.property)) {
                return row[titles.property];
            } else {
                return '';
            }
        }))
    })

    return output.join(os.EOL)
}

module.exports = {buildCsvContent}
