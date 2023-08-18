const fs = require('fs')
const csv = require('csv-parser')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

require('dotenv').config()

const { googleKeywordSocialResultsCounts } = require('./getSearchResults')
const {channels, CONCURRENCY_LIMIT, BATCH_SIZE} = require("./constants")

const readKeywordsFromCSV = async (filePath) => {
    const keywords = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => keywords.push(row.keyword))
            .on('end', () => resolve(keywords))
            .on('error', reject)
    })
}

const initializeOutputFileWithHeaders = async (filePath) => {
    const csvWriter = createCsvWriter({
        path: filePath,
        header: [
            {id: 'keyword', title: 'KEYWORD'},
            ...channels.map(channel => ({id: channel.toLowerCase(), title: channel.toUpperCase()}))
        ],
        alwaysQuote: true
    })
    return csvWriter.writeRecords([])
}

const appendResultsToCSV = async (filePath, data) => {
    const csvWriter = createCsvWriter({
        path: filePath,
        header: [
            {id: 'keyword', title: 'KEYWORD'},
            ...channels.map(channel => ({id: channel.toLowerCase(), title: channel.toUpperCase()}))
        ],
        append: true,
        alwaysQuote: true
    })
    return csvWriter.writeRecords([data])
}

const processKeywordsAndAppendResults = async (inputPath, outputPath) => {
    //Initialize output file with headers if it doesn't exist
    if (!fs.existsSync(outputPath)) {
        await initializeOutputFileWithHeaders(outputPath)
    }

    const keywords = await readKeywordsFromCSV(inputPath)

    for (const keyword of keywords) {
        try {
            const result = await googleKeywordSocialResultsCounts(keyword)
            await appendResultsToCSV(outputPath, { keyword, ...result })
            console.log(`Processed and saved results for keyword: ${keyword}`)
        } catch (error) {
            console.error(`Error processing keyword ${keyword}: `, error)
        }
    }

    console.log('All keywords processed!')
}

(async function() {

    try {
        await processKeywordsAndAppendResults('keywords_10.csv', 'resultOfKeywordsSearch.csv')
    } catch (error) {
        console.error('Error processing keywords: ', error)
    }

})()

