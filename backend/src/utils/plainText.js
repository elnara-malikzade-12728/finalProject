const HTML_TAG_PATTERN = /<\s*\/?\s*[a-z][^>]*>/i;

function containsHtmlMarkup(value) {
  return typeof value === "string" && HTML_TAG_PATTERN.test(value);
}

module.exports = { containsHtmlMarkup };
