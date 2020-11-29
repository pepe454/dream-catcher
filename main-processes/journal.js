const Store = require('electron-store');
let store = new Store();

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
}

function deleteEntry(title) {
  if (!store.has(`journal.${title}`)) {
    return false;
  }
  store.delete(`journal.${title}`);
  return true; 
}

function getNamesAndDates() {
  let namesAndDates = new Array();
  let keys = Object.keys(store.get('journal'));
  keys.forEach(key => {
    let keyDate = store.get(`journal.${key}.lastEdited`);
    namesAndDates.push([key, keyDate])
  });
  return namesAndDates;
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