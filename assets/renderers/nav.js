document.body.addEventListener('click', (event) => {
  console.log(event)
  if (event.target.dataset.section) {
    handleSectionTrigger(event)
  }
})

function handleSectionTrigger (event) {
  hideAllSectionsAndDeselectButtons()
  // Highlight clicked button
  event.target.classList.add('is-selected')
  // Display the current section
  const sectionId = `${event.target.dataset.section}-section`
  document.getElementById(sectionId).classList.remove('hide')
}

function hideAllSectionsAndDeselectButtons () {
  const sections = document.querySelectorAll('.app-content')
  Array.prototype.forEach.call(sections, (section) => {
    section.classList.add('hide')
  })

  const buttons = document.querySelectorAll('.is-selected')
  Array.prototype.forEach.call(buttons, (button) => {
    button.classList.remove('is-selected')
  })
}