const prisma = require('../lib/prisma');

async function autoForwardCvForCourseCompletion(userId, courseId, db = prisma) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { cvFilePath: true, careerAutoApplyEnabled: true } });
  if (!user?.careerAutoApplyEnabled || !user.cvFilePath) return { created: 0, reason: 'OPT_IN_OR_CV_MISSING' };
  const jobs = await db.job.findMany({ where: { courseId }, select: { id: true } });
  if (!jobs.length) return { created: 0, reason: 'NO_MATCHING_JOBS' };
  const result = await db.application.createMany({
    data: jobs.map((job) => ({ userId, jobId: job.id, status: 'PENDING', source: 'AUTOMATIC', cvFilePathAtApplication: user.cvFilePath })),
    skipDuplicates: true,
  });
  return { created: result.count, reason: null };
}

module.exports = { autoForwardCvForCourseCompletion };
