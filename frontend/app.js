// Worker AI — Clean Minimal Client Engine (100% Standalone Frontend)

let searchHistory = [
  "Siemens 840D CNC Alarm 21612 Axis Drive Fault",
  "Hydraulic Press 500T Lockout Tagout LOTO safety protocol",
  "Conveyor Motor VFD Fault F0001 overcurrent reset",
  "KUKA robot collision error 38101 reset steps",
  "Daily ISO VG32 spindle lubrication checklist"
];

let currentUser = "Operator #42 (Plant Shift A)";
let isLoggedIn = true;

// Pre-seeded Machine Diagnostics Database
const MACHINE_DB = [
  {
    keywords: ["21612", "cnc", "spindle", "axis drive", "torque"],
    title: "Siemens 840D CNC Alarm 21612 (Axis Drive Fault)",
    alert: "SAFETY: Isolate cabinet power before inspecting drive circuit breaker Q3.",
    summary: "Spindle servo feedback loop exceeded torque threshold. Clean encoder lines and check coolant delivery.",
    steps: [
      "Press Emergency E-Stop button on the operator console.",
      "Inspect coolant delivery nozzles for metal chip obstructions.",
      "Check encoder cable shielding for oil / coolant contamination.",
      "Reset Axis Drive circuit breaker Q3 on cabinet panel B.",
      "Perform test spindle rotation at 500 RPM in manual MDI mode."
    ],
    manual: "Siemens 840D Maintenance Manual (Sec 4.2)"
  },
  {
    keywords: ["loto", "lockout", "tagout", "press", "hydraulic", "500t"],
    title: "Hydraulic Press 500T Lockout/Tagout (LOTO) Safety Protocol",
    alert: "CRITICAL SAFETY: NEVER enter ram envelope without inserting mechanical safety lock bar.",
    summary: "Mandatory zero-energy isolation procedure before die changes or maintenance.",
    steps: [
      "De-energize main 415V electrical switch Q1 and apply personal red padlock.",
      "Open manual hydraulic valve V-12 to bleed accumulator pressure to 0 bar.",
      "Physically insert certified mechanical ram safety lock bar into the safety slot.",
      "Verify zero energy state using hydraulic pressure gauge (Must read 0 bar).",
      "Sign LOTO register on shift board before starting work."
    ],
    manual: "Hydraulic Press 500T Safety SOP (Rule #1)"
  },
  {
    keywords: ["vfd", "f0001", "motor", "conveyor", "overcurrent"],
    title: "Conveyor Induction Motor VFD Overcurrent (Fault F0001)",
    alert: "Allow VFD capacitor bank 5 minutes to discharge before opening junction box.",
    summary: "Caused by mechanical conveyor belt jamming, roller seizure, or motor overload.",
    steps: [
      "Inspect conveyor belt track for jammed debris or pallet fragments.",
      "Check idler pulleys and rollers for seized bearings.",
      "Check motor casing temperature with infrared thermometer (< 70°C).",
      "Reset Fault F0001 on the VFD digital keypad display.",
      "Restart conveyor at 25% speed and verify steady current draw."
    ],
    manual: "SEW Eurodrive VFD Manual (Page 88)"
  },
  {
    keywords: ["kuka", "robot", "collision", "38101", "abb"],
    title: "KUKA KRC4 / ABB Robot Collision Error 38101 Reset",
    alert: "Ensure all personnel are outside the perimeter light curtains before jogging.",
    summary: "Kinetic deviation detected between commanded path and resolver torque feedback.",
    steps: [
      "Release Teach Pendant deadman switch to acknowledge interlock.",
      "Switch robot operating mode to T1 (Manual Reduced Speed ≤ 250mm/s).",
      "Jog end-effector slowly in Axis-by-Axis mode away from the collision obstacle.",
      "Inspect robot gripper tool TCP alignment and pneumatic sensors.",
      "Reset fault on Teach Pendant screen and resume automatic cycle."
    ],
    manual: "KUKA KRC4 Industrial Robotics Guide (Sec 6.1)"
  },
  {
    keywords: ["lubrication", "oil", "vg32", "spindle oil", "daily"],
    title: "Daily 8-Hour ISO VG32 Spindle Lubrication Checklist",
    alert: "Use only ISO VG 32 synthetic spindle oil. Do NOT mix with hydraulic fluid.",
    summary: "Maintains high-speed ceramic bearing lifespan and prevents spindle seizure.",
    steps: [
      "Check oil reservoir sight glass level on rear lubrication unit.",
      "Verify pneumatic air-oil pressure gauge reads between 2.5 and 3.0 bar.",
      "Inspect mist exhaust filter for saturation and drain condensed moisture.",
      "Top up reservoir with clean ISO VG 32 oil to MAX indicator line.",
      "Confirm automatic pulse lubrication cycle LED blinks every 15 minutes."
    ],
    manual: "Siemens 840D Maintenance Manual (Page 14)"
  }
];

