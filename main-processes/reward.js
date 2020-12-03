const Store = require('electron-store');
const {ipcMain} = require('electron')

let store = new Store();

ipcMain.on('rewards-request', (event, arg) => {
  console.log(arg); 
  let payload = null; 
  let response = 'rewards-reply'; 
  if (arg.command == 'getRewards')
    payload = getRewards(); 
  else if (arg.command == 'getRandomReward') {
    response = 'random-reply'; 
    payload = getRandomReward();
  } else if (arg.command == 'setReward')
    payload = setReward(arg.title, arg.difficulty);
  else if (arg.command == 'deleteReward')
    payload = deleteReward(arg.title);
  else
    payload = 'Invalid command!';
  event.sender.send('random-reply', payload);
})

function getRewards() {
  return store.get('rewards');
}

function setReward(title, difficulty) {
  let rewards = store.get('rewards');
  if (Object.keys(rewards).includes(title))
    rewards[title].difficulty = difficulty;
  else
    rewards[title] = difficulty;
  store.set('rewards', rewards);
  return [title, difficulty, 0];
}

function deleteReward(title) {
  if (!store.has(`rewards.${title}`))
    return `Reward with title ${title} does not exist`;
  store.delete(`rewards.${title}`);
  return 'Reward deleted successfully'; 
}

function getRandomReward(difficulty) {
  let keys = Object.keys(store.get('rewards'));
  let len = keys.length; 
  if (len == 0)
    return 'There are no rewards saved'; 

  let count = 0; 
  while(true) {
    let index = Math.floor(Math.random() * len); 
    let key = keys[index];
    console.log(key); 
    let currDiff = store.get(`rewards.${key}`);
    console.log(currDiff);
    // within difficulty +/- 1 of the reward 
    if ((currDiff <= difficulty + 1) && (currDiff >= difficulty - 1))
      return [key, difficulty];
    else if (count == 5)
      return [key, difficulty];
    count++; 
  }
}

function testSuite() {
  setReward('5-star meal', 5);
  setReward('vacation', 5);
  setReward('drink with friends', 3);
  setReward('friends', 3);
  setReward('trip to candy store', 2);
  setReward('go on a drive', 2);
  setReward('stroll in the woods', 1); 
  setReward('talk with friends', 1); 

  console.log(getRewards());
  console.log(getRandomReward(1));
  console.log(getRandomReward(2));
  console.log(getRandomReward(3));
  console.log(getRandomReward(3));
  console.log(getRandomReward(4));
  console.log(getRandomReward(5));

  setReward('go on a drive', 5);
  setReward('stroll in the woods', 4); 
  setReward('talk with friends', 2); 
  console.log(getRewards());

  deleteReward('5-star meal', 5);
  deleteReward('vacation', 5);
  deleteReward('drink with friends', 3);
  deleteReward('friends', 3);
  deleteReward('trip to candy store', 2);
  deleteReward('go on a drive', 2);
  deleteReward('stroll in the woods', 1); 
  deleteReward('talk with friends', 1); 

  console.log(getRewards());
}

// testSuite();