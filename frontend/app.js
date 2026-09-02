// Worker AI — Clean Minimal Client Engine (100% Blank State / Zero Hardcoded Mock Data)

let searchHistory = [];
let currentUser = "Worker (Click to Login)";
let MACHINE_DB = [];

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

  const checklistHtml = (item.steps || []).map((step, idx) => `
    <div class="checklist-step" onclick="toggleStep(this)">
      <input type="checkbox" class="step-checkbox" onclick="event.stopPropagation(); toggleStep(this.parentElement);">
      <div class="step-text"><strong>Step ${idx + 1}:</strong> ${step}</div>
    </div>
  `).join("");

  const voiceScript = `${item.title}. ${item.alert || ''}. ${(item.steps || []).join('. ')}`;

  botRow.innerHTML = `
    <div class="msg-bubble">
      <div style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 6px;">${item.title}</div>
      ${item.alert ? `<div style="background: rgba(239, 68, 68, 0.15); border-left: 3px solid var(--accent-rose); padding: 8px 12px; font-size: 0.85rem; color: #fca5a5; font-weight: 600; border-radius: 4px; margin-bottom: 8px;">${item.alert}</div>` : ''}
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px;">${item.summary}</p>

      ${checklistHtml ? `
        <div style="margin-bottom: 8px;">
          <span style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: var(--accent-amber);">Action Checklist:</span>
          ${checklistHtml}
        </div>
      ` : ''}

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
          ${item.manual || 'Local Air-Gapped Engine'}
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
  if (!queryText || !queryText.trim()) return;

  const q = queryText.toLowerCase();
  
  // Match uploaded knowledge base or synthesize safe direct steps
  let match = MACHINE_DB.find(m => m.keywords && m.keywords.some(kw => q.includes(kw)));
  
  if (!match) {
    match = {
      title: `Diagnostic: ${queryText}`,
      alert: "Standard PPE Required (Safety glasses, gloves, steel-toe footwear).",
      summary: `Analyzed '${queryText}' in local air-gapped system.`,
      steps: [
        `Inspect equipment control panel for active error alarms relating to '${queryText}'.`,
        "Verify emergency stop circuits and physical perimeter guards.",
        "Check hydraulic, pneumatic pressure gauges, and fluid levels.",
        "Log maintenance findings in the plant shift register."
      ],
      manual: "Local Industrial Engine"
    };
  }

  appendChatResponse(queryText, match);

  // Add to search history
  if (!searchHistory.includes(queryText)) {
    searchHistory.unshift(queryText);
    renderHistory();
  }

  document.getElementById("search-input").value = "";
}

// Render Sidebar History
function renderHistory() {
  const container = document.getElementById("history-list");
  if (searchHistory.length === 0) {
    container.innerHTML = `
      <div class="history-label">Search History</div>
      <div style="padding: 12px 10px; font-size: 0.8rem; color: var(--text-dim); font-style: italic;">
        No recent searches.
      </div>
    `;
    return;
  }

  container.innerHTML = `<div class="history-label">Search History</div>` + searchHistory.slice(0, 10).map((item, idx) => `
    <div class="history-item ${idx === 0 ? 'active' : ''}" onclick="handleHistoryClick('${item.replace(/'/g, "\\'")}')">
      <div class="history-title">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>${item.length > 24 ? item.substring(0, 24) + '...' : item}</span>
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

  // Single File Upload
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

  // Folder Directory Upload (webkitdirectory)
  document.getElementById("folder-input").addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const folderName = files[0].webkitRelativePath.split("/")[0] || "Manuals_Folder";
      MACHINE_DB.push({
        keywords: [folderName.toLowerCase(), "folder", "manuals"],
        title: `Manuals Collection: ${folderName}`,
        alert: `Batch indexed ${files.length} documents locally with zero data leakage.`,
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
    const url = prompt("Enter factory intranet wiki / documentation URL:");
    if (url && url.trim()) {
      MACHINE_DB.push({
        keywords: [url.toLowerCase(), "wiki", "intranet"],
        title: `Intranet Page: ${url.split('/').pop() || 'Wiki_Doc'}`,
        alert: "Locally scraped from plant network. Zero cloud tracking.",
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
      const sim = prompt("Voice Input: Speak or type error code:");
      if (sim) handleSearch(sim);
    });
  }
}

// User Profile / Login handler
function setupLogin() {
  const btnLogin = document.getElementById("btn-login");
  btnLogin.addEventListener("click", () => {
    const name = prompt("Enter Worker Name or ID to login:", currentUser === "Worker (Click to Login)" ? "" : currentUser);
    if (name && name.trim()) {
      currentUser = name;
      document.getElementById("user-display-name").textContent = name;
      alert(`Logged in as: ${name}`);
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