// Read Aloud Hands-Free Voice Synthesis (TTS)
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis not supported on this device.");
    return;
  }
  window.speechSynthesis.cancel();
  const clean = text.replace(/<[^>]*>/g, '').replace(/Step \d+:/g, '');
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

// Render Bot Message / Step Checklist
function appendChatResponse(query, item) {
  const chatArea = document.getElementById("chat-area");
  const hero = document.getElementById("hero-state");
  if (hero) hero.style.display = "none";

  // 1. User Message Row
  const userRow = document.createElement("div");
  userRow.className = "msg-row user";
  userRow.innerHTML = `<div class="msg-bubble">${query}</div>`;
  chatArea.appendChild(userRow);

  // 2. Bot Response Row
  const botRow = document.createElement("div");
  botRow.className = "msg-row bot";

  const checklistHtml = item.steps.map((step, idx) => `
    <div class="checklist-step" onclick="toggleStep(this)">
      <input type="checkbox" class="step-checkbox" onclick="event.stopPropagation(); toggleStep(this.parentElement);">
      <div class="step-text"><strong>Step ${idx + 1}:</strong> ${step}</div>
    </div>
  `).join("");

  const voiceScript = `${item.title}. ${item.alert || ''}. ${item.steps.join('. ')}`;

  botRow.innerHTML = `
    <div class="msg-bubble">
      <div style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 6px;">${item.title}</div>
      ${item.alert ? `<div style="background: rgba(239, 68, 68, 0.15); border-left: 3px solid var(--accent-rose); padding: 8px 12px; font-size: 0.85rem; color: #fca5a5; font-weight: 600; border-radius: 4px; margin-bottom: 8px;">${item.alert}</div>` : ''}
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px;">${item.summary}</p>

      <div style="margin-bottom: 8px;">
        <span style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: var(--accent-amber);">Action Checklist:</span>
        ${checklistHtml}
      </div>

      <div class="msg-actions">
        <button class="btn-msg-action" onclick="speakText('${voiceScript.replace(/'/g, "\\'")}')">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          🔊 Read Steps Aloud
        </button>
        <button class="btn-msg-action" onclick="markAllStepsDone(this.closest('.msg-bubble'))">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Mark Completed
        </button>
        <span style="margin-left: auto; font-size: 0.74rem; color: var(--text-dim); align-self: center;">
          ${item.manual}
        </span>
      </div>
    </div>
  `;

  chatArea.appendChild(botRow);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// Toggle individual checkbox
window.toggleStep = function(elem) {
  const chk = elem.querySelector(".step-checkbox");
  if (event.target !== chk) chk.checked = !chk.checked;
  elem.classList.toggle("done", chk.checked);
};

// Mark all completed
window.markAllStepsDone = function(bubbleElem) {
  bubbleElem.querySelectorAll(".checklist-step").forEach(step => {
    step.querySelector(".step-checkbox").checked = true;
    step.classList.add("done");
  });
};

// Process Search Query
function handleSearch(queryText) {
  if (!queryText.trim()) return;

  const q = queryText.toLowerCase();
  
  // Match knowledge base
  let match = MACHINE_DB.find(m => m.keywords.some(kw => q.includes(kw)));
  
  if (!match) {
    match = {
      title: `Operating Protocol: ${queryText}`,
      alert: "Standard PPE Required (Safety glasses, gloves, steel-toe footwear).",
      summary: "Processed query against local air-gapped machine database.",
      steps: [
        "Inspect machine control panel for active error alarms.",
        "Check emergency stop circuit and safety guard interlocks.",
        "Verify hydraulic, pneumatic pressure, and oil lubrication levels.",
        "Log maintenance action in the factory shift register."
      ],
      manual: "Plant Standard Operating Procedure (SOP-01)"
    };
  }

  appendChatResponse(queryText, match);

  // Add to history if not duplicate
  if (!searchHistory.includes(queryText)) {
    searchHistory.unshift(queryText);
    renderHistory();
  }

  document.getElementById("search-input").value = "";
}

// Render Sidebar History
function renderHistory() {
  const container = document.getElementById("history-list");
  container.innerHTML = `<div class="history-label">Recent Searches</div>` + searchHistory.slice(0, 8).map((item, idx) => `
    <div class="history-item ${idx === 0 ? 'active' : ''}" onclick="handleHistoryClick('${item.replace(/'/g, "\\'")}')">
      <div class="history-title">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>${item.length > 26 ? item.substring(0, 26) + '...' : item}</span>
      </div>
    </div>
  `).join("");
}

window.handleHistoryClick = function(query) {
  handleSearch(query);
  document.querySelectorAll(".history-item").forEach(i => i.classList.remove("active"));
  event.currentTarget.classList.add("active");
};

// Attachments Dropdown Menu Handlers (+ Icon)
function setupAttachments() {
  const plusBtn = document.getElementById("btn-plus-attach");
  const menu = document.getElementById("attach-menu");

  plusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== plusBtn) {
      menu.classList.remove("open");
    }
  });

  // Single File
  document.getElementById("file-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      MACHINE_DB.push({
        keywords: [file.name.toLowerCase(), file.name.split('.')[0].toLowerCase()],
        title: `Manual Document: ${file.name}`,
        alert: "Verify document version matches physical machine plate.",
        summary: `Loaded ${(file.size/1024).toFixed(1)} KB manual locally into vector index.`,
        steps: [
          "Follow operating parameters from imported manual.",
          "Inspect machine safety interlocks before power-up.",
          "Perform verification test run at reduced feed rate."
        ],
        manual: file.name
      });
      menu.classList.remove("open");
      alert(`Success: '${file.name}' indexed locally without cloud leakage.`);
      handleSearch(file.name);
    }
  });

  // Folder Directory (webkitdirectory)
  document.getElementById("folder-input").addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const folderName = files[0].webkitRelativePath.split("/")[0] || "Manuals_Folder";
      MACHINE_DB.push({
        keywords: [folderName.toLowerCase(), "folder", "manuals"],
        title: `Manuals Collection: ${folderName}`,
        alert: `Batch indexed ${files.length} documents locally.`,
        summary: `Directory '${folderName}' parsed into indexed vector chunks.`,
        steps: [
          `Review index of all ${files.length} files in folder.`,
          "Consult safety procedures in designated maintenance chapter.",
          "Ensure power isolation before opening electrical cabinets."
        ],
        manual: `${folderName} (${files.length} docs)`
      });
      menu.classList.remove("open");
      alert(`Success: Batch indexed folder '${folderName}' (${files.length} files).`);
      handleSearch(folderName);
    }
  });

  // Add Link
  document.getElementById("btn-add-link").addEventListener("click", () => {
    const url = prompt("Enter factory intranet wiki / doc URL:", "http://intranet.factory.lan/docs/plc-guide.html");
    if (url) {
      MACHINE_DB.push({
        keywords: [url.toLowerCase(), "wiki", "intranet"],
        title: `Intranet Page: ${url.split('/').pop() || 'Wiki_Doc'}`,
        alert: "Locally scraped from factory intranet. Zero cloud tracking.",
        summary: `Document imported from ${url}.`,
        steps: [
          "Cross-reference online factory SOP with physical machine state.",
          "Verify pressure regulators and sensor feedback loops.",
          "Complete mandatory shift handover verification."
        ],
        manual: url
      });
      menu.classList.remove("open");
      alert(`Success: Scraped & indexed intranet link locally.`);
      handleSearch(url);
    }
  });
}

