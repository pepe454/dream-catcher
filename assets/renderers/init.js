const {ipcRenderer} = require('electron')

async function addGoalsAndProgress() {
  ipcRenderer.send('goals-request', {'command':'goalsAndProgress'}); 
}

async function addEntriesAndDates() {
  ipcRenderer.send('journal-request', {'command':'namesAndDates'}); 
}

async function addRewardsAndDifficulty() {
  ipcRenderer.send('rewards-request', {'command':'getRewards'}); 
}

function createGoalItem(goal) {
  let li = document.createElement('li');
  li.setAttribute('id', `goal-list-item-${goal[0]}`);
  let goalButton = document.createElement('button')
  let text = document.createTextNode(goal[0]);
  goalButton.appendChild(text); 
  goalButton.setAttribute('type', 'button');
  goalButton.setAttribute('data-section', 'single-goal');
  goalButton.setAttribute('data-request', 'goals'); 
  goalButton.setAttribute('data-command', 'goalAndTaskList'); 
  goalButton.setAttribute('data-title', goal[0]); 

  li.appendChild(goalButton); 
  // li.appendChild(text);
  let progress = document.createElement('progress')
  progress.setAttribute('max', 100);
  console.log(`progress is ${goal[1]}`);
  progress.setAttribute('value', goal[1]);
  progress.setAttribute('id', `progress-${goal[0]}`);
  li.appendChild(progress);
  return li;
}

ipcRenderer.on('goals-load-reply', (event, arg) => {
  // arg should be a list of goals
  let goalsList = document.getElementById('goals-list');
  console.log(`goal is ${arg}`);

  // add all goals and progress to the list. 
  if (arg.length > 1) {
    arg.forEach(goal => {
      let li = createGoalItem(goal); 
      goalsList.appendChild(li);
    });
  }

  else if (arg.length == 1) {
    let goal = arg[0]; 
    let goalSearch = document.getElementById(`goal-list-item-${goal[0]}`);
    // goal is not in the list - add a new element!
    if (goalSearch == null) {
      let li = createGoalItem(goal); 
      goalsList.appendChild(li); 
      // if we are creating a new goal AND there were no goals before, REMOVE the no-goals message.
      let message = document.getElementById('no-goals-message'); 
      if (message != null)
        message.remove();
    }
  
    // goal IS in the task list - update or delete
    else {
      if (goal[1] >= 0) {
        let progress = document.getElementById(`progress-${goal[0]}`);
        progress.setAttribute('value', goal[1])
      // progress is < 0, the intention is to delete 
      } else
        goalSearch.remove();
    }
  }

  // no goals... want to give the user the message
  else if (arg.length == 0) {
    let overview = document.getElementById('overview-section');
    let message = document.createElement('h4');
    message.setAttribute('id', 'no-goals-message'); 
    let text = document.createTextNode("It looks like you haven't set any goals yet. Click the button below to get started!"); 
    message.appendChild(text); 
    overview.insertBefore(message, goalsList);
  }
})

ipcRenderer.on('journal-reply', (event, arg) => {
  console.log(arg); 
  let keys = Object.keys(arg); 
  if ((typeof arg === 'object') && (keys.length > 0) && (arg.length < 3 || arg[2] != 0)) {
    let entryList = document.getElementById('journal-entries-list');
    keys.forEach(entry => {
      let li = document.createElement('li');
      let span = document.createElement('span'); 
      let text = document.createTextNode(entry); 
      // this will have x-stars for the difficulty
      let date = document.createTextNode(` Last modified: ${arg[entry]}`);
      li.appendChild(text);
      span.appendChild(date);
      li.appendChild(span);
      entryList.appendChild(li);
    })
  }
  
  if (keys.length == 0) {
    let journalSection = document.getElementById('journal-section');
    let entryList = document.getElementById('journal-entries-list');
    let message = document.createElement('h4');
    let text = document.createTextNode("It looks like you haven't written any entries yet. Click the button below to get started!"); 
    message.appendChild(text); 
    journalSection.insertBefore(message, entryList);
  }
})

function init() {
  addGoalsAndProgress();
  // addRewardsAndDifficulty(); 
  // addEntriesAndDates(); 
}

init(); 