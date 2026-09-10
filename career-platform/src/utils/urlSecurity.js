export function removeQueryParameterFromUrl(parameterName, location = window.location, history = window.history) {
  const url = new URL(location.href);
  if (!url.searchParams.has(parameterName)) return false;

  url.searchParams.delete(parameterName);
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return true;
}
