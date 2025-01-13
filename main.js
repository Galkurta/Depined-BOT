const fs = require("fs");
const axios = require("axios");
const displayBanner = require("./config/banner");
const colors = require("./config/colors");
const logger = require("./config/logger");

const CONSTANTS = {
  API: {
    BASE_URL: "https://api.depined.org/api",
    ENDPOINTS: {
      USER_DETAILS: "/user/details",
      WIDGET_CONNECT: "/user/widget-connect",
      EPOCH_EARNINGS: "/stats/epoch-earnings",
    },
    HEADERS: {
      CONTENT_TYPE: "application/json",
    },
  },
  FILES: {
    JWT_PATH: "./data.txt",
  },
  DELAYS: {
    MIN: 300,
    MAX: 2700,
  },
  MESSAGES: {
    ERRORS: {
      FILE_READ: "Error reading JWT file",
      NO_JWT: "No JWT found in data.txt",
      INITIAL_SETUP: "Initial setup failed",
      UNCAUGHT: "Uncaught Exception",
      UNHANDLED: "Unhandled Rejection",
    },
    INFO: {
      CONNECTED: "Connected",
      FOUND_ACCOUNTS: "Found",
      ACCOUNTS: "accounts",
    },
    LOG_FORMAT: {
      EARNINGS: "Earnings",
      EPOCH: "Epoch",
      ERROR: "Error",
    },
  },
};

const formatNumber = (number) => {
  const num = typeof number === "string" ? parseFloat(number) : number;

  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + "B";
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + "K";
  }

  return num.toFixed(2);
};

const getRandomDelay = () => {
  return Math.floor(
    Math.random() * (CONSTANTS.DELAYS.MAX - CONSTANTS.DELAYS.MIN + 1) +
      CONSTANTS.DELAYS.MIN
  );
};

const readJWTFile = () => {
  try {
    const data = fs.readFileSync(CONSTANTS.FILES.JWT_PATH, "utf8");
    return data.split("\n").filter((line) => line.trim() !== "");
  } catch (error) {
    logger.error(`${CONSTANTS.MESSAGES.ERRORS.FILE_READ}: ${error.message}`);
    return [];
  }
};

const createAxiosInstance = (jwt) => {
  return axios.create({
    baseURL: CONSTANTS.API.BASE_URL,
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": CONSTANTS.API.HEADERS.CONTENT_TYPE,
    },
  });
};

const runAccountFlow = async (jwt) => {
  const api = createAxiosInstance(jwt);
  let username = jwt.substr(0, 10) + "...";

  try {
    const userDetails = await api.get(CONSTANTS.API.ENDPOINTS.USER_DETAILS);
    username = userDetails.data.data.username;
    logger.info(
      `${colors.accountName}[${username}]${colors.reset} ${CONSTANTS.MESSAGES.INFO.CONNECTED}`
    );

    while (true) {
      try {
        const delay = getRandomDelay();
        await new Promise((resolve) => setTimeout(resolve, delay));

        await api.post(CONSTANTS.API.ENDPOINTS.WIDGET_CONNECT, {
          connected: true,
        });

        const earnings = await api.get(CONSTANTS.API.ENDPOINTS.EPOCH_EARNINGS);
        const formattedEarnings = formatNumber(earnings.data.data.earnings);

        logger.success(
          `${colors.accountName}[${username}]${colors.reset} ${CONSTANTS.MESSAGES.INFO.CONNECTED} | ${colors.taskComplete}${CONSTANTS.MESSAGES.LOG_FORMAT.EARNINGS}: ${formattedEarnings}${colors.reset} (${colors.accountInfo}${CONSTANTS.MESSAGES.LOG_FORMAT.EPOCH}: ${earnings.data.data.epoch}${colors.reset})`
        );
      } catch (error) {
        logger.error(
          `${colors.accountName}[${username}]${colors.reset} ${colors.taskFailed}${CONSTANTS.MESSAGES.LOG_FORMAT.ERROR}: ${error.message}${colors.reset}`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, CONSTANTS.DELAYS.MIN)
        );
      }
    }
  } catch (error) {
    logger.error(
      `${colors.accountName}[${username}]${colors.reset} ${colors.taskFailed}${CONSTANTS.MESSAGES.ERRORS.INITIAL_SETUP}: ${error.message}${colors.reset}`
    );
    await new Promise((resolve) => setTimeout(resolve, CONSTANTS.DELAYS.MAX));
    return runAccountFlow(jwt);
  }
};

const main = async () => {
  displayBanner();

  const jwts = readJWTFile();
  logger.info(
    `${CONSTANTS.MESSAGES.INFO.FOUND_ACCOUNTS} ${colors.accountInfo}${jwts.length}${colors.reset} ${CONSTANTS.MESSAGES.INFO.ACCOUNTS}`
  );

  if (jwts.length === 0) {
    logger.error(CONSTANTS.MESSAGES.ERRORS.NO_JWT);
    process.exit(1);
  }

  const accountPromises = jwts.map((jwt) => runAccountFlow(jwt));
  await Promise.all(accountPromises);
};

process.on("uncaughtException", (error) => {
  logger.error(`${CONSTANTS.MESSAGES.ERRORS.UNCAUGHT}: ${error.message}`);
});

process.on("unhandledRejection", (error) => {
  logger.error(`${CONSTANTS.MESSAGES.ERRORS.UNHANDLED}: ${error.message}`);
});

main().catch((error) => logger.error(error.message));
