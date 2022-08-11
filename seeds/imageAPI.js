const axios = require("axios");

module.exports = async function getImage(page) {
  try {
    const accessKey = "_3Fvqo0jbbyk8pmyOtrNYQOC73Ma0Ml0UfEP8XZhFhw";
    const endpoint = "https://api.unsplash.com/search/photos";
    const query = `?query=office&page=${page}&per_page=25&client_id=${accessKey}`;
    const path = endpoint + query;
    const imageLinks = [];
    const response = await axios.get(path);
    const result = await response.data.results;
    result.forEach((e) => {
      imageLinks.push(e.urls.regular);
    });
    return imageLinks;
  } catch (error) {
    console.error(error);
  }
};
