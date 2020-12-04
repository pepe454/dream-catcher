const settings = require('electron-settings');
const {ipcMain} = require('electron')

async function getAllSettings(){
  let allSettings = await settings.getAll(); 
  return allSettings; 
}

async function updateSetting(setting, value) {
  await settings.set(setting, value);
}

async function testSuite(){
  await updateSetting('tips', true);
  let value = await settings.get('tips');
  console.log(value); 
  await updateSetting('tips', false);
  value = await settings.get('tips');
  console.log(value); 
  await updateSetting('themes', true);
  value = await settings.get('themes'); 
  console.log(value); 
  await updateSetting('welcome', false); 
  value = await settings.get('welcome'); 
  console.log(value); 
}

//testSuite();