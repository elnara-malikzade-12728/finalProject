function error(context, exception) {
  const details = {
    context,
    code: exception?.code,
    name: exception?.name,
    type: exception?.type,
    statusCode: exception?.statusCode,
  };

  const isStripeError =
    typeof exception?.type === "string" &&
    exception.type.startsWith("Stripe");

  if (process.env.NODE_ENV !== "production" || isStripeError) {
    details.message = exception?.message;
  }

  if (exception?.code === "MODULE_NOT_FOUND") {
    details.missingModule = exception?.message;
  }

  console.error(details);
}

module.exports = { error };
