window.onload = function () {
  let processCount = 1;

  window.addProcess = function () {
    processCount++;
    const table = document.getElementById("tableBody");
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>P${processCount}</td>
      <td><input type="number"></td>
      <td><input type="number"></td>
    `;

    table.appendChild(row);
  };

  window.runSRTF = function () {
    const rows = document.querySelectorAll("#tableBody tr");
    const processes = [];

    rows.forEach((row, i) => {
      const arrival = parseInt(row.cells[1].children[0].value);
      const burst = parseInt(row.cells[2].children[0].value);
      if (isNaN(arrival) || isNaN(burst)) return;
      processes.push({
        id: `P${i + 1}`,
        arrival,
        burst,
        remaining: burst,
        completed: false,
      });
    });

    let time = 0,
      completed = 0;
    const n = processes.length;
    const gantt = [];
    const wt = Array(n).fill(0);
    const tat = Array(n).fill(0);

    while (completed !== n) {
      let idx = -1;
      let min = Infinity;
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
        gantt.push(processes[idx].id);
        processes[idx].remaining--;
        time++;

        if (processes[idx].remaining === 0) {
          processes[idx].completed = true;
          completed++;
          let finish = time;
          tat[idx] = finish - processes[idx].arrival;
          wt[idx] = tat[idx] - processes[idx].burst;
        }
      }
    }

    drawGantt(gantt);
    drawResults(processes, wt, tat);
  };

  function drawGantt(gantt) {
    const container = document.getElementById("ganttChart");
    container.innerHTML = "";

    gantt.forEach((entry) => {
      const block = document.createElement("div");
      block.className = "gantt-block";
      block.innerText = entry;
      container.appendChild(block);
    });
  }

  function drawResults(processes, wt, tat) {
    const tbody = document.getElementById("resultBody");
    tbody.innerHTML = "";
    processes.forEach((p, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.id}</td>
        <td>${wt[i]}</td>
        <td>${tat[i]}</td>
      `;
      tbody.appendChild(row);
    });
  }
};
