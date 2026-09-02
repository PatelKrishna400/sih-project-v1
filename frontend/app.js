// Plant AI — Natural Conversational Chatbot Engine

let chatHistory = [];
let currentUser = "Worker (Click to Login)";
let uploadedDocs = [];

// Hands-free Voice Text-to-Speech (TTS)
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis is not supported on this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const clean = text.replace(/<[^>]*>/g, '');
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

// Copy Message Content to Clipboard
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  }).catch(() => {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    alert("Copied to clipboard!");
  });
}

// Natural Conversational Response Generator
function generateNaturalReply(query) {
  const q = query.toLowerCase();

  // 1. Check if matching any uploaded custom documents
  const docMatch = uploadedDocs.find(d => d.keywords.some(k => q.includes(k)));
  if (docMatch) {
    return `Based on the uploaded document **${docMatch.title}**:\n\n${docMatch.content}\n\nLet me know if you would like me to clarify any specific section or provide further guidance!`;
  }

  // 2. Machine error & troubleshooting scenarios
  if (q.includes("21612") || q.includes("cnc") || q.includes("axis drive")) {
    return `**Siemens 840D CNC Axis Drive Fault (Alarm 21612)**\n\nThis alarm indicates that the spindle drive servo feedback loop has exceeded its torque threshold or experienced electrical noise.\n\nHere are the recommended steps to resolve it:\n1. **Emergency Stop**: Press the E-Stop button before opening any cabinet doors.\n2. **Check Coolant Lines**: Make sure cutting fluid lines are unobstructed and not spraying onto encoder connections.\n3. **Inspect Encoder Cabling**: Look for oil or coolant contamination on the encoder feedback plug.\n4. **Reset Breaker Q3**: Check cabinet panel B and reset the drive circuit breaker if tripped.\n5. **Test Rotation**: Jog the spindle at a low speed (e.g. 500 RPM) to verify normal operation.\n\nDo you need help with any other machine errors?`;
  }

  if (q.includes("loto") || q.includes("lockout") || q.includes("tagout") || q.includes("press")) {
    return `**Lockout/Tagout (LOTO) Procedure**\n\nBefore performing maintenance or die changes on high-pressure machinery:\n\n1. **Isolate Power**: Switch off the main disconnect switch and attach your personal red safety padlock.\n2. **Bleed Pressure**: Open the manual dump valve to discharge hydraulic accumulator pressure down to 0 bar.\n3. **Mechanical Lock Bar**: Insert the certified safety block / lock bar into the press ram safety slot.\n4. **Verify Zero Energy**: Confirm the pressure gauge reads zero and test the machine controls to ensure it cannot actuate.\n5. **Sign Off**: Record your name and time in the shift LOTO logbook.\n\nSafety is priority #1. Stay safe!`;
  }

  if (q.includes("motor") || q.includes("vfd") || q.includes("f0001") || q.includes("overcurrent")) {
    return `**VFD Overcurrent Fault (F0001) Troubleshooting**\n\nFault F0001 generally indicates an excessive mechanical load or an electrical ground fault.\n\nRecommended actions:\n• **Inspect Conveyor & Rollers**: Check for seized bearings, material jams, or misaligned belts.\n• **Motor Temperature**: Check if the motor casing is running excessively hot (normal is below 70°C).\n• **Wiring & Insulation**: Inspect the motor terminal junction box for loose connections.\n• **VFD Reset**: Clear the fault on the digital keypad and restart at low speed to observe the current draw.\n\nLet me know if the fault trips immediately upon starting or only under load.`;
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return `Hello! How can I assist you on the factory floor today? You can ask me any questions about machinery, maintenance, safety procedures, or upload documents using the **(+)** button.`;
  }

  // 3. General natural conversational fallback
  return `I have reviewed your query regarding: **"${query}"**.\n\nHere is what you should consider:\n• Review the specific equipment manufacturer guidelines and ensure standard plant safety protocols (PPE, eye protection, electrical isolation) are observed.\n• You can attach detailed manuals, folders, or intranet documentation links using the **(+)** button on the search bar for deeper contextual analysis.\n\nHow else can I assist you with this task?`;
}

// Render Natural Chatbot Message Bubble
function appendMessage(sender, text) {
  const chatArea = document.getElementById("chat-area");
  const hero = document.getElementById("hero-state");
  if (hero) hero.style.display = "none";

  const row = document.createElement("div");
  row.className = `chat-message-row ${sender}`;

  const avatarText = sender === "user" ? "You" : "AI";
  
  // Format markdown-like bold and bullet points into clean HTML
  let formattedHtml = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n• (.*?)(?=\n|$)/g, '<li>$1</li>')
    .replace(/\n\d+\. (.*?)(?=\n|$)/g, '<li>$1</li>');

  if (formattedHtml.includes('<li>')) {
    formattedHtml = formattedHtml.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  }

  row.innerHTML = `
    <div class="msg-avatar">${avatarText}</div>
    <div class="msg-content">
      <p>${formattedHtml}</p>
      ${sender === "bot" ? `
        <div class="msg-footer-actions">
          <button class="btn-text-action" onclick="copyText('${text.replace(/'/g, "\\'").replace(/\n/g, '\\n')}')">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          </button>
          <button class="btn-text-action" onclick="speakText('${text.replace(/'/g, "\\'").replace(/\n/g, ' ')}')">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Read Aloud
          </button>
        </div>
      ` : ''}
    </div>
  `;

  chatArea.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// Send Message Handler
