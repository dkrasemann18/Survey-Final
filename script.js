let currentStep = 0;
const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const familiaritySelect = document.getElementById("familiarity");
const taskSelect = document.getElementById("task");
const resultsContainer = document.getElementById("results-container");

let prompts = [];

fetch("prompts.json")
  .then((response) => response.json())
  .then((data) => {
    prompts = data;
    const tasks = [...new Set(data.map((item) => item.task))];
    taskSelect.innerHTML =
      '<option value="">Select...</option>' +
      tasks.map((t) => `<option value="${t}">${t}</option>`).join("");
  });

function showStep(n) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === n);
  });
  prevBtn.style.display = n === 0 ? "none" : "inline-block";
  nextBtn.textContent = n === steps.length - 1 ? "Submit" : "Next";
}

nextBtn.addEventListener("click", () => {
  if (currentStep === 0) {
    const fam = familiaritySelect.value;
    const task = taskSelect.value;
    if (!fam || !task) {
      alert("Please select both familiarity and task.");
      return;
    }

    const filtered = prompts.filter(
      (p) => p.ai_familiarity === fam && p.task === task
    );

    const grouped = filtered.reduce((acc, item) => {
      const key = `${item.level}|${item.offering}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(...item.prompts);
      return acc;
    }, {});

    resultsContainer.innerHTML = Object.entries(grouped)
      .map(([key, promptList]) => {
        const [level, offering] = key.split("|");
        const uniquePrompts = [...new Set(promptList)];
        return `
          <h3>${level} – ${offering}</h3>
          <ul>${uniquePrompts.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
        `;
      })
      .join("");
  }

  if (currentStep === 2) {
    // Submit email
    const mailBody = `
AI Familiarity: ${familiaritySelect.value}
Task: ${taskSelect.value}
Favorite Prompts:
${document.getElementById("favoritePrompts").value}
    `.trim();

    const mailLink = document.createElement("a");
    mailLink.href = `mailto:dkrasemann@deloitte.com?subject=Gen AI Prompt Feedback&body=${encodeURIComponent(
      mailBody
    )}`;
    mailLink.click();
  }

  currentStep++;
  if (currentStep < steps.length) {
    showStep(currentStep);
  }
});

prevBtn.addEventListener("click", () => {
  currentStep--;
  if (currentStep >= 0) {
    showStep(currentStep);
  }
});

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

document.getElementById("downloadBtn")?.addEventListener("click", () => {
  const html = resultsContainer.innerHTML;
  const htmlDoc = `<!DOCTYPE html><html><body><ul>${html}</ul></body></html>`;
  const blob = new Blob([htmlDoc], { type: "application/msword" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Recommended_Prompts.doc";
  a.click();
  URL.revokeObjectURL(url);
});

showStep(currentStep);
