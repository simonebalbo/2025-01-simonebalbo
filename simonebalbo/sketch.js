//Inizializz variabili (filtered è l'array che salva le righe filtrate)

let table = null;
let filtered = [];

function preload() {
  table = loadTable('simonebalbo/dataset.csv', 'csv', 'header');
}

function setup() {
  noCanvas(); 
  runApp(); // (no interazione utente)
}


//FILTRO (get e ciclo if)
function runApp() {
  const rows = table.getRows();
  filtered = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const c0 = Number(r.get(0));
    const c1 = Number(r.get(1));
    const c2 = r.get(2);
    const c3 = Number(r.get(3));
    const c4 = Number(r.get(4));
    if (c0 > 0 && Number.isInteger(c3) && c3 >= 30 && c3 < 42) {
      filtered.push([c0, c1, c2, c3, c4]);
    }
  }


  //Calcoli stat
  const col = (idx) => filtered.map(r => r[idx]); //idx=estraz colonna in un array

  const meanC0 = Stats.mean(col(0));
  const stdC1 = Stats.stddev(col(1));
  const modeC2 = Stats.mode(col(2));
  const medianC3 = Stats.median(col(3));

  document.getElementById('metric-mean-c0').textContent = meanC0.toFixed(2);
  document.getElementById('metric-std-c1').textContent = stdC1.toFixed(2);

  updateCharts();
  addHoverContent();
}

// Contenuto cards in hover
function addHoverContent() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach((card, index) => {
    let hoverDiv = card.querySelector('.hover-content');
    if (!hoverDiv) {
      hoverDiv = document.createElement('div');
      hoverDiv.className = 'hover-content';
      card.appendChild(hoverDiv);
    }
    
    // Switch per i casi di card
    const col = (idx) => filtered.map(r => r[idx]);
    
    switch(index) {


      case 0: // Media
        const meanC4 = Stats.mean(col(4));
        const stdC4 = Stats.stddev(col(4));
        hoverDiv.innerHTML = `
          <p><strong>Un valore unico che riassume più dati numerici</strong></p>
        `;
        break;


      case 1: // Dev Std
        const counts = new Array(12).fill(0);
        filtered.forEach(r => counts[r[3] - 30]++);
        const maxCount = Math.max(...counts);
        hoverDiv.innerHTML = `
          <p><strong>La dispersione di dati rispetto alla loro media</strong></p>
          <p>Count of values in range 30-41</p>
          <p>Total rows: ${filtered.length} | Max count: ${maxCount}</p>
        `;
        break;


      case 2: // Moda
        const mode = Stats.mode(col(2));
        const freq = {};
        col(2).forEach(v => freq[v] = (freq[v]||0)+1);
        hoverDiv.innerHTML = `
          <p><strong>Il valore più ricorrente</strong></p>
        `;
        break;


      case 3: // Mediana
        const meanC0 = Stats.mean(col(0));
        const minC0 = Math.min(...col(0));
        const maxC0 = Math.max(...col(0));
        hoverDiv.innerHTML = `
          <p><strong>Il valore centrale di un insieme di dati </strong></p>
    
        `;
        break;
        

        case 4: // FIX x media e devstd
        const valuesC4 = filtered.map(r => r[4]).filter(v => !isNaN(v));
        if(valuesC4.length > 0){
          const meanC4 = Stats.mean(valuesC4);
          const stdC4 = Stats.stddev(valuesC4);
      
          // TESTO CHE VA NELLA CARD 5
          document.getElementById('metric-std-c1').textContent = 
            ` ${meanC4.toFixed(2)}  ${stdC4.toFixed(2)}`;
        }
        break;
      
    }
  });
}




//Disegno grafici

function updateCharts() {
  const c3 = filtered.map(r => r[3]);
  const c2 = filtered.map(r => r[2]);
  const c1 = filtered.map(r => r[1]);

  // Col3 distribution
  const counts = new Array(12).fill(0);
  c3.forEach(v => counts[v - 30]++);
  drawBarChart('chart-col3', counts, Array.from({length:12}, (_,i)=>30+i));

  // Col2 mode
  const freq = {};
  c2.forEach(v => freq[v] = (freq[v]||0)+1);
  const labels = Object.keys(freq);
  const values = Object.values(freq);
  drawBarChart('chart-mode', values, labels);

  // Col1 stddev
  const mean = Stats.mean(c1);
  const std = Stats.stddev(c1);
  drawCurveChart('chart-col4', c1, mean, std);
}

function drawBarChart(canvasId, values, labels) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const W = canvas.width, H = canvas.height;
  const pad = 28;
  const maxVal = Math.max(...values) || 1;
  const barW = (W - pad*2)/values.length;

  // stile griglia graf
  ctx.strokeStyle = '#2a2d47';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  
  // linee griglia graf vert
  for (let i = 0; i <= values.length; i++) {
    const x = pad + (i / values.length) * (W - 2*pad);
    ctx.beginPath();
    ctx.moveTo(x, pad);
    ctx.lineTo(x, H - pad);
    ctx.stroke();
  }
  
  // linee griglia graf hor
  for (let i = 0; i <= 4; i++) {
    const y = pad + (i / 4) * (H - 2*pad);
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();
  }
  
  ctx.setLineDash([]);

  // Assi cart
  ctx.strokeStyle = '#a1a6b3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // X 
  ctx.moveTo(pad, H - pad);
  ctx.lineTo(W - pad, H - pad);
  // Y 
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, H - pad);
  ctx.stroke();

  // Tag asse Y
  ctx.fillStyle = '#a1a6b3';
  ctx.font = '12px ui-sans-serif, system-ui, -apple-system';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  
  for (let i = 0; i <= 4; i++) {
    const value = Math.round((maxVal / 4) * i);
    const y = H - pad - (i / 4) * (H - 2*pad);
    ctx.fillText(value.toString(), pad - 6, y);
  }

  // Nomi assi
  ctx.fillStyle = '#a1a6b3';
  ctx.font = 'bold 12px ui-sans-serif, system-ui, -apple-system';
  ctx.textAlign = 'center';
  ctx.fillText('Numero', W/2, H - 4); // Moved up to avoid overlap
  
  ctx.save();
  ctx.translate(8, H/2); // Moved left to avoid overlap
  ctx.rotate(-Math.PI/2);
  ctx.fillText('Frequenza', 0, 0);
  ctx.restore();

  // Draw bars
  values.forEach((v,i)=>{
    const x = pad + i*barW;
    const y = H - pad - (v/maxVal)*(H-pad*2);
    ctx.fillStyle = '#ff7b00';
    ctx.fillRect(x, y, barW-4, (v/maxVal)*(H-pad*2));
    ctx.fillStyle='#a1a6b3';
    ctx.font='12px sans-serif';
    ctx.textAlign='center';
    ctx.fillText(v, x+barW/2, y-6);
    ctx.fillText(labels[i], x+barW/2, H-pad+12);
  });
}




