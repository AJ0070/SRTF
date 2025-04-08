function addRow() {
    const table = document.getElementById("processTable");
    const rowCount = table.rows.length;
    const row = table.insertRow();
    row.innerHTML = `
      <td>P${rowCount}</td>
      <td><input type="number" name="arrival" required></td>
      <td><input type="number" name="burst" required></td>
    `;
  }
  
  document.getElementById("schedulerForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const arrivals = Array.from(document.getElementsByName("arrival")).map(i => parseInt(i.value));
    const bursts = Array.from(document.getElementsByName("burst")).map(i => parseInt(i.value));
  
    const processes = arrivals.map((a, i) => ({
      id: `P${i+1}`,
      arrival: a,
      burst: bursts[i],
      remaining: bursts[i],
      completion: 0,
      waiting: 0,
      turnaround: 0,
      started: false
    }));
  
    srtf(processes);
  });
  
  function srtf(processes) {
    const timeline = [];
    let time = 0;
    let lastProcess = null;
    let completed = 0;
  
    while (completed < processes.length) {
      const available = processes.filter(p => p.arrival <= time && p.remaining > 0);
  
      let current = null;
      if (available.length) {
        current = available.reduce((a, b) => a.remaining < b.remaining ? a : b);
      }
  
      if (current) {
        if (lastProcess !== current.id) {
          timeline.push({ id: current.id, start: time, duration: 1 });
        } else {
          timeline[timeline.length - 1].duration += 1;
        }
  
        current.remaining -= 1;
  
        if (current.remaining === 0) {
          current.completion = time + 1;
          completed += 1;
        }
  
        lastProcess = current.id;
      } else {
        if (lastProcess !== "idle") {
          timeline.push({ id: "idle", start: time, duration: 1 });
        } else {
          timeline[timeline.length - 1].duration += 1;
        }
        lastProcess = "idle";
      }
  
      time += 1;
    }
  
    showGantt(timeline);
    showResults(processes);
  }
  
  function showGantt(gantt) {
    const chart = document.getElementById("chartContainer");
    chart.innerHTML = "";
    let index = 0;
  
    document.getElementById("ganttChart").classList.remove("hidden");
  
    const interval = setInterval(() => {
      if (index >= gantt.length) {
        clearInterval(interval);
        return;
      }
  
      const block = document.createElement("div");
      block.className = "gantt-bar";
      block.textContent = gantt[index].id;
      block.style.width = `${gantt[index].duration * 30}px`;
      chart.appendChild(block);
      index++;
    }, 500);
  }
  
  function showResults(processes) {
    const table = document.getElementById("resultTable");
    table.innerHTML = `<tr><th>Process</th><th>Waiting Time</th><th>Turnaround Time</th></tr>`;
    document.getElementById("results").classList.remove("hidden");
  
    processes.forEach(p => {
      p.turnaround = p.completion - p.arrival;
      p.waiting = p.turnaround - p.burst;
  
      const row = table.insertRow();
      row.innerHTML = `
        <td>${p.id}</td>
        <td>${p.waiting}</td>
        <td>${p.turnaround}</td>
      `;
    });
  }
  