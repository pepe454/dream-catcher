const Store = require('electron-store');
const {ipcMain} = require('electron')

let store = new Store();

ipcMain.on('goals-request', (event, arg) => {
  console.log(arg);
  let payload = null; 
  if (arg.command == 'goalsAndProgress')
    payload = getGoalsAndProgress(); 
  else if (arg.command == 'getGoal')
    payload = getGoal(arg.title);
  else if (arg.command == 'setGoal')
    payload = setGoal(arg.title, arg.taskList);
  else if (arg.command == 'setTask')
    payload = setTask(arg.title, arg.taskName, arg.difficulty, arg.completed);
  else if (arg.command == 'createGoal')
    payload = createGoal(arg.title, arg.taskList);
  else if (arg.command == 'deleteGoal')
    payload = deleteGoal(arg.title);
  else if (arg.command == 'deleteTask')
    payload = addTask(arg.title, arg.taskName);
  else
    payload = 'Invalid command!';
  event.sender.send('goals-reply', payload);
})

function getGoalsAndProgress() {
  let goalsAndProgress = new Array(); 
  let keys = Object.keys(store.get('goals'));
  keys.forEach(key => {
    let progress = store.get(`goals.${key}.progress`);
    goalsAndProgress.push([key, progress])
  });
  return goalsAndProgress;
}

function getGoal(title) {
  if (!store.has(`goals.${title}`))
    return null; 
  return store.get(`goals.${title}`);
}

function setGoal(title, taskList) {
  // update progress
  let actualProgress = 0;
  let requiredProgress = 0; 
  let keys = Object.keys(taskList);
  keys.forEach(task => {
    let difficulty = taskList[task].difficulty;
    requiredProgress += difficulty; 
    if (taskList[task].completed)
      actualProgress += difficulty;
  });
  let progress = null;
  if (requiredProgress == 0)
    progress = 0; 
  else
    progress = Math.ceil(actualProgress / requiredProgress * 100);

  let goals = store.get('goals');
  if (Object.keys(goals).includes(title)) {
    goals[title].taskList = taskList;
    goals[title].progress = progress;
  } else {
    goals[title] = {
      taskList: taskList,
      progress: progress
    }
  }
  store.set('goals', goals);
  return 'Goal updated successfully'; 
}

function setTask(title, taskName, difficulty, completed=false) {
  if (!store.has(`goals.${title}`))
    createGoal(title, {});
  let goal = store.get(`goals.${title}`);
  goal.taskList[taskName] = {'difficulty': difficulty, 'completed': completed};
  return [taskName, difficulty, completed]; 
}

function createGoal(title, taskList) {
  if (store.has(`goals.${title}`))
    return 'A goal with the same title already exists';
  setGoal(title, taskList);
  return 'Goal created successfully';
}

function deleteGoal(title) {
  if (!store.has(`goals.${title}`))
    return `Goal with ${title} does not exist`;  
  store.delete(`goals.${title}`);
  return 'Goal deleted successfully'; 
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