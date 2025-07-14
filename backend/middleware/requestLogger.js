const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);

  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === "POST" || method === "PUT") && req.body) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = "[HIDDEN]";
    if (logBody.code) logBody.code = "[HIDDEN]";
    console.log("Request Body:", JSON.stringify(logBody, null, 2));
  }

  next();
};

export default requestLogger;
