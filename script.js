window.onload = function () {

  const cursor = document.createElement("div");
  cursor.classList.add("custom-cursor");
  document.body.appendChild(cursor);

  // Move cursor with mouse
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  // Optional: fade cursor out after inactivity
  let timeout;
  document.addEventListener("mousemove", () => {
    cursor.style.opacity = "1";
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cursor.style.opacity = "0";
    }, 3000);
  });
  
  let processCount = 1;

  window.addProcess = function () {
    processCount++;
    const table = document.getElementById("tableBody");
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>P${processCount}</td>
      <td><input type="number" /></td>
      <td><input type="number" /></td>
    `;

    table.appendChild(row);
  };

  window.runSRTF = function () {
    const rows = document.querySelectorAll("#tableBody tr");
    const processes = [];

    rows.forEach((row, i) => {
      const arrival = parseInt(row.cells[1].children[0].value);
      const burst = parseInt(row.cells[2].children[0].value);
      if (!isNaN(arrival) && !isNaN(burst)) {
        processes.push({
          id: `P${i + 1}`,
          arrival,
          burst,
          remaining: burst,
          completed: false,
          startTime: null,
          completionTime: 0,
        });
      }
    });

    let time = 0, completed = 0;
    const n = processes.length;
    const gantt = [];

    while (completed < n) {
      let idx = -1, min = Infinity;

      for (let i = 0; i < n; i++) {
        if (
          !processes[i].completed &&
          processes[i].arrival <= time &&
          processes[i].remaining < min &&
          processes[i].remaining > 0
        ) {
          min = processes[i].remaining;
          idx = i;
        }
      }

      if (idx === -1) {
        gantt.push("idle");
        time++;
      } else {
        if (processes[idx].startTime === null)
          processes[idx].startTime = time;

        gantt.push(processes[idx].id);
        processes[idx].remaining--;
        time++;

        if (processes[idx].remaining === 0) {
          processes[idx].completed = true;
          processes[idx].completionTime = time;
          completed++;
        }
      }
    }

    drawGantt(gantt);

    // Calculate & display result table
    let totalWT = 0, totalTAT = 0, totalRT = 0;
    const tbody = document.getElementById("resultBody");
    tbody.innerHTML = "";

    processes.forEach(p => {
      const tat = p.completionTime - p.arrival;
      const wt = tat - p.burst;
      const rt = p.startTime - p.arrival;

      totalWT += wt;
      totalTAT += tat;
      totalRT += rt;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.id}</td>
        <td>${p.completionTime}</td>
        <td>${wt}</td>
        <td>${tat}</td>
        <td>${rt}</td>
      `;
      tbody.appendChild(row);
    });

    const avgWT = (totalWT / n).toFixed(2);
    const avgTAT = (totalTAT / n).toFixed(2);
    const avgRT = (totalRT / n).toFixed(2);

    document.getElementById("averages").innerText =
      `Average WT: ${avgWT}, TAT: ${avgTAT}, RT: ${avgRT}`;
  };

  function drawGantt(gantt) {
    const container = document.getElementById("ganttChart");
    container.innerHTML = "";
    gantt.forEach(entry => {
      const block = document.createElement("div");
      block.className = "gantt-block";
      block.innerText = entry;
      container.appendChild(block);
    });
  }
};
