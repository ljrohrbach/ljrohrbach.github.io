document.addEventListener('DOMContentLoaded', function () {
  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

  const checklist = document.getElementById('checklist');
  const downloadBtn = document.getElementById('downloadBtn');

  // Sort checklist items by date
  events.sort((a, b) => {
    const dateA = createDateFromGermanFormat(a.startDate);
    const dateB = createDateFromGermanFormat(b.startDate);
    return dateA - dateB;
  });

  // Populate the checklist
  events.forEach((item, index) => {
    const listItem = document.createElement('li');
    if (typeof item.endDate === 'undefined')
      listItem.innerHTML = `<input type="checkbox" data-index="${index}"> ${item.startDate}: ${item.title}`;
    else
      listItem.innerHTML = `<input type="checkbox" data-index="${index}"> ${item.startDate} - ${item.endDate}: ${item.title}`;
    checklist.appendChild(listItem);
  });

  downloadBtn.addEventListener('click', function () {
    const checklistItems = document.querySelectorAll('#checklist input[type="checkbox"]');
    const checkedItems = Array.from(checklistItems).filter(item => item.checked);

    if (checkedItems.length > 0) {
      const selectedData = checkedItems.map(item => checklistItems[item.dataset.index].parentNode.textContent.trim());
      const calendarData = generateICal(checkedItems, selectedData);
      downloadICal(calendarData);
    } else {
      alert('Bitte wähle mindestens einen Eintrag aus, bevor du "Herunterladen" klickst..');
    }
  });

  function generateICal(selectedItems, selectedData) {
    const calendarHeader = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n';
    const calendarFooter = 'END:VCALENDAR\r\n';
    let calendarBody = '';

    selectedItems.forEach(item => {
      const itemEntry = events[item.dataset.index];
      const startDate = formatDate(itemEntry.startDate);
      
      let event = '';
      
      console.log(itemEntry);
      if (typeof itemEntry.endDate === 'undefined'){
        event = `
BEGIN:VEVENT
SUMMARY:${itemEntry.title}
DTSTART:${startDate}
DESCRIPTION:${itemEntry.description || ""}
END:VEVENT
`;
      } else {
      const endDate = formatAddDay(itemEntry.endDate, 1);
      console.log(endDate);
            event = `
BEGIN:VEVENT
SUMMARY:${itemEntry.title}
DTSTART:${startDate}
DTEND:${endDate}
DESCRIPTION:${itemEntry.description || ""}
END:VEVENT
`;
      }
      calendarBody += event;
      });

    return calendarHeader + calendarBody + calendarFooter;
  }

  function downloadICal(calendarData) {
    const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'events.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function formatAddDay(dateString, nDays){
	  const date = createDateFromGermanFormat(dateString);
    return formatToYYYYMMDD(date.addDays(nDays));
  }

  function formatDate(dateString) {  
	  const date = createDateFromGermanFormat(dateString);
    return formatToYYYYMMDD(date);
  }

  function formatToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
  
  function createDateFromGermanFormat(dateString) {
    // Split the dateString into day, month, and year components
    const [day, month, year] = dateString.split('.');
  
    // JavaScript months are 0-indexed, so we subtract 1 from the month
    const monthIndex = parseInt(month, 10) - 1;
  
    // Create a new Date object using the components
    const formattedDate = new Date(year, monthIndex, day);
  
    return formattedDate;
  }
});
