const parseCsvToTimes = (lines) => {
  console.log("Parsing CSV to Time Data");

  let currDate = null;
  let currContent = [];

  const times = [];
  // const days = [];

  let timeId = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.data[0] === "") continue;

    if (isValidDate(line.data[0])) {
      currDate = line.data[0];
      console.log("Found Date: ", currDate);
      continue;
    }

    if (!currDate) {
      throw Error("file messed up");
    }

    let parsedMin = parseInt(line.data[3]);
    const minutes = parsedMin ? parsedMin : 0;

    // billable if not liaison and billable column is not marked 'N'
    const billable = !(
      line.data[0] === "Liaison" ||
      (line.data.length > 5 && line.data[5] == "N")
    );

    const content = {
      id: timeId++,
      day: currDate,
      customer: line.data[0],
      serviceItem: line.data[1],
      notes: line.data[2],
      minutes: minutes,
      billable: billable,
    };

    times.push(content);
  }

  return times;
};

function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
}

export { parseCsvToTimes };
