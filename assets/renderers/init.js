const {ipcRenderer} = require('electron')

async function addGoalsAndProgress() {
  console.log('sending out goals request');
  ipcRenderer.send('goals-request', {'command':'goalsAndProgress'}); 
}

async function addRewardsAndDifficulty() {
  console.log('sending out rewards request');
  ipcRenderer.send('rewards-request', {'command':'getRewards'}); 
}

async function addEntriesAndDates() {
  console.log('sending out entries request');
  ipcRenderer.send('journal-request', {'command':'namesAndDates'}); 
}

ipcRenderer.on('goals-reply', (event, arg) => {
  console.log(arg); 
  if ((typeof arg === 'object') && (arg.length == 0 || typeof arg[0] !== 'string')) {
    // add all goals to the goalslist
    let goalsList = document.getElementById('goals-list');
    arg.forEach(goal => {
      let li = document.createElement('li');
      let text = document.createTextNode(goal[0]);
      li.appendChild(text);
      let progress = document.createElement('progress')
      progress.setAttribute('max', 100);
      progress.setAttribute('value', goal[1]);
      li.appendChild(progress);
      goalsList.appendChild(li);
    });

    if (arg.length == 0) {
      let overview = document.getElementById('overview-section');
      let button = document.querySelector('.new-goal-button');
      let message = document.createElement('h4');
      let text = document.createTextNode("It looks like you haven't set any goals yet. Click the button below to get started!"); 
      message.appendChild(text); 
      overview.insertBefore(message, button);
    }
  }
})

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
  addRewardsAndDifficulty(); 
  addEntriesAndDates(); 
}

init(); 