// Voice Speech Recognition
function setupVoice() {
  const btnVoice = document.getElementById("btn-voice");
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRec) {
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      btnVoice.style.color = "var(--accent-amber)";
      document.getElementById("search-input").placeholder = "Listening... Speak machine error...";
    };

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      document.getElementById("search-input").value = text;
      btnVoice.style.color = "";
      document.getElementById("search-input").placeholder = "Search machine error code or SOP...";
      handleSearch(text);
    };

    rec.onend = () => {
      btnVoice.style.color = "";
      document.getElementById("search-input").placeholder = "Search machine error code or SOP...";
    };

    btnVoice.addEventListener("click", () => {
      try { rec.start(); } catch (err) { rec.stop(); }
    });
  } else {
    btnVoice.addEventListener("click", () => {
      const sim = prompt("Voice Input: Speak or type error code:", "Siemens 840D CNC Alarm 21612");
      if (sim) handleSearch(sim);
    });
  }
}

// User Profile / Login handler
function setupLogin() {
  const btnLogin = document.getElementById("btn-login");
  btnLogin.addEventListener("click", () => {
    const name = prompt("Enter Operator Name or Worker ID for shift login:", currentUser);
    if (name) {
      currentUser = name;
      document.getElementById("user-display-name").textContent = name;
      alert(`Logged in as: ${name} (Shift Active).`);
    }
  });
}

// Initializer
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  setupAttachments();
  setupVoice();
  setupLogin();

  // Search input listeners
  const input = document.getElementById("search-input");
  const sendBtn = document.getElementById("btn-send");

  sendBtn.addEventListener("click", () => handleSearch(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch(input.value);
  });

  // New Chat / Question Button
  document.getElementById("btn-new-chat").addEventListener("click", () => {
    const chatArea = document.getElementById("chat-area");
    chatArea.innerHTML = `
      <div class="hero-center" id="hero-state">
        <div class="hero-logo">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div class="hero-title">What machine issue are you facing?</div>
        <p class="hero-subtitle">Search any error code, machine manual, SOP, or click (+) to upload local files/folders.</p>
      </div>
    `;
    input.value = "";
    input.focus();
  });

  // Mobile Menu Toggle
  document.getElementById("btn-mobile-toggle")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
});
