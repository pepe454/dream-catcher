const {ipcRenderer} = require('electron')
const { dialog } = require('electron').remote

let rewardForm = document.getElementById('reward-entry-form');
let taskForm = document.getElementById('task-entry-form');

rewardForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById("reward-title").value; 
  const difficulty = document.getElementById("reward-difficulty").value; 
  if ((title == '') || (difficulty == null)) {
    // add error message here 
    console.log("no input given!");
    let message = "Title or difficulty not specified"; 
    dialog.showMessageBox({'buttons':['Cancel'], 'message': message});
  } else {
    let payload = {'command': 'setReward', 'title': title, 'difficulty': difficulty};
    ipcRenderer.send('rewards-request', payload); 
  }
})

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const goalName = document.getElementById("goal-name").value; 
  const taskName = document.getElementById("task-name").value; 
  const difficulty = document.getElementById("task-difficulty").value; 
  if ((goalName === '') || (difficulty === '') || (taskName === '')) {
    // add error message here 
    console.log("insufficient input given!");
    let message = "Goal title, task title, or difficulty not specified"; 
    dialog.showMessageBox({'buttons':['Cancel'], 'message': message});
  } else {
    let payload = {
      'command': 'setTask', 
      'title': goalName, 
      'taskName': taskName,
      'difficulty': difficulty, 
      'completed': false
    };
    console.log('sending goal payload');
    ipcRenderer.send('goals-request', payload); 
  }
})

ipcRenderer.on('rewards-reply', (event, arg) => {
  console.log(arg);
  console.log('reward reply!');
  // new reward created
  if ((arg.length == 3) && (typeof arg[0] === 'string')) {
    let rewardList = document.getElementById('rewards-list');
    let li = document.createElement('li');
    let span = document.createElement('span'); 
    let text = document.createTextNode(arg[0]);
    // this will have x-stars for the difficulty
    let stars = document.createTextNode(` ${arg[1]}-stars`);
    li.appendChild(text);
    span.appendChild(stars);
    li.appendChild(span);
    rewardList.appendChild(li);
  }
})

ipcRenderer.on('goals-reply', (event, arg) => {
  console.log(arg);
  // new reward created
  if ((arg.length == 3) && (typeof arg[0] === 'string')) {
    let taskList = document.getElementById('goal-task-list');
    let li = document.createElement('li');
    let span = document.createElement('span'); 
    let span2 = document.createElement('span'); 
    let text = document.createTextNode(arg[0]);
    // this will have x-stars for the difficulty
    let stars = document.createTextNode(` ${arg[1]}-stars`);
    let completed = document.createTextNode(` completed? ${arg[2]}`);
    li.appendChild(text);
    span.appendChild(stars);
    span2.appendChild(completed); 
    li.appendChild(span);
    li.appendChild(span2); 
    taskList.appendChild(li);
  }
})