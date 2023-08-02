const getBestOccurrences = (list, count = 5) => {
    const counts = {}

    list.forEach((word) => {
        if (!counts[word]) {
            counts[word] = 0
        }

        counts[word]++
    })

    // sort entities by most occurred first
    const sortedEntities = Object.entries(counts).sort((a, b) => b[1] - a[1])

    return sortedEntities.slice(0, count).map((v) => v[0]).filter((v) => v !== "undefined")
}

const splitText = (text) => text
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(" ")
    .map((v) => v.trim())
    .filter(Boolean)

module.exports = {
    getBestOccurrences,
    splitText
}
