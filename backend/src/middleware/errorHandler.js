module.exports = function errorHandler(err, req, res, next) {
    console.error(err);
    if (res.headersSent) return next(err);

    const status = err instanceof SyntaxError && err.status === 400
        ? 400
        : Number.isInteger(err.statusCode) ? err.statusCode : 500;
    res.status(status).json({ error: status === 500 ? 'Server error' : err.message });
};