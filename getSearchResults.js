const SerpApi = require('google-search-results-nodejs');
const {channels} = require("./constants")

const search = new SerpApi.GoogleSearch(process.env.SERP_API_KEY);

const googleKeywordSocialResultsCounts = async (keyword) => {
    const keywordCountOnGoogle = {}

    const searchPromises = channels.map(async (channel) => {
        const params = {
            engine: "google",
            q: `site:https://${channel}.com intitle:${keyword}`,
            google_domain: "google.com",
            gl: "us",
            hl: "en"
        };

        return new Promise((resolve) => {
            search.json(params, (data) => {
                keywordCountOnGoogle[channel.toLowerCase()] = data.search_information.total_results;
                resolve();
            });
        });
    });

    await Promise.all(searchPromises);

    return keywordCountOnGoogle;
}

module.exports = {
    googleKeywordSocialResultsCounts
}
