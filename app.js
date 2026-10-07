const formatSEK = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });
const formatNumber = new Intl.NumberFormat("sv-SE");

const controls = {
  leads: document.querySelector("#leads"),
  value: document.querySelector("#value"),
  conversion: document.querySelector("#conversion"),
  missed: document.querySelector("#missed"),
};

function updateCalculator() {
  const leads = Number(controls.leads.value);
  const dealValue = Number(controls.value.value);
  const conversion = Number(controls.conversion.value) / 100;
  const missedShare = Number(controls.missed.value) / 100;
  const risk = leads * dealValue * conversion * missedShare;
  const recoverable = risk * 0.65;
  const manualHours = Math.round((leads * 12) / 60);

  document.querySelector("#leads-output").textContent = formatNumber.format(leads);
  document.querySelector("#value-output").textContent = formatSEK.format(dealValue);
  document.querySelector("#conversion-output").textContent = `${Math.round(conversion * 100)} %`;
  document.querySelector("#missed-output").textContent = `${Math.round(missedShare * 100)} %`;
  document.querySelector("#risk-result").textContent = formatSEK.format(risk);
  document.querySelector("#recover-result").textContent = formatSEK.format(recoverable);
  document.querySelector("#time-result").textContent = `${formatNumber.format(manualHours)} timmar`;
}

Object.values(controls).forEach((control) => control.addEventListener("input", updateCalculator));
updateCalculator();

const pageLoadedAt = Date.now(); // används som enkel botspärr tillsammans med det dolda fältet "hp"
const N8N_WEBHOOK_URL ="https://adrian1337.app.n8n.cloud/webhook/lead-web-form";
const leadForm = document.querySelector("#lead-form");
const formError = document.querySelector("#form-error");
const formSuccess = document.querySelector("#form-success");

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";
  formSuccess.classList.remove("show");
  const required = [...leadForm.querySelectorAll("[required]")];
  required.forEach((field) => field.removeAttribute("aria-invalid"));
  const invalid = required.find((field) => !field.checkValidity());

  if (invalid) {
    invalid.setAttribute("aria-invalid", "true");
    invalid.focus();
    formError.textContent = "Kontrollera att alla obligatoriska uppgifter är korrekt ifyllda.";
    return;
  }

  const payload = Object.fromEntries(new FormData(leadForm).entries());
  payload.source = "reclaim-landingpage";
  payload.submittedAt = new Date().toISOString();
  payload.fillMs = Date.now() - pageLoadedAt;

  try {
    if (N8N_WEBHOOK_URL) {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Webhook request failed");
    }
    formSuccess.classList.add("show");
    formSuccess.focus();
  } catch {
    formError.textContent = "Något gick fel. Försök igen om en stund.";
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();