function drawCurveChart(canvasId, values, mean, std) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const W = canvas.width, H = canvas.height;
  const pad = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Generate x-axis labels (5 divisions)
  const xLabels = [];
  for (let i = 0; i <= 5; i++) {
    const value = min + (max - min) * i / 5;
    xLabels.push(value.toFixed(1));
  }

  // Draw grid lines
  ctx.strokeStyle = '#2a2d47';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  
  // Vertical grid lines
  for (let i = 0; i <= 5; i++) {
    const x = pad + (i / 5) * (W - 2*pad);
    ctx.beginPath();
    ctx.moveTo(x, pad);
    ctx.lineTo(x, H - pad);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let i = 0; i <= 4; i++) {
    const y = pad + (i / 4) * (H - 2*pad);
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();
  }
  
  ctx.setLineDash([]);

  // Draw main axes
  ctx.strokeStyle = '#a1a6b3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // X axis
  ctx.moveTo(pad, H - pad);
  ctx.lineTo(W - pad, H - pad);
  // Y axis
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, H - pad);
  ctx.stroke();

  // Draw axis labels
  ctx.fillStyle = '#a1a6b3';
  ctx.font = '12px ui-sans-serif, system-ui, -apple-system';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // X axis labels
  for (let i = 0; i <= 5; i++) {
    const x = pad + (i / 5) * (W - 2*pad);
    ctx.fillText(xLabels[i], x, H - pad + 2);
  }
  
  // Y axis labels
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) {
    const value = (i / 4).toFixed(1);
    const y = H - pad - (i / 4) * (H - 2*pad);
    ctx.fillText(value, pad - 2, y);
  }

  // Add axis titles
  ctx.fillStyle = '#a1a6b3';
  ctx.font = 'bold 12px ui-sans-serif, system-ui, -apple-system';
  ctx.textAlign = 'center';
  ctx.fillText('% di deviazione dalla media', W/1.18, H - 4); 
  
  ctx.save();
  ctx.translate(4, H/2); 
  ctx.rotate(-Math.PI/2);
  ctx.fillText('Distribuzione', 0, 0);
  ctx.restore();

  // Draw the curve
  ctx.beginPath();
  const N = 100;
  for(let i=0;i<=N;i++){
    const xVal = min + (max-min)*i/N;
    const yVal = Math.exp(-0.5*((xVal-mean)/std)**2);
    const x = pad + (xVal-min)/(max-min)*(W-2*pad);
    const y = H - pad - yVal*(H-2*pad)*0.8;
    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  }
  ctx.strokeStyle='#ff7b00';
  ctx.lineWidth=3;
  ctx.stroke(); 

  // Linea della media
  const mx = pad + (mean-min)/(max-min)*(W-2*pad);
  ctx.strokeStyle='#008080';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(mx, pad);
  ctx.lineTo(mx, H-pad);
  ctx.stroke();

  // sigma e mu del grafico
  ctx.fillStyle = '#008080';
  ctx.font = 'bold 12px ui-sans-serif, system-ui, -apple-system';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`μ = ${mean.toFixed(2)}`, mx, pad - 8);
  
  ctx.font = 'bold 12px ui-sans-serif, system-ui, -apple-system';
  ctx.fillText(`σ = ${std.toFixed(2)}`, mx, H - pad + 31);

}

// Exp/contraz cards con hover
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".cards .card");
  const grid = document.querySelector(".cards");
  if (!grid || cards.length === 0) return;

  cards.forEach((card, index) => {
    card.addEventListener("mouseenter", () => {
      grid.classList.add("expanded");
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      switch (index) {
        case 0: grid.style.gridTemplateColumns = "2fr 0.5fr 0.5fr 0.5fr 0.5fr"; break;
        case 1: grid.style.gridTemplateColumns = "0.5fr 2fr 0.5fr 0.5fr 0.5fr"; break;
        case 2: grid.style.gridTemplateColumns = "0.5fr 0.5fr 2fr 0.5fr 0.5fr"; break;
        case 3: grid.style.gridTemplateColumns = "0.5fr 0.5fr 0.5fr 2fr 0.5fr"; break;
        case 4: grid.style.gridTemplateColumns = "0.5fr 0.5fr 0.5fr 0.5fr 2fr"; break;
        default: grid.style.gridTemplateColumns = "repeat(5,1fr)";
      }
    });

    card.addEventListener("mouseleave", () => {
      grid.classList.remove("expanded");
      cards.forEach(c => c.classList.remove("active"));
      grid.style.gridTemplateColumns = "repeat(5,1fr)";
    });
  });
});
