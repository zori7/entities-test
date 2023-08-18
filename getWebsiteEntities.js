const axios = require("axios")
const cheerio = require("cheerio")
const {getWordsList} = require('most-common-words-by-language')
const {uniq, take} = require("lodash")
const {getBestOccurrences, splitText} = require("./utils")

const englishWords = getWordsList("english", 1000)

const commonWords = [
    ...englishWords,
    "yours",
    "the",
    "and",
    "for",
    "from",
    "are",
    "is",
    "as",
    "that",
    "with",
    "without",
    "you",
    "no",
    "not",
    "a",
    "an",
    "do",
    "dont",
    "your",
    "the",
    "there",
    "by",
    "at",
    "and",
    "so",
    "if",
    "than",
    "but",
    "about",
    "in",
    "on",
    "the",
    "was",
    "for",
    "that",
    "said",
    "a",
    "or",
    "of",
    "to",
    "there",
    "will",
    "be",
    "what",
    "get",
    "go",
    "think",
    "just",
    "every",
    "nothing",
    "are",
    "it",
    "were",
    "had",
    "i",
    "very",
]

const validWordRegex = /\w{3,}/i

const getWebsiteEntities = async (url) => {
    if (typeof url !== "string" || url.length < 3) {
        throw new Error("Provide a valid url")
    }

    let result = []

    let html

    try {
        const res = await axios.get(url, {
            headers: {
                "Accept": "text/html"
            }
        })
        html = res.data
    } catch (e) {
        throw new Error("Network error")
    }

    const $ = cheerio.load(html)

    // parse meta title, description, and keywords
    const title = $("title").first().text()
    const description = $('meta[name="description"]').attr("content") || ""
    const keywords = $('meta[name="keywords"]').attr("content") || ""

    // populate the result with a keyword
    result.push(...take((splitText(keywords)), 1))

    const text = (title + " " + description).toLowerCase()
    let words = splitText(text)

    words = words.filter((v) => !commonWords.includes(v) && validWordRegex.test(v))

    const titleWords = getBestOccurrences(words, 2)

    // populate the result with words from title and description
    result.push(...titleWords)

    let bodyWords = []

    $("h1,h2,h3,strong,em").each((i, el) => {
        let words = splitText($(el).text().toLowerCase())

        if (words.length <= 3) {
            bodyWords.push(words.join(" "))
        } else {
            bodyWords.push(...words)
        }
    })

    bodyWords = bodyWords.filter((v) => !commonWords.includes(v) && validWordRegex.test(v))

    bodyWords = getBestOccurrences(bodyWords)

    // populate the result with words from the page
    result.push(...bodyWords)

    return take(uniq(result), 5)
}

module.exports = {
    getWebsiteEntities
}