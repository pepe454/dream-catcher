const {ipcRenderer} = require('electron')
const { dialog } = require('electron').remote

/*
  Form submit events
 */
let entryForm = document.getElementById('journal-entry-form'); 
entryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById("entry-title").value; 
  const text = document.getElementById("entry-text-input").value; 
  if ((title === '') || (text === '')) {
    let message = ''; 
    if (title === '')
      message = 'Entry title is missing. ';
    if (text === '')
      message += 'Entry text is missing.';
    dialog.showMessageBox({'buttons':['Cancel'], 'message': message});
  } else {
    let payload = {'command': 'setEntry', 'title': title, 'text': text};
    console.log('sending payload');
    console.log(payload); 
    ipcRenderer.send('journal-request', payload); 
  }
})

let taskForm = document.getElementById('task-entry-form');
taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const goalName = document.getElementById("goal-name").value; 
  const taskName = document.getElementById("task-name").value; 
  const difficulty = document.getElementById("task-difficulty").value; 
  if ((goalName === '') || (difficulty === '') || (taskName === '')) {
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
    document.getElementById('task-name').value = ''; 
    ipcRenderer.send('goals-request', payload); 
  }
})

let rewardForm = document.getElementById('reward-entry-form');
rewardForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById("reward-title").value; 
  const difficulty = document.getElementById("reward-difficulty").value; 
  if ((title == '') || (difficulty == null)) {
    let message = "Title or difficulty not specified"; 
    dialog.showMessageBox({'buttons':['Cancel'], 'message': message});
  } else {
    let payload = {'command': 'setReward', 'title': title, 'difficulty': difficulty};
    ipcRenderer.send('rewards-request', payload); 
  }
})

/*
  Show and tell
*/
// a little bit of button logic to hide and shohw the addTasksForm. cute
let taskFormShowButton = document.getElementById('task-form-show-button');
taskFormShowButton.addEventListener("click", (event) => {
  let taskForm = document.getElementById('task-entry-form');
  if (taskForm.classList.contains('hide')) {
    taskForm.classList.remove('hide');
    taskFormShowButton.innerHTML = ""; 
    taskFormShowButton.appendChild(document.createTextNode('Hide new task form'));
    let icon = document.createElement('i');
    icon.classList.add('fas');
    icon.classList.add('fa-angle-double-up');
    taskFormShowButton.appendChild(icon); 
  } else { 
    taskForm.classList.add('hide'); 
    taskFormShowButton.innerHTML = ""; 
    taskFormShowButton.appendChild(document.createTextNode('Add another task')); 
    let icon = document.createElement('i');
    icon.classList.add('fas');
    icon.classList.add('fa-angle-double-down');
    taskFormShowButton.appendChild(icon); 
  }
})

// a little bit of button logic to hide and shohw the addRewardForm. cute
let rewardFormShowButton = document.getElementById('reward-form-show-button');
rewardFormShowButton.addEventListener("click", (event) => {
  let rewardForm = document.getElementById('reward-entry-form');
  if (rewardForm.classList.contains('hide')) {
    rewardForm.classList.remove('hide');
    rewardFormShowButton.innerHTML = ""; 
    rewardFormShowButton.appendChild(document.createTextNode('Hide new reward form'));
    let icon = document.createElement('i');
    icon.classList.add('fas');
    icon.classList.add('fa-angle-double-up');
    rewardFormShowButton.appendChild(icon); 
  } else { 
    rewardForm.classList.add('hide'); 
    rewardFormShowButton.innerHTML = ""; 
    rewardFormShowButton.appendChild(document.createTextNode('Add another reward')); 
    let icon = document.createElement('i');
    icon.classList.add('fas');
    icon.classList.add('fa-angle-double-down');
    rewardFormShowButton.appendChild(icon); 
  }
})

/*
ipc events to update form data:
  task-form
  entry-form
*/

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

  ipcRenderer.send('goals-request', {'command':'getGoal', 'title':arg['title']}); 
})

// add a current goal to the task scheisse. do something cheeky with button
// want to set a fresh page
ipcRenderer.on('task-load-reply', (event, arg) => {
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

    // no tasks so far!
    if(keys.length == 0){
      document.getElementById("task-entry-form").classList.remove('hide'); 
      let taskFormShowButton = document.getElementById('task-form-show-button');
      taskFormShowButton.innerHTML = ""; 
      taskFormShowButton.appendChild(document.createTextNode('Hide new task form'));
    }

  // show the new task form to make it easier
  } else {
    document.getElementById("task-entry-form").classList.remove('hide'); 
    let taskFormShowButton = document.getElementById('task-form-show-button');
    taskFormShowButton.innerHTML = ""; 
    taskFormShowButton.appendChild(document.createTextNode('Hide new task form'));
    let icon = document.createElement('i');
    icon.classList.add('fas');
    icon.classList.add('fa-angle-double-up');
    taskFormShowButton.appendChild(icon); 
  }
})

// add the clicked entry to the form OR set it all to blank canvas
ipcRenderer.on('entry-load-reply', (event, arg) => {
  document.getElementById("entry-title").value = "";
  document.getElementById("entry-text-input").value = ""; 
  document.getElementById("last-modified").innerHTML = ""; 

  // update with data from the button press
  if (arg != null) {
    document.getElementById("entry-title").value = arg[0]; 
    document.getElementById("entry-text-input").value = arg[1].text; 
    document.getElementById("last-modified").appendChild(document.createTextNode(arg[1].lastEdited))
  }
})
