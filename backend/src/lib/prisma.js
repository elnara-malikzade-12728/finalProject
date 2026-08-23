require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const retryableConnectionErrors = new Set([
  "P1017",
  "P2024",
]);

let activePrisma = new PrismaClient();
let reconnectPromise = null;

async function replaceDisconnectedClient(failedClient) {
  if (activePrisma !== failedClient) {
    return;
  }

  if (!reconnectPromise) {
    const nextPrisma = new PrismaClient();

    reconnectPromise = nextPrisma
      .$connect()
      .then(() => {
        if (activePrisma === failedClient) {
          activePrisma = nextPrisma;
          failedClient.$disconnect().catch(() => {});
        } else {
          nextPrisma.$disconnect().catch(() => {});
        }
      })
      .finally(() => {
        reconnectPromise = null;
      });
  }

  await reconnectPromise;
}

const modelProxies = new Map();

function getModelProxy(modelName) {
  if (!modelProxies.has(modelName)) {
    modelProxies.set(
      modelName,
      new Proxy(
        {},
        {
          get(_target, operation) {
            return async (...args) => {
              const requestClient = activePrisma;

              try {
                return await requestClient[modelName][operation](
                  ...args,
                );
              } catch (error) {
                if (
                  !retryableConnectionErrors.has(error?.code)
                ) {
                  throw error;
                }

                console.warn(
                  `Database connection ${error.code}; replacing client and retrying once.`,
                );

                await replaceDisconnectedClient(requestClient);

                return activePrisma[modelName][operation](...args);
              }
            };
          },
        },
      ),
    );
  }

  return modelProxies.get(modelName);
}

const prisma = new Proxy(
  {},
  {
    get(_target, property) {
      if (typeof property !== "string") {
        return activePrisma[property];
      }

      if (property.startsWith("$")) {
        const value = activePrisma[property];

        return typeof value === "function"
          ? value.bind(activePrisma)
          : value;
      }

      return getModelProxy(property);
    },
  },
);

module.exports = prisma;