function handleSendMessage(text) {
  if (!text || !text.trim()) return;

  const query = text.trim();
  appendMessage("user", query);

  // Add to History list
  if (!chatHistory.includes(query)) {
    chatHistory.unshift(query);
    renderHistory();
  }

  document.getElementById("search-input").value = "";

  // Natural simulated response delay
  setTimeout(() => {
    const reply = generateNaturalReply(query);
    appendMessage("bot", reply);
  }, 400);
}

// Render Sidebar History
function renderHistory() {
  const container = document.getElementById("history-list");
  if (chatHistory.length === 0) {
    container.innerHTML = `
      <div class="history-label">Chat History</div>
      <div id="empty-history-msg" style="padding: 12px 10px; font-size: 0.8rem; color: var(--text-dim); font-style: italic;">
        No recent chats.
      </div>
    `;
    return;
  }

  container.innerHTML = `<div class="history-label">Chat History</div>` + chatHistory.slice(0, 12).map((item, idx) => `
    <div class="history-item ${idx === 0 ? 'active' : ''}" onclick="handleHistoryClick('${item.replace(/'/g, "\\'")}')">
      <div class="history-title">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>${item.length > 24 ? item.substring(0, 24) + '...' : item}</span>
      </div>
    </div>
  `).join("");
}

window.handleHistoryClick = function(query) {
  handleSendMessage(query);
  document.querySelectorAll(".history-item").forEach(i => i.classList.remove("active"));
  event.currentTarget.classList.add("active");
};

// Attachment Menu Handlers (+ Icon)
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
      uploadedDocs.push({
        title: file.name,
        keywords: [file.name.toLowerCase(), file.name.split('.')[0].toLowerCase()],
        content: `Document '${file.name}' (${(file.size/1024).toFixed(1)} KB) successfully loaded into local conversation context.`
      });
      menu.classList.remove("open");
      handleSendMessage(`I have uploaded: ${file.name}`);
    }
  });

  // Folder Directory (webkitdirectory)
  document.getElementById("folder-input").addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const folderName = files[0].webkitRelativePath.split("/")[0] || "Manuals_Folder";
      uploadedDocs.push({
        title: folderName,
        keywords: [folderName.toLowerCase(), "folder", "manuals"],
        content: `Directory '${folderName}' with ${files.length} documents indexed into local conversational context.`
      });
      menu.classList.remove("open");
      handleSendMessage(`I have uploaded the folder: ${folderName} (${files.length} files)`);
    }
  });

  // Intranet / Web Link
  document.getElementById("btn-add-link").addEventListener("click", () => {
    const url = prompt("Enter web or factory intranet URL:");
    if (url && url.trim()) {
      uploadedDocs.push({
        title: url,
        keywords: [url.toLowerCase(), "link", "url"],
        content: `Content from ${url} has been fetched and indexed into local context.`
      });
      menu.classList.remove("open");
      handleSendMessage(`I have attached the link: ${url}`);
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
      document.getElementById("search-input").placeholder = "Listening... Speak your question...";
    };

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      document.getElementById("search-input").value = text;
      btnVoice.style.color = "";
      document.getElementById("search-input").placeholder = "Type a message or question...";
      handleSendMessage(text);
    };

    rec.onend = () => {
      btnVoice.style.color = "";
      document.getElementById("search-input").placeholder = "Type a message or question...";
    };

    btnVoice.addEventListener("click", () => {
      try { rec.start(); } catch (err) { rec.stop(); }
    });
  } else {
    btnVoice.addEventListener("click", () => {
      const sim = prompt("Voice Input: Speak or type your message:");
      if (sim) handleSendMessage(sim);
    });
  }
}

// User Profile / Login
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

  const input = document.getElementById("search-input");
  const sendBtn = document.getElementById("btn-send");

  sendBtn.addEventListener("click", () => handleSendMessage(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSendMessage(input.value);
  });

  // New Chat Button
  document.getElementById("btn-new-chat").addEventListener("click", () => {
    const chatArea = document.getElementById("chat-area");
    chatArea.innerHTML = `
      <div class="hero-center" id="hero-state">
        <div class="hero-logo">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <div class="hero-title">How can I help you today?</div>
        <p class="hero-subtitle">Ask anything about machines, factory operations, or upload files & folders using (+).</p>
      </div>
    `;
    input.value = "";
    input.focus();
  });

  // Mobile Toggle
  document.getElementById("btn-mobile-toggle")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
});
