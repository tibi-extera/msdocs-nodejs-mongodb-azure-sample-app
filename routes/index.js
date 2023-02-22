const express = require('express');
const Task = require('../models/task');
const formidable = require('formidable');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const azureFs = require('../azure-fs');

/* GET home page. */
router.get('/', function(req, res) {
  Task.find()
    .then((tasks) => {      
      const currentTasks = tasks.filter(task => !task.completed);
      const completedTasks = tasks.filter(task => task.completed === true);

      console.log(`Total tasks: ${tasks.length}   Current tasks: ${currentTasks.length}    Completed tasks:  ${completedTasks.length}`)
      res.render('index', { currentTasks: currentTasks, completedTasks: completedTasks });
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});


router.post('/addTask', function(req, res) {
  const taskName = req.body.taskName;
  const createDate = Date.now();
  
  var task = new Task({
    taskName: taskName,
    createDate: createDate
  });
  console.log(`Adding a new task ${taskName} - createDate ${createDate}`)

  task.save()
      .then(() => { 
        console.log(`Added new task ${taskName} - createDate ${createDate}`)        
        res.redirect('/'); })
      .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
      });
});

router.post('/completeTask', function(req, res) {
  console.log("I am in the PUT method")
  const taskId = req.body._id;
  const completedDate = Date.now();

  Task.findByIdAndUpdate(taskId, { completed: true, completedDate: Date.now()})
    .then(() => { 
      console.log(`Completed task ${taskId}`)
      res.redirect('/'); }  )
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});


router.post('/deleteTask', function(req, res) {
  const taskId = req.body._id;
  Task.findByIdAndDelete(taskId)
    .then(() => { 
      console.log(`Deleted task $(taskId)`)      
      res.redirect('/'); }  )
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});


router.post('/createFile', async (req, res) => {
  try {
    // upload files to a temporary folder. From here we will move the files to their
    // proper location after we create the geometry database entry
    const uploadDir = `${config.fileStorage}-${Date.now()}`;
    fs.mkdir(uploadDir, { recursive: true });
    const dc = await azureFs.init();

    const form = new formidable.IncomingForm({
      uploadDir,
      keepExtensions: true,
      multiples: true,
    });

    form.parse(req, async (_err, _fields, files) => {
      const promises = [];

      Object.keys(files).forEach((file) => {
        if (Array.isArray(files[file])) {
          // in this case file[file] is an Array<File>
          files[file].forEach((f) => {
            const fullPath = path.join(uploadDir, f.originalFilename);
            promises.push(azureFs.createFile(dc, fullPath));
          });
        } else {
          const fullPath = path.join(uploadDir, files[file].originalFilename);
          promises.push(azureFs.createFile(dc, fullPath));
        }
      });

      // wait for all uploads to complete
      await Promise.all(promises);

      // cleanup temporary folder
      fs.rmdirSync(uploadDir, { recursive: true });

      res.redirect('/');
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create the file record.', err);
  }
});



module.exports = router;
