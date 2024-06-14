
const { CronJob } = require('cron');
const archiveController = require('../controller/archivedChat');

const job = new CronJob(
  '0 0 * * *', // Run at midnight every day
  archiveController.archiveOldChats, // Function to call
  null, // onComplete
  true, // Start the job right now
  'Asia/Kolkata' // Time zone of this job
);

job.start();
