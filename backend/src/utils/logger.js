function error(context, exception) {
  const details = {
    context,
    code: exception?.code,
    name: exception?.name,
  };

  if (process.env.NODE_ENV !== "production") {
    details.message = exception?.message;
  }

  console.error(details);
}

module.exports = { error };
