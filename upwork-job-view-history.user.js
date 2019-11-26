// ==UserScript==
// @name         Upwork Job View History
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.upwork.com/ab/jobs/search/*
// @grant        none
// ==/UserScript==

(function() {

const storageKey = 'upwork-history'
const getStorageHistory = () => {
  const storageString = localStorage.getItem(storageKey)
  if (!storageString) {
    return {}
  }
  let storageObject
  try {
    storageObject = JSON.parse(storageString)
  } catch (e) {
    console.error(e)
    console.error('Upwork-history: Failed to parse storage JSON')
    localStorage.removeItem(storageKey)
    storageObject = {}
  }
  return storageObject
}
const getUpworkJobSections = () => [...document.querySelectorAll('section.job-tile')]
const jobSectionToId = (sectionEl) => sectionEl.querySelector('.job-title-link').href
const markJobSectionViewed = (sectionEl) => sectionEl.style.backgroundColor = '#f5f7ff'
const markJobSectionViewedIfIncluded = (viewedJobIdsFromStorage) => (sectionEl) => {
  const jobId = jobSectionToId(sectionEl)
  if (!sectionEl.upworkHistoryHandled && viewedJobIdsFromStorage.has(jobId)) markJobSectionViewed(sectionEl)
  sectionEl.upworkHistoryHandled = true
  return jobId;
}

function runUpworkHistory() {
  const storageHistory = getStorageHistory()
  const jobSections = getUpworkJobSections()
  const viewedJobIdsFromStorage = new Set((storageHistory.viewedJobIds || []))
  const onpageJobIds = jobSections.map(markJobSectionViewedIfIncluded(viewedJobIdsFromStorage))

  const storageUpdate = {
    viewedJobIds: [...(new Set(([...viewedJobIdsFromStorage, ...onpageJobIds])))],
  }
  localStorage.setItem(storageKey, JSON.stringify(storageUpdate))
}
const scriptIntervalId = setInterval(runUpworkHistory, 1000)
window.__upworkJobViewHistory = {clear: () => {clearInterval(scriptIntervalId); localStorage.removeItem(storageKey); location.reload()}}
runUpworkHistory()

})();
