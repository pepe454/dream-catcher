const Store = require('electron-store');
const {ipcMain} = require('electron')

let store = new Store();

ipcMain.on('goals-request', (event, arg) => {
  // console.log(arg);
  let payload = null; 
  let response = 'goals-load-reply';
  if (arg.command == 'goalsAndProgress')
    payload = getGoalsAndProgress(); 
  else if (arg.command == 'getGoal')
    payload = getGoal(arg.title);
  else if (arg.command == 'goalAndTaskList') {
    payload = getGoalAndTaskList(arg.title); 
    response = 'task-load-reply';
  } else if (arg.command == 'setTask') {
    if ('completed' in arg)
      payload = setTask(arg.title, arg.taskName, arg.difficulty, arg.completed);
    else 
      payload = setTask(arg.title, arg.taskName, arg.difficulty, null); 
    response = 'task-form-reply'; 
  } else if (arg.command == 'deleteGoal')
    payload = deleteGoal(arg.title);
  // delete task. that would also be nice :)
  else if (arg.command == 'deleteTask') {
    payload = deleteTask(arg.title, arg.taskName);
    response = 'task-form-reply'; 
  } else {
    payload = 'Invalid command!';
    response = 'task-form-reply';
  }
  //console.log(`sending out ${response} with payload: `);
  // console.log(`sending payload: ${payload}`); 
  event.sender.send(response, payload);
})

function createGoal(title) {
  if (store.has(`goals.${title}`))
    return 'A goal with the same title already exists';
  store.set(`goals.${title}`, {'progress':0, 'taskList':{}});
  return [title, 0]; 
}

function getGoalsAndProgress() {
  let goalsAndProgress = new Array(); 
  let keys = Object.keys(store.get('goals'));
  keys.forEach(key => {
    let progress = store.get(`goals.${key}.progress`);
    goalsAndProgress.push([key, progress])
  });
  // list of length >= 1 for ALL goals.
  return goalsAndProgress;
}

function getGoal(title) {
  if (!store.has(`goals.${title}`))
    return null; 
  // list of length 1 with progress >= 0 to indicate update of a single goal
  return [[title, store.get(`goals.${title}.progress`)]];
}

function getGoalAndTaskList(title) {
  if (!store.has(`goals.${title}`))
    return null; 
  // list of length 1 with progress >= 0 to indicate update of a single goal
  return [title, store.get(`goals.${title}`)];
}

function updateProgress(title) {
  if (!store.has(`goals.${title}`)) 
    return `A goal with title ${title} does not exist`;
    
  let actualProgress = 0;
  let requiredProgress = 0; 
  let taskList = store.get(`goals.${title}.taskList`);
  let keys = Object.keys(taskList); 
  keys.forEach(task => {
    let difficulty = parseInt(taskList[task].difficulty);
    requiredProgress += difficulty; 
    if (taskList[task].completed)
      actualProgress += difficulty;
  });

  let progress = 0;
  if (requiredProgress != 0)
    progress = Math.ceil(actualProgress / requiredProgress * 100);
  store.set(`goals.${title}.progress`, progress);
  return progress; 
}

function setTask(title, taskName, difficulty, completed) {
  if (!store.has(`goals.${title}`)) {
    createGoal(title, {});
    completed = false; 
  }

  // if completed wasn't included, get whatever it is now my dude :)
  if (completed == null) 
    completed = store.get(`goals.${title}.taskList.${taskName}.completed`);
  store.set(`goals.${title}.taskList.${taskName}`, {'difficulty': difficulty, 'completed': completed}); 
  let progress = updateProgress(title); 
  let task = {
    'taskName': taskName, 
    'difficulty': difficulty,
    'completed': completed,
    'title': title,
    'progress': progress
  }
  return task;
}

function deleteTask(title, taskName) { 
  if (!store.has(`goals.${title}`))
    return(`A goal with title ${title} does not exist!`);
  let goal = store.get(`goals.${title}`);
  delete goal.taskList[taskName]; 
  updateProgress(title); 
  let task = {
    'taskName': taskName,
    'title': title
  }
  return task; 
}

function deleteGoal(title) {
  if (!store.has(`goals.${title}`))
    return `Goal with ${title} does not exist`;  
  store.delete(`goals.${title}`);
  // progress of -1 to indicate a delete operation 
  return [[title, -1]]; 
}

function testSuite() {
  let taskList1 = {
    'run 1 mile' : {'difficulty': 2, 'completed': true}, 
    'run 5 miles' : {'difficulty': 3, 'completed': true}, 
    'run 10 miles' : {'difficulty': 5, 'completed': false}, 
    'run 15 miles' : {'difficulty': 5, 'completed': false}, 
  }
  setGoal("Run marathon", taskList1);
  console.log(getGoal('Run marathon'));
  console.log(getGoalsAndProgress());

  taskList1['race!'] = {'difficulty': 6, 'completed': false};
  setGoal("Run marathon", taskList1);
  console.log(getGoal('Run marathon'));
  console.log(getGoalsAndProgress());

  deleteGoal('Run marathon');
  console.log(getGoal('Run marathon'));
  console.log(getGoalsAndProgress());
}

//testSuite();