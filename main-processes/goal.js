const Store = require('electron-store');
let store = new Store();

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
  console.log(keys);
  keys.forEach(task => {
    let difficulty = taskList[task].difficulty;
    requiredProgress += difficulty; 
    if (taskList[task].completed)
      actualProgress += difficulty;
  });
  let progress = Math.ceil(actualProgress / requiredProgress * 100);

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
}

function deleteGoal(title) {
  if (!store.has(`goals.${title}`))
    return false;
  store.delete(`goals.${title}`);
  return true; 
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