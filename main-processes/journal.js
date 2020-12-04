const Store = require('electron-store');
const {ipcMain} = require('electron')

let store = new Store();

ipcMain.on('journal-request', (event, arg) => {
  // console.log(arg); 
  let payload = null; 
  let response = 'journal-load-reply'; 
  if (arg.command == 'namesAndDates')
    payload = getNamesAndDates(); 
  else if (arg.command == 'entryAndText') {
    payload = getEntryAndText(arg.title); 
    response = 'entry-load-reply'; 
  }
  else if (arg.command == 'getEntry')
    payload = getEntry(arg.title);
  else if (arg.command == 'setEntry')
    payload = setEntry(arg.title, arg.text);
  else if (arg.command == 'deleteEntry')
    payload = deleteEntry(arg.title);
  else
    payload = 'Invalid command!';
  event.sender.send(response, payload);
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

function getEntryAndText(title) {
  // useful for a "dumb load" 
  if (!store.has(`journal.${title}`))
    return null;
  let entry = store.get(`journal.${title}`);
  return [title, entry]; 
}

function getEntry(title) {
  if (!store.has(`journal.${title}`))
    return null;
  let entry = store.get(`journal.${title}`);
  return [[title, entry['lastEdited']]]; 
}

function setEntry(title, text) {
  if (!store.has(`journal.${title}`))
    createEntry(title); 
  let today = new Date().toLocaleDateString();
  store.set(`journal.${title}`, {'text': text, 'lastEdited':today});
  return getEntry(title); 
}

function createEntry(title, text) {
  if (!store.has(`journal.${title}`))
    return `An entry with the title ${title} exists in the journal`;
  store.set(`journal.${title}`, {'text': '', 'lastEdited':''});
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