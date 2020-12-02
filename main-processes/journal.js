const Store = require('electron-store');
const {ipcMain} = require('electron')

let store = new Store();

ipcMain.on('journal-request', (event, arg) => {
  console.log(arg); 
  let payload = null; 
  if (arg.command == 'namesAndDates')
    payload = getNamesAndDates(); 
  else if (arg.command == 'getEntry')
    payload = getEntry(arg.title);
  else if (arg.commaand == 'setEntry')
    payload = setEntry(arg.title, arg.text);
  else if (arg.command == 'createEntry')
    payload = createEntry(arg.title, arg.text);
  else if (arg.command == 'deleteEntry')
    payload = deleteEntry(arg.title);
  else
    payload = 'Invalid command!';
  event.sender.send('journal-reply', payload);
})

function getNamesAndDates() {
  let namesAndDates = new Array();
  let keys = Object.keys(store.get('journal'));
  keys.forEach(key => {
    let keyDate = store.get(`journal.${key}.lastEdited`);
    namesAndDates.push([key, keyDate])
  });
  return namesAndDates;
}

function getEntry(title) {
  if (!store.has(`journal.${title}`))
    return null;
  let entry = store.get(`journal.${title}`);
  return entry;
}

function setEntry(title, text) {
  let today = new Date().toLocaleDateString();
  let journal = store.get('journal');
  if (Object.keys(journal).includes(title)) {
    let entry = journal[title];
    entry.text = text; 
    entry.lastEdited = today;     
  } else {
    journal[title] = {
      text: text, 
      lastEdited: today
    }
  }
  store.set('journal', journal);
  return 'Entry updated successfully'; 
}

function createEntry(title, text) {
  if (!store.has(`journal.${title}`))
    return `An entry with the title ${title} exists in the journal`;
  setEntry(title, text); 
  return 'Entry created successfully';
}

function deleteEntry(title) {
  if (!store.has(`journal.${title}`))
    return `No entry with title ${title} exists`;
  store.delete(`journal.${title}`);
  return 'Entry deleted successfully'; 
}

function testSuite() {
  setEntry('First entry woohoo!', "I'm the happiest man to walk this planet!");
  console.log(getEntry('First entry woohoo!'));
  setEntry('First entry woohoo!', "I'm walking on my bare knuckles!");
  console.log(getEntry('First entry woohoo!'));
  console.log(getNamesAndDates());
  console.log(deleteEntry('First entry woohoo!'));
  console.log(getEntry('First entry woohoo!'));
}

// testSuite();