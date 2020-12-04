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

async function getAllSettings() {
  ipcRenderer.send('settings-request', {'command':'getSettings'}); 
}

function createGoalItem(goal) {
  let li = document.createElement('li');
  li.setAttribute('id', `goal-list-item-${goal[0]}`);
  let goalButton = document.createElement('button')
  goalButton.classList.add('page-list-button'); 
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
  progress.setAttribute('value', goal[1]);
  progress.setAttribute('id', `progress-${goal[0]}`);
  li.appendChild(progress);
  return li;
}

ipcRenderer.on('goals-load-reply', (event, arg) => {
  let goalsList = document.getElementById('goals-list');
  // add all goals and progress to the list. 
  if (arg.length > 1) {
    arg.forEach(goal => {
      let li = createGoalItem(goal); 
      goalsList.appendChild(li);
    });
  }

  // may need to update or add new or delete
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

function createEntryItem(entry) {
  let entryListItem = document.createElement('li');
  entryListItem.setAttribute('id', `entry-list-item-${entry[0]}`);
  let entryButton = document.createElement('button'); 
  entryButton.classList.add('page-list-button'); 
  entryButton.appendChild(document.createTextNode(entry[0])); 
  entryButton.setAttribute('type', 'button');
  entryButton.setAttribute('data-section', 'single-entry');
  entryButton.setAttribute('data-request', 'journal'); 
  entryButton.setAttribute('data-command', 'entryAndText'); 
  entryButton.setAttribute('data-title', entry[0]); 

  let span = document.createElement('span'); 
  span.setAttribute('id', `entry-modified-${entry[0]}`);
  span.appendChild(document.createTextNode( `${entry[1]}`));
  entryListItem.appendChild(entryButton); 
  entryListItem.appendChild(span);
  return entryListItem;
}

ipcRenderer.on('journal-load-reply', (event, arg) => {
  console.log(arg); 
  let length = arg.length; 
  let entryList = document.getElementById('journal-entries-list');

  // no need to do checks. we're getting the whole shebang here 
  if (length > 1) {
    arg.forEach(entry => {
      let entryListItem = createEntryItem(entry); 
      entryList.appendChild(entryListItem);
    })
  }

  // need to check. could be an update of the last modified date
  else if (length == 1) {
    let entry = arg[0]; 
    let entrySearch = document.getElementById(`entry-list-item-${entry[0]}`);
    if (entrySearch == null) {
      let entryListItem = createEntryItem(entry); 
      entryList.appendChild(entryListItem);
      // if we are creating a new entry AND there were no entries before, REMOVE the no-entries message.
      let message = document.getElementById('empty-journal-message'); 
      if (message != null)
        message.remove();
    }

    // update the the LastEdited span
    else {
      let lastEdited = document.getElementById(`entry-modified-${entry[0]}`);
      lastEdited.innerHTML = ""; 
      lastEdited.appendChild(document.createTextNode(entry[1])); 
    }
  }
  
  // add empty journal message
  else {
    let journalSection = document.getElementById('journal-section');
    let message = document.createElement('h4');
    let text = document.createTextNode("It looks like you haven't written any entries yet. Click the button below to get started!"); 
    message.appendChild(text); 
    message.setAttribute('id', 'empty-journal-message'); 
    journalSection.insertBefore(message, entryList);
  }
})

function createRewardListItem(reward) {
  let rewardListItem = document.createElement('li');
  rewardListItem.setAttribute('id', `reward-list-item-${reward[0]}`);
  rewardListItem.appendChild(document.createTextNode(reward[0]));

  // stars, make it pretty :) 
  let difficulty = document.createElement('span'); 
  difficulty.classList.add('difficulty-span'); 
  difficulty.setAttribute('id',`reward-difficulty-${reward[0]}`);
  console.log(reward[1]); 
  for (let i = 1; i < 6; i++) {
    let starSpan = document.createElement('span'); 
    starSpan.classList.add('fa');
    starSpan.classList.add('fa-star');
    if (i <= reward[1])  
      starSpan.classList.add('orange-star'); 
    difficulty.appendChild(starSpan);
  }
  rewardListItem.appendChild(difficulty);
  return rewardListItem;
}

ipcRenderer.on('rewards-reply', (event, arg) => {
  console.log(arg); 
  let rewardList = document.getElementById('rewards-list');
  if (arg.length > 1) {
    arg.forEach(reward => {
      let rewardListItem = createRewardListItem(reward); 
      rewardList.appendChild(rewardListItem);
    })
  }

  else if (arg.length == 1) {
    let rewardSearch = document.getElementById(`reward-list-item-${arg[0]}`);
    if (rewardSearch == null) {
      let rewardListItem = createRewardListItem(arg[0]); 
      rewardList.appendChild(rewardListItem);
      // if we are creating a new reward AND there were no rewards before, REMOVE the no-rewards message.
      let message = document.getElementById('empty-rewards-message'); 
      if (message != null)
        message.remove();
    }

    // update difficulty
    else {
      let difficulty = document.getElementById(`reward-difficulty-${reward[0]}`);
      difficulty.innerHTML = ""; 
      for (let i = 1; i < 6; i++) {
        let starSpan = document.createElement('span'); 
        starSpan.classList.add('fa');
        starSpan.classList.add('fa-star');
        if (i <= reward[1])  
          starSpan.classList.add('orange-star'); 
        difficulty.appendChild(starSpan);
      }
    }
  }
  
  // no rewards :(
  else {
    let rewardSection = document.getElementById('rewards-section');
    let message = document.createElement('h4');
    message.setAttribute('id', 'empty-rewards-message'); 
    message.appendChild(document.createTextNode("It looks like you haven't set any rewards yet. Create a reward below to get started!")); 
    rewardSection.insertBefore(message, rewardList);
    document.getElementById("reward-entry-form").classList.remove('hide'); 
    let rewardFormShowButton = document.getElementById('reward-form-show-button');
    rewardFormShowButton.innerHTML = ""; 
    let icon = document.createElement('i');
    icon.classList.add('far');
    icon.classList.add('fa-angle-double-down');
    rewardFormShowButton.appendChild(document.createTextNode('Hide new reward form'));
    rewardFormShowButton.appendChild(icon); 
  }
})

function init() {
  addGoalsAndProgress();
  addEntriesAndDates(); 
  addRewardsAndDifficulty(); 
}

init(); 