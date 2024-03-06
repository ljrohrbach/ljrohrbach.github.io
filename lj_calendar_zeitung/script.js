document.addEventListener('DOMContentLoaded', function () {
  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

  const checklist = document.getElementById('checklist');
  const downloadBtn = document.getElementById('downloadBtn');
  const selectAllBtn = document.getElementById('selectAllBtn');

  // Sort checklist items by date
  events.sort((a, b) => {
    const dateA = createDateFromGermanFormat(a.startDate);
    const dateB = createDateFromGermanFormat(b.startDate);
    return dateA - dateB;
  });

  // Populate the checklist
  events.forEach((item, index) => {
    const listItem = document.createElement('li');

    var titleStr = `<font style="font-weight: normal">${item.title}</font>`;
    var descStr = item.description.length === 0 ? '' :  `<font color="grey">(${item.description})</font>`;

    if (typeof item.endDate === 'undefined' || item.endDate == item.startDate)
      listItem.innerHTML = `<input type="checkbox" checked="true" data-index="${index}"> ${item.startDate}: ${titleStr} ${descStr}`;
    else
      listItem.innerHTML = `<input type="checkbox" checked="true" data-index="${index}"> ${item.startDate} - ${item.endDate}: ${titleStr} ${descStr}`;
    checklist.appendChild(listItem);
  });

  selectAllBtn.addEventListener('click', function () {
    const checkboxes = document.querySelectorAll('#checklist input[type="checkbox"]');
    const isAnyUnselected = Array.from(checkboxes).some(checkbox => !checkbox.checked);
    checkboxes.forEach(checkbox => {
      checkbox.checked = isAnyUnselected;
    });

    selectAllBtn.textContent = !isAnyUnselected ? 'Alle auswählen' : 'Alle abwählen';
  });

window.onload = function() {
    selectAllBtn.click();
};

  downloadBtn.addEventListener('click', function () {
    const checklistItems = document.querySelectorAll('#checklist input[type="checkbox"]');
    const checkedItems = Array.from(checklistItems).filter(item => item.checked);

    if (checkedItems.length > 0) {
      const selectedData = checkedItems.map(item => checklistItems[item.dataset.index].parentNode.textContent.trim());
      const calendarData = generateICal(checkedItems, selectedData);
      downloadICal(calendarData);
    } else {
      alert('Bitte wähle mindestens einen Eintrag aus, bevor du "Herunterladen" klickst.');
    }
  });

  function generateICal(selectedItems, selectedData) {
    const calendarHeader = `BEGIN:VCALENDAR
VERSION:2.0
`;
    const calendarFooter = 'END:VCALENDAR\r\n';
    let calendarBody = '';

    selectedItems.forEach(item => {
      const itemEntry = events[item.dataset.index];
      const startDate = formatDate(itemEntry.startDate);

      const endTimeStr = itemEntry.endDate || itemEntry.startDate;
      const endDate = formatAddDay(endTimeStr, 1);

      const event = `
BEGIN:VEVENT
SUMMARY:${itemEntry.title}
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
DESCRIPTION:${itemEntry.description || ""}
TRANSP:TRANSPARENT
END:VEVENT
`;
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


