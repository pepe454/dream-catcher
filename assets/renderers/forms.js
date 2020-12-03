const {ipcRenderer} = require('electron')
const { dialog } = require('electron').remote

let rewardForm = document.getElementById('reward-entry-form');
let taskForm = document.getElementById('task-entry-form');
let taskFormShowButton = document.getElementById('task-form-show-button');

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
    let message = ''; 
    if (goalName === '')
      message = 'Goal title is missing. ';
    if (taskName === '')
      message += 'Task name is missing. '; 
    if (difficulty === '')
      message += 'Task difficulty is missing.';
    dialog.showMessageBox({'buttons':['Cancel'], 'message': message});

  } else {
    let payload = {
      'command': 'setTask', 
      'title': goalName, 
      'taskName': taskName,
      'difficulty': difficulty, 
    };
    // console.log('sending goal payload');
    document.getElementById('task-name').value = ''; 
    ipcRenderer.send('goals-request', payload); 
  }
})

taskFormShowButton.addEventListener("click", (event) => {
  let taskForm = document.getElementById('task-entry-form');
  // console.log(taskForm.classList); 
  if (taskForm.classList.contains('hide')) {
    taskForm.classList.remove('hide');
    taskFormShowButton.innerHTML = ""; 
    taskFormShowButton.appendChild(document.createTextNode('Hide new task form'));
  } else { 
    taskForm.classList.add('hide'); 
    taskFormShowButton.innerHTML = ""; 
    taskFormShowButton.appendChild(document.createTextNode('Add another task')); 
  }
})

function createTaskItem(task) {
  let taskListItem = document.createElement('li');
  taskListItem.setAttribute('class', `task-item-${task['title']}`);
  taskListItem.setAttribute('data-taskName', `${task['taskName']}`);

  let completedCheck = document.createElement('input');
  if (task['completed'])
    completedCheck.setAttribute('checked', 'true');
  completedCheck.setAttribute('type', 'checkbox');
  completedCheck.setAttribute('data-request', 'goals'); 
  completedCheck.setAttribute('data-command', 'setTask'); 
  completedCheck.setAttribute('data-title', task['title']); 
  completedCheck.setAttribute('data-taskname', task['taskName']); 
  completedCheck.setAttribute('data-completed', task['completed']); 
  completedCheck.setAttribute('data-difficulty', task['difficulty']); 

  // stars, make it pretty :) 
  let difficulty = document.createElement('span'); 
  difficulty.classList.add('difficulty-span'); 
  for (let i = 1; i < 6; i++) {
    let starSpan = document.createElement('span'); 
    starSpan.classList.add('fa');
    starSpan.classList.add('fa-star');
    if (i <= task['difficulty'])  
      starSpan.classList.add('orange-star'); 
    difficulty.appendChild(starSpan);
  }

  taskListItem.appendChild(completedCheck); 
  taskListItem.appendChild(document.createTextNode(task['taskName']));
  taskListItem.appendChild(difficulty); 
  return taskListItem;
}

ipcRenderer.on('task-form-reply', (event, arg) => {
  // check if task already in taskList
  let className = `.task-item-${arg['title'].split(' ').join('.')}`;
  let taskListItems = document.querySelectorAll(className); 
  let taskList = document.getElementById('goal-task-list'); 
  let found = false; 
  let length = Object.keys(arg).length;

  if (taskListItems != null) {
    taskListItems.forEach(task => {
      let taskName = task.getAttribute('data-taskName'); 
      if (taskName === arg['taskName']) {
        if (length > 2) {
          let children = task.childNodes;
          children.forEach(child => {
            if (child.nodeName === 'INPUT') {
              child.setAttribute('data-completed', arg['completed']); 
              child.setAttribute('data-difficulty', arg['difficulty']); 
              if (arg['completed'])
                child.setAttribute('checked', 'true'); 
              else if (child.hasAttribute('checked'))
                child.removeAttribute('checked');   
            }

            else if (child.nodeName == 'SPAN') {
              child.innerHTML = ""; 
              for (let i = 1; i < 6; i++) {
                let starSpan = document.createElement('span'); 
                starSpan.classList.add('fa');
                starSpan.classList.add('fa-star');
                if (i <= arg['difficulty'])  
                  starSpan.classList.add('orange-star'); 
                child.appendChild(starSpan);
              }
              // child.textContent = ` ${arg['difficulty']}-stars`; 
            }
          })
        }
        else
          taskList.removeChild(task); 
        found = true; 
      }
    })
  }

  // add new task to list!
  if (!found){
    taskListItem = createTaskItem(arg); 
    taskList.appendChild(taskListItem);
  }
  if (length > 2)
    document.getElementById("goal-progress-bar").value = arg['progress'];

  // update the GoalsList page. cute way to do it :)
  ipcRenderer.send('goals-request', {'command':'getGoal', 'title':arg['title']}); 
})

// add a current goal to the task scheisse. do something cheeky with button
ipcRenderer.on('task-load-reply', (event, arg) => {
  // want to set a fresh page
  console.log('task-load-reply received'); 
  console.log(arg); 
  document.getElementById("goal-name").value = "";
  document.getElementById("goal-task-list").innerHTML = ""; 

  // update with data from the button press. u know what I mean u honk-a-tonk
  if (arg != null) {
    document.getElementById("goal-progress-bar").value = arg[1].progress; 
    document.getElementById("goal-name").value = arg[0]; 
    let taskList = document.getElementById("goal-task-list");
    let tasks = arg[1].taskList;
    let keys = Object.keys(tasks); 
    keys.forEach(task => {
      let taskObject = {
        'taskName': task, 
        'difficulty': tasks[task].difficulty,  
        'completed': tasks[task].completed,
        'title': arg[0] 
      }
      let taskListItem = createTaskItem(taskObject); 
      taskList.appendChild(taskListItem); 
    })
  // show the new task form to make it easier
  } else {
    document.getElementById("task-entry-form").classList.remove('hide'); 
  }
})



/*
Use for checking tasks off or deleting tasks
checkbox.addEventListener('change', (event) => {
  if (event.target.checked) {
    alert('checked');
  } else {
    alert('not checked');
  }
})
*/

// FIXME: need to do work on this homie!
ipcRenderer.on('rewards-reply', (event, arg) => {
  console.log(arg); 
  let keys = Object.keys(arg); 
  if ((typeof arg === 'object') && (keys.length > 0) && (arg.length < 3 || arg[2] != 0)) {
    let rewardList = document.getElementById('rewards-list');
    keys.forEach(reward => {
      let li = document.createElement('li');
      let span = document.createElement('span'); 
      let text = document.createTextNode(reward); 
      // this will have x-stars for the difficulty
      let stars = document.createTextNode(` ${arg[reward]}-stars`);
      li.appendChild(text);
      span.appendChild(stars);
      li.appendChild(span);
      rewardList.appendChild(li);
    })
  }
  
  if (keys.length == 0) {
    let rewardSection = document.getElementById('rewards-section');
    let rewardList = document.querySelector('.rewards-list');
    let message = document.createElement('h4');
    let text = document.createTextNode("It looks like you haven't set any rewards yet. Create a reward below to get started!");
    message.appendChild(text); 
    rewardSection.insertBefore(message, rewardList);
  }
})
