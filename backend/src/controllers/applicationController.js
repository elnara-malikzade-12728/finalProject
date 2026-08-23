const prisma = require("../lib/prisma");

const APPLICATION_STATUSES = [
  "PENDING",
  "REVIEWED",
  "ACCEPTED",
  "REJECTED",
];

const jobSummarySelect = {
  id: true,
  title: true,
  company: true,
  location: true,
};

const userSummarySelect = {
  id: true,
  name: true,
  email: true,
};

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function applicationInclude() {
  return {
    job: {
      select: jobSummarySelect,
    },
    user: {
      select: userSummarySelect,
    },
  };
}

async function applyToJob(req, res) {
  try {
    const userId = req.user.id;
    const jobId = parsePositiveInteger(req.params.id);

    if (!jobId) {
      return res.status(404).json({
        error: "Vakansiya tapılmadı.",
      });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: jobSummarySelect,
    });

    if (!job) {
      return res.status(404).json({
        error: "Vakansiya tapılmadı.",
      });
    }

    const existingApplication =
      await prisma.application.findUnique({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      });

    if (existingApplication) {
      return res.status(409).json({
        error: "Siz bu vakansiyaya artıq müraciət etmisiniz.",
      });
    }

    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        status: "PENDING",
      },
      include: {
        job: {
          select: jobSummarySelect,
        },
      },
    });

    return res.status(201).json(application);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Siz bu vakansiyaya artıq müraciət etmisiniz.",
      });
    }

    console.error("Vakansiyaya müraciət zamanı xəta:", error);

    return res.status(500).json({
      error:
        "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function getMyApplications(req, res) {
  try {
    const applications = await prisma.application.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        job: {
          select: jobSummarySelect,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(applications);
  } catch (error) {
    console.error(
      "İstifadəçi müraciətləri alınarkən xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function getApplications(req, res) {
  try {
    const applications = await prisma.application.findMany({
      include: applicationInclude(),
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Müraciətlər alınarkən xəta:", error);

    return res.status(500).json({
      error:
        "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function updateApplicationStatus(req, res) {
  try {
    const applicationId = parsePositiveInteger(req.params.id);
    const status =
      typeof req.body.status === "string"
        ? req.body.status.trim().toUpperCase()
        : req.body.status;

    if (!applicationId) {
      return res.status(404).json({
        error: "Müraciət tapılmadı.",
      });
    }

    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({
        error:
          "Status yalnız PENDING, REVIEWED, ACCEPTED və ya REJECTED ola bilər.",
      });
    }

    const existingApplication =
      await prisma.application.findUnique({
        where: {
          id: applicationId,
        },
      });

    if (!existingApplication) {
      return res.status(404).json({
        error: "Müraciət tapılmadı.",
      });
    }

    const application = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status,
      },
      include: applicationInclude(),
    });

    return res.status(200).json(application);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Müraciət tapılmadı.",
      });
    }

    console.error("Müraciət statusu yenilənərkən xəta:", error);

    return res.status(500).json({
      error:
        "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

module.exports = {
  applyToJob,
  getMyApplications,
  getApplications,
  updateApplicationStatus,
};
