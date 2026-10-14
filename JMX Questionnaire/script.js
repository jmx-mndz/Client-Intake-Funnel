/* =====================================================================
   JMX client intake funnel
   1. Edit CONFIG below (webhook URL is the important one).
   2. Edit STEPS to add, remove or reword questions. No other file needed.
   ===================================================================== */

const CONFIG = {
  // Paste your GoHighLevel inbound webhook URL (or Make / Zapier webhook) here.
  // Leave empty to test: answers will only show on the final screen.
  webhookUrl: "",
  // Optional: send people to a page after they submit (leave "" to stay on the thank-you screen)
  redirectAfterSubmit: "",
  storageKey: "jmx-intake-v1",
};

/* ---------- reusable option lists ---------- */
const YES_NO = ["Yes", "No"];
const YES_NO_NS = ["Yes", "No", "Not sure"];

/* ---------- branching helpers ---------- */
const has = (d, key, val) => (d[key] || []).includes(val);
const needsAny = (d, list) => list.some((v) => has(d, "needs", v));
const isWebsite = (d) => needsAny(d, ["Business website", "Website + funnel", "E-commerce website", "Website redesign"]);
const isFunnel = (d) => needsAny(d, ["Landing page", "Website + funnel", "Booking funnel", "Sales funnel"]);
const isEcom = (d) => has(d, "needs", "E-commerce website");
const isBooking = (d) => has(d, "needs", "Booking funnel") || has(d, "goal", "Book appointments");
const needsLeads = (d) => isFunnel(d) || has(d, "goal", "Generate leads") || has(d, "goal", "Collect applications");

/* ---------- the questions ----------
   field types: text, email, tel, url, date, textarea, select, radio, checkbox
   options: required, half (two per row), hint, placeholder, showIf(data)       */
const STEPS = [
  {
    id: "project", title: "What do you want to build?",
    intro: "Pick everything that applies. The next questions adapt to your answers.",
    fields: [
      { id: "needs", type: "checkbox", label: "What do you need?", required: true,
        options: ["Business website", "Landing page", "Website + funnel", "E-commerce website", "Booking funnel", "Sales funnel", "Website redesign"] },
      { id: "goal", type: "checkbox", label: "What is the main goal?", required: true,
        options: ["Generate leads", "Book appointments", "Sell products", "Sell services", "Build brand credibility", "Collect applications"] },
      { id: "existing", type: "radio", label: "Do you have an existing website?", required: true,
        options: ["Yes, I need a redesign", "Yes, I need a funnel added", "No, starting from scratch"] },
      { id: "existingUrl", type: "url", label: "What is the website address?", placeholder: "https://",
        showIf: (d) => (d.existing || "").startsWith("Yes") },
      { id: "projectDetails", type: "textarea", label: "Anything else we should know about the project?" },
    ],
  },
  {
    id: "business", title: "Tell us about your business",
    intro: "The basics we need to start planning.",
    fields: [
      { id: "businessName", type: "text", label: "Business name", required: true, half: true, autocomplete: "organization" },
      { id: "legalName", type: "text", label: "Legal business name", half: true, hint: "If different from above." },
      { id: "industry", type: "text", label: "Industry", required: true, half: true },
      { id: "years", type: "text", label: "How long have you been operating?", half: true },
      { id: "about", type: "textarea", label: "Describe your business in 2 to 3 sentences", required: true },
      { id: "offerings", type: "textarea", label: "What products or services do you offer?", required: true },
      { id: "audience", type: "textarea", label: "Who are your ideal customers?", required: true },
      { id: "areas", type: "textarea", label: "What locations or service areas do you cover?" },
      { id: "different", type: "textarea", label: "What makes you different from competitors?" },
      { id: "contactName", type: "text", label: "Your name", required: true, half: true, autocomplete: "name" },
      { id: "contactRole", type: "text", label: "Your role", half: true },
      { id: "email", type: "email", label: "Business email", required: true, half: true, autocomplete: "email" },
      { id: "phone", type: "tel", label: "Business phone number", required: true, half: true, autocomplete: "tel" },
      { id: "address", type: "text", label: "Physical business address", hint: "Leave blank if you don't have one.", autocomplete: "street-address" },
      { id: "hours", type: "text", label: "Operating hours", placeholder: "Mon to Fri, 8am to 5pm" },
    ],
  },
  {
    id: "branding", title: "Brand and design",
    intro: "Help us match your look and feel.",
    fields: [
      { id: "hasLogo", type: "radio", label: "Do you have a logo?", options: ["Yes", "No", "In progress"], half: true },
      { id: "hasGuidelines", type: "radio", label: "Do you have brand guidelines?", options: YES_NO, half: true },
      { id: "colors", type: "text", label: "Brand colors and fonts", placeholder: "e.g. navy #0b1d3a, orange accent, Montserrat" },
      { id: "style", type: "checkbox", label: "Which style do you prefer?",
        options: ["Modern", "Premium", "Minimalist", "Corporate", "Bold", "Playful"] },
      { id: "likes", type: "textarea", label: "Websites you like", hint: "Share 2 to 3 links and say what you like about them." },
      { id: "dislikes", type: "textarea", label: "Websites you dislike, and why" },
      { id: "media", type: "checkbox", label: "What do you already have?",
        options: ["Professional photos", "Videos", "Team pictures", "Before and after images", "Nothing yet"] },
      { id: "assetsLink", type: "url", label: "Link to your logo and files", hint: "Google Drive, Dropbox or similar. Make sure it is shared.", placeholder: "https://" },
      { id: "needGraphics", type: "radio", label: "Do you need help creating graphics, icons or other visuals?", options: YES_NO_NS },
      { id: "domain", type: "text", label: "Preferred domain name", placeholder: "yourbusiness.com" },
    ],
  },
  {
    id: "pages", title: "Website pages and content",
    intro: "Choose the pages you need.", showIf: isWebsite,
    fields: [
      { id: "pages", type: "checkbox", label: "Which pages do you need?",
        options: ["Home", "About Us", "Services", "Individual service pages", "Products", "Portfolio / Gallery", "Case studies", "Testimonials / Reviews", "Contact Us", "FAQ", "Book an appointment", "Pricing", "Blog", "Privacy Policy", "Terms & Conditions"] },
      { id: "otherPages", type: "text", label: "Any other pages?" },
      { id: "copy", type: "radio", label: "Who writes the website copy?", options: ["I already have it", "Please write it", "A mix of both"] },
      { id: "headline", type: "text", label: "What should visitors see first?", hint: "Your main headline or message." },
      { id: "servicePages", type: "textarea", label: "Which services or products need their own page?" },
      { id: "testimonials", type: "radio", label: "Do you have customer testimonials or reviews?", options: ["Yes, ready to use", "A few", "No"] },
      { id: "projectPhotos", type: "radio", label: "Do you have project photos, before and after images or case studies?", options: YES_NO },
      { id: "faqs", type: "textarea", label: "What questions do customers ask most often?" },
    ],
  },
  {
    id: "offers", title: "Your offer and messaging",
    intro: "This is what makes the copy convert.",
    fields: [
      { id: "mainService", type: "text", label: "Main service or product", required: true },
      { id: "promote", type: "text", label: "Which one do you most want to promote?" },
      { id: "problem", type: "textarea", label: "What problem does it solve for customers?" },
      { id: "benefits", type: "textarea", label: "What benefits will customers get?" },
      { id: "price", type: "text", label: "Price, starting price or typical range", half: true },
      { id: "offerTypes", type: "checkbox", label: "Do you offer any of these?",
        options: ["Packages", "Discounts", "Financing", "Free estimates", "Free consultation", "Guarantee or warranty", "Special offer"] },
      { id: "guarantee", type: "text", label: "Describe your guarantee, warranty or special offer" },
      { id: "objections", type: "textarea", label: "What stops customers from buying?" },
      { id: "whyUs", type: "textarea", label: "Why should customers choose you?" },
      { id: "cta", type: "radio", label: "What should visitors do?", required: true,
        options: ["Book", "Call", "Buy", "Request a quote", "Apply", "Other"] },
    ],
  },
  {
    id: "funnel", title: "Funnel setup",
    intro: "Every page in a funnel moves the visitor toward one action.", showIf: isFunnel,
    fields: [
      { id: "sources", type: "checkbox", label: "Where will visitors come from?",
        options: ["Facebook Ads", "Google Ads", "Instagram", "Organic search", "Email", "Referrals", "Not sure"] },
      { id: "leadMagnet", type: "text", label: "What is the main offer or lead magnet?" },
      { id: "primaryCta", type: "text", label: "What is the primary call to action?", placeholder: "e.g. Get my free quote" },
      { id: "formType", type: "radio", label: "Which form style do you want?", options: ["Single page form", "Multi-step form", "Not sure"] },
      { id: "bookAfter", type: "radio", label: "Should visitors book a calendar appointment after submitting?", options: YES_NO_NS },
      { id: "thankYou", type: "radio", label: "Do you need a thank-you or confirmation page?", options: YES_NO },
      { id: "redirect", type: "radio", label: "Where should visitors go after submitting?", options: ["Thank-you page", "Calendar", "Checkout", "Another page"] },
      { id: "upsell", type: "checkbox", label: "Do you need any of these?", options: ["Upsell", "Downsell", "Order bump", "None"] },
      { id: "noBook", type: "textarea", label: "What should happen if a lead submits the form but does not book?" },
      { id: "cpl", type: "text", label: "Target cost per lead or conversion", hint: "If known.", half: true },
    ],
  },
  {
    id: "forms", title: "Forms and lead qualification",
    intro: "Collect only what you need.", showIf: needsLeads,
    fields: [
      { id: "collect", type: "checkbox", label: "What should the form collect?",
        options: ["Name", "Email", "Phone", "Address", "Service needed", "Budget", "Timeline", "File or photo upload", "Other"] },
      { id: "qualifiers", type: "textarea", label: "Which extra questions help you decide if a lead is qualified?" },
      { id: "separateForms", type: "radio", label: "Do you need separate forms for different services?", options: YES_NO },
      { id: "recipients", type: "text", label: "Who should receive submissions?", hint: "Names or emails." },
      { id: "createContact", type: "radio", label: "Should each submission create or update a contact in your CRM?", options: YES_NO_NS },
      { id: "assignTo", type: "text", label: "Should leads be assigned to a team member?", hint: "Who?" },
      { id: "opportunity", type: "radio", label: "Should each lead create an opportunity in a sales pipeline?", options: YES_NO_NS },
      { id: "confirmations", type: "checkbox", label: "Which confirmations do you want sent?", options: ["SMS", "Email", "None"] },
      { id: "successMessage", type: "text", label: "What should the success message say?" },
      { id: "smsConsent", type: "radio", label: "Do you need SMS marketing consent and privacy disclosures on the form?", options: YES_NO_NS },
      { id: "formNote", type: "note", text: "Marketing texts need clear consent and disclosures, separate from any transactional messages. We set this up with you." },
    ],
  },
  {
    id: "booking", title: "Booking and calendar",
    intro: "How appointments should work.", showIf: isBooking,
    fields: [
      { id: "apptName", type: "text", label: "Appointment or service name", half: true },
      { id: "duration", type: "text", label: "Appointment length", half: true, placeholder: "e.g. 30 minutes" },
      { id: "availability", type: "text", label: "Days and hours customers can book" },
      { id: "timezone", type: "text", label: "Business time zone", half: true },
      { id: "notice", type: "text", label: "Minimum notice required", half: true },
      { id: "advance", type: "text", label: "How far in advance can customers book?", half: true },
      { id: "buffer", type: "text", label: "Buffer time between appointments", half: true },
      { id: "reschedule", type: "radio", label: "Can customers reschedule or cancel?", options: YES_NO },
      { id: "calendar", type: "radio", label: "Calendar integration", options: ["Google Calendar", "Outlook", "Other", "None"] },
      { id: "reminders", type: "checkbox", label: "What should customers receive?", options: ["Confirmation", "Reminders", "Follow-up messages"] },
      { id: "deposit", type: "radio", label: "Do you require a deposit or payment to book?", options: YES_NO },
      { id: "responsible", type: "text", label: "Who is responsible for the appointment?" },
    ],
  },
  {
    id: "crm", title: "CRM and automation",
    intro: "For GoHighLevel and follow-up systems.", showIf: (d) => isFunnel(d) || isBooking(d),
    fields: [
      { id: "crm", type: "text", label: "Do you already use a CRM? Which one?" },
      { id: "ghl", type: "radio", label: "Do you have a GoHighLevel account or sub-account?", options: YES_NO_NS },
      { id: "pipeline", type: "textarea", label: "What pipeline stages do you use?" },
      { id: "afterLead", type: "textarea", label: "What should happen right after a new lead arrives?" },
      { id: "notify", type: "text", label: "Who receives internal notifications?" },
      { id: "messages", type: "textarea", label: "Which email and SMS messages should be sent, and when?" },
      { id: "followups", type: "text", label: "How many follow-up attempts?", half: true },
      { id: "stopOn", type: "checkbox", label: "Stop follow-ups when the customer:", options: ["Replies", "Books", "Opts out"] },
      { id: "missedCall", type: "radio", label: "Do you need missed-call text-back?", options: YES_NO },
      { id: "chat", type: "checkbox", label: "Do you need any of these?", options: ["Website chat", "AI chat", "Voice AI", "None"] },
      { id: "integrations", type: "checkbox", label: "Integrations", options: ["Make", "Zapier", "Webhooks", "APIs", "Not sure"] },
      { id: "reporting", type: "radio", label: "Do you need reporting or conversion tracking?", options: YES_NO },
    ],
  },
  {
    id: "ecom", title: "Online store",
    intro: "Details about what you sell.", showIf: isEcom,
    fields: [
      { id: "products", type: "textarea", label: "What products will you sell?" },
      { id: "productAssets", type: "radio", label: "Do you have product photos, descriptions, SKUs and prices?", options: ["Yes, all", "Some", "No"] },
      { id: "productCount", type: "text", label: "How many products and variations?", half: true },
      { id: "gateways", type: "checkbox", label: "Payment gateways", options: ["Stripe", "PayPal", "Square", "Shopify Payments", "Other"] },
      { id: "shipping", type: "textarea", label: "Shipping regions, rates and delivery times" },
      { id: "returns", type: "textarea", label: "Return, refund and exchange policies" },
      { id: "inventory", type: "radio", label: "Do you need inventory tracking?", options: YES_NO },
      { id: "storeExtras", type: "checkbox", label: "Do you need any of these?",
        options: ["Discount codes", "Subscriptions", "Bundles", "Abandoned-cart emails", "Abandoned-cart SMS", "Customer accounts", "Order tracking"] },
    ],
  },
  {
    id: "tech", title: "Technical setup",
    intro: "Domain, hosting and tools.",
    fields: [
      { id: "domainOwner", type: "text", label: "Who owns the domain and hosting?" },
      { id: "platform", type: "text", label: "Which platform should the website use?", hint: "Leave blank if you want us to recommend one." },
      { id: "preserve", type: "radio", label: "Is there an existing website that must be preserved?", options: YES_NO },
      { id: "techNeeds", type: "checkbox", label: "Do you need help with:", options: ["Custom domain", "Business email", "DNS setup"] },
      { id: "tracking", type: "checkbox", label: "Tracking", options: ["Google Analytics", "Google Tag Manager", "Meta Pixel"] },
      { id: "embeds", type: "checkbox", label: "Embeds", options: ["Google Maps", "Reviews", "Chat widget", "Calendar embed"] },
      { id: "otherIntegrations", type: "text", label: "Other software to integrate" },
      { id: "migrate", type: "text", label: "Existing forms, customer data or workflows to migrate?" },
      { id: "accessPerson", type: "text", label: "Who will provide account access and approve integrations?", half: true },
      { id: "maintainer", type: "radio", label: "Who maintains the site after launch?", options: ["I will", "JMX", "Not sure"] },
    ],
  },
  {
    id: "seo", title: "SEO and advertising",
    intro: "How people will find you and how we measure results.",
    fields: [
      { id: "keywords", type: "textarea", label: "What do customers search for?" },
      { id: "targetPlaces", type: "text", label: "Cities, regions or countries to target" },
      { id: "gbp", type: "radio", label: "Do you have a Google Business Profile?", options: YES_NO },
      { id: "seoNeeds", type: "checkbox", label: "Do you need:", options: ["Page titles and meta descriptions", "Local SEO", "A blog"] },
      { id: "ads", type: "checkbox", label: "Are you running ads?", options: ["Google Ads", "Meta Ads", "No ads"] },
      { id: "conversions", type: "textarea", label: "Which conversion events should be tracked?" },
      { id: "adBudget", type: "text", label: "Monthly advertising budget", half: true },
      { id: "success", type: "checkbox", label: "What defines success?", options: ["Calls", "Form submissions", "Booked appointments", "Purchases", "Qualified leads"] },
    ],
  },
  {
    id: "legal", title: "Legal and privacy",
    intro: "Policies and compliance.",
    fields: [
      { id: "policies", type: "radio", label: "Do you have a privacy policy and terms of service?", options: ["Both", "One of them", "Neither"] },
      { id: "dataCollected", type: "checkbox", label: "Do you collect:", options: ["Personal data", "Payment information", "Neither"] },
      { id: "marketing", type: "checkbox", label: "Do you send:", options: ["Marketing emails", "Marketing SMS", "Neither"] },
      { id: "cookies", type: "radio", label: "Do you need a cookie notice or consent management?", options: YES_NO_NS },
      { id: "disclaimers", type: "textarea", label: "Industry disclaimers, licenses or advertising restrictions" },
      { id: "legalApprover", type: "text", label: "Who approves the final legal content?", half: true },
      { id: "legalNote", type: "note", text: "Policies should be provided or approved by you. Generic templates may not fit every business or location." },
    ],
  },
  {
    id: "timeline", title: "Timeline and budget",
    intro: "Last section.",
    fields: [
      { id: "launch", type: "date", label: "Target launch date", half: true },
      { id: "deadline", type: "text", label: "Fixed deadline or event?", half: true },
      { id: "budget", type: "text", label: "Project budget", half: true },
      { id: "feedbackSpeed", type: "select", label: "How fast can you give content and feedback?", half: true,
        options: ["Same day", "1 to 2 days", "3 to 5 days", "Within a week", "Slower"] },
      { id: "pointPerson", type: "text", label: "Main point of contact", half: true },
      { id: "approver", type: "text", label: "Who has final approval?", half: true },
      { id: "support", type: "radio", label: "Do you need ongoing maintenance or support?", options: YES_NO_NS },
      { id: "payer", type: "radio", label: "Who pays for hosting, domains and software subscriptions?", options: ["I do", "Include in quote", "Not sure"] },
      { id: "handoff", type: "textarea", label: "What do you expect at handoff?" },
      { id: "finalNotes", type: "textarea", label: "Anything else?" },
    ],
  },
  { id: "review", title: "Review and send", intro: "Check your answers. Select Edit to change anything.", review: true },
];

/* =====================================================================
   Engine (you shouldn't need to edit below this line)
   ===================================================================== */
const $ = (s) => document.querySelector(s);
const stage = $("#stage");
let state = load() || { data: {}, stepId: STEPS[0].id };
let done = false;

function load() {
  try { return JSON.parse(localStorage.getItem(CONFIG.storageKey)); } catch { return null; }
}
function save() {
  try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch {}
}

const visibleSteps = () => STEPS.filter((s) => !s.showIf || s.showIf(state.data));
const currentIndex = () => {
  const i = visibleSteps().findIndex((s) => s.id === state.stepId);
  return i < 0 ? 0 : i;
};
const visibleFields = (step) => (step.fields || []).filter((f) => !f.showIf || f.showIf(state.data));

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (k === "text") n.textContent = v;
    else n.setAttribute(k, v === true ? "" : v);
  }
  kids.flat().forEach((c) => c != null && n.append(c.nodeType ? c : document.createTextNode(c)));
  return n;
}

/* ---------- rendering ---------- */
function render() {
  const steps = visibleSteps();
  const idx = currentIndex();
  const step = steps[idx];
  state.stepId = step.id;
  save();

  // progress + rail
  const pct = Math.round((idx / (steps.length - 1)) * 100);
  $("#barFill").style.width = Math.max(pct, 4) + "%";
  $("#bar").setAttribute("aria-valuenow", pct);
  $("#topCount").textContent = `Step ${idx + 1} of ${steps.length}`;
  const list = $("#stepList");
  list.replaceChildren(...steps.map((s, i) =>
    el("li", {
      class: i < idx ? "done" : i === idx ? "current" : "",
      onclick: i < idx ? () => goTo(s.id) : null,
    }, el("span", { text: s.id === "review" ? "Review and send" : s.title }))
  ));

  // body
  const wrap = el("div", { class: "stage-in" },
    el("h1", { text: step.title, tabindex: "-1", id: "stepTitle" }),
    step.intro ? el("p", { class: "intro", text: step.intro }) : null
  );
  if (step.review) wrap.append(renderReview(steps));
  else {
    const grid = el("div", { class: "grid" });
    visibleFields(step).forEach((f) => grid.append(renderField(f)));
    wrap.append(grid);
  }
  stage.replaceChildren(wrap);

  // nav
  $("#nav").classList.toggle("first", idx === 0);
  $("#nextBtn").textContent = step.review ? "Send my answers" : "Continue";
  window.scrollTo({ top: 0, behavior: "smooth" });
  const t = $("#stepTitle"); if (t) t.focus({ preventScroll: true });
}

function renderField(f) {
  if (f.type === "note") return el("div", { class: "field note", text: f.text });
  const id = "f_" + f.id;
  const wrap = el("div", { class: "field" + (f.half ? " half" : ""), "data-field": f.id });
  const labelContent = [f.label, f.required ? el("span", { class: "req", text: "*", "aria-hidden": "true" }) : null];
  const hint = f.hint ? el("span", { class: "hint", id: id + "_h", text: f.hint }) : null;
  const val = state.data[f.id];

  if (f.type === "radio" || f.type === "checkbox") {
    const fs = el("fieldset", {}, el("legend", {}, ...labelContent), hint);
    const box = el("div", { class: "choices" });
    f.options.forEach((opt) => {
      const checked = f.type === "radio" ? val === opt : (val || []).includes(opt);
      const input = el("input", { type: f.type, name: f.id, value: opt, checked,
        onchange: () => onChoice(f, wrap) });
      input.checked = checked;
      box.append(el("label", { class: "choice" }, input, el("span", { text: opt })));
    });
    fs.append(box);
    wrap.append(fs);
  } else {
    wrap.append(el("label", { class: "label", for: id }, ...labelContent), hint);
    let input;
    if (f.type === "textarea") input = el("textarea", { id, name: f.id });
    else if (f.type === "select") {
      input = el("select", { id, name: f.id }, el("option", { value: "", text: "Choose one" }),
        ...f.options.map((o) => el("option", { value: o, text: o })));
    } else input = el("input", { id, name: f.id, type: f.type, autocomplete: f.autocomplete });
    if (f.placeholder) input.placeholder = f.placeholder;
    if (f.hint) input.setAttribute("aria-describedby", id + "_h");
    input.value = val || "";
    input.addEventListener("input", () => { state.data[f.id] = input.value; save(); wrap.classList.remove("invalid"); });
    wrap.append(input);
  }
  return wrap;
}

function onChoice(f, wrap) {
  const inputs = [...wrap.querySelectorAll("input")];
  state.data[f.id] = f.type === "radio"
    ? (inputs.find((i) => i.checked) || {}).value || ""
    : inputs.filter((i) => i.checked).map((i) => i.value);
  wrap.classList.remove("invalid");
  save();
  // Re-render if this answer changes which questions/steps are shown
  if (["needs", "goal", "existing"].includes(f.id)) {
    const y = window.scrollY;
    const grid = stage.querySelector(".grid");
    const step = visibleSteps()[currentIndex()];
    grid.replaceChildren(...visibleFields(step).map(renderField));
    window.scrollTo(0, y);
    // refresh rail without resetting the page
    const steps = visibleSteps(), idx = currentIndex();
    $("#topCount").textContent = `Step ${idx + 1} of ${steps.length}`;
    $("#stepList").replaceChildren(...steps.map((s, i) =>
      el("li", { class: i < idx ? "done" : i === idx ? "current" : "", onclick: i < idx ? () => goTo(s.id) : null },
        el("span", { text: s.id === "review" ? "Review and send" : s.title }))));
  }
}

/* ---------- validation ---------- */
function validate(step) {
  let firstBad = null;
  visibleFields(step).forEach((f) => {
    if (f.type === "note") return;
    const wrap = stage.querySelector(`[data-field="${f.id}"]`);
    const v = state.data[f.id];
    let msg = "";
    const empty = Array.isArray(v) ? !v.length : !String(v || "").trim();
    if (f.required && empty) msg = f.type === "checkbox" || f.type === "radio" ? "Choose at least one option." : "This field is required.";
    else if (!empty && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Enter a valid email address.";
    else if (!empty && f.type === "url" && !/^https?:\/\/\S+\.\S+/i.test(v)) msg = "Enter a full link starting with https://";
    else if (!empty && f.type === "tel" && String(v).replace(/\D/g, "").length < 7) msg = "Enter a valid phone number.";
    wrap.classList.toggle("invalid", !!msg);
    wrap.querySelector(".error")?.remove();
    if (msg) { wrap.append(el("div", { class: "error", role: "alert", text: msg })); firstBad = firstBad || wrap; }
  });
  if (firstBad) {
    firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
    (firstBad.querySelector("input,select,textarea"))?.focus({ preventScroll: true });
  }
  return !firstBad;
}

/* ---------- navigation ---------- */
function goTo(id) { state.stepId = id; render(); }
function next() {
  const steps = visibleSteps(), idx = currentIndex(), step = steps[idx];
  if (step.review) return submit();
  if (!validate(step)) return;
  goTo(steps[idx + 1].id);
}
function back() {
  const steps = visibleSteps(), idx = currentIndex();
  if (idx > 0) goTo(steps[idx - 1].id);
}

/* ---------- review ---------- */
function answered(step) {
  return visibleFields(step).filter((f) => f.type !== "note").map((f) => {
    const v = state.data[f.id];
    const text = Array.isArray(v) ? v.join(", ") : String(v || "").trim();
    return text ? { label: f.label, text } : null;
  }).filter(Boolean);
}
function renderReview(steps) {
  const frag = el("div");
  steps.filter((s) => !s.review).forEach((s) => {
    const rows = answered(s);
    const dl = el("dl");
    if (!rows.length) dl.append(el("dd", { text: "No answers yet." }));
    rows.forEach((r) => dl.append(el("dt", { text: r.label }), el("dd", { text: r.text })));
    frag.append(el("div", { class: "review-block" },
      el("div", { class: "review-head", }, el("h2", { text: s.title }),
        el("button", { type: "button", class: "link-btn", text: "Edit", onclick: () => goTo(s.id) })),
      dl));
  });
  frag.append(el("label", { class: "consent" },
    el("input", { type: "checkbox", id: "smsOk", checked: !!state.data.smsOk, onchange: (e) => { state.data.smsOk = e.target.checked; save(); } }),
    el("span", { text: "Optional: I agree to receive text messages from JMX about my project at the number I provided. Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Consent is not a condition of working with JMX." })));
  frag.append(el("div", { class: "status", id: "status", role: "status" }));
  return frag;
}

/* ---------- submit ---------- */
function buildBrief() {
  const lines = [`JMX project brief (${new Date().toLocaleString()})`, ""];
  visibleSteps().filter((s) => !s.review).forEach((s) => {
    const rows = answered(s);
    if (!rows.length) return;
    lines.push(s.title.toUpperCase());
    rows.forEach((r) => lines.push(`- ${r.label}: ${r.text}`));
    lines.push("");
  });
  if (state.data.smsOk) lines.push("SMS consent: yes (checked on form)");
  return lines.join("\n");
}
function buildPayload() {
  const labelled = {};
  visibleSteps().filter((s) => !s.review).forEach((s) =>
    answered(s).forEach((r) => (labelled[`${s.title} | ${r.label}`] = r.text)));
  const d = state.data;
  return {
    submittedAt: new Date().toISOString(),
    page: location.href,
    // flat fields: easy to map in GoHighLevel
    name: d.contactName || "", email: d.email || "", phone: d.phone || "",
    company_name: d.businessName || "",
    project_type: (d.needs || []).join(", "),
    sms_consent: !!d.smsOk,
    brief: buildBrief(),
    answers: labelled,
    raw: d,
  };
}

async function submit() {
  const status = $("#status"), btn = $("#nextBtn");
  if ($("#hp").value) return; // honeypot: bot
  const steps = visibleSteps();
  for (const s of steps.filter((x) => !x.review)) {
    const missing = visibleFields(s).find((f) => f.required && (Array.isArray(state.data[f.id]) ? !state.data[f.id].length : !String(state.data[f.id] || "").trim()));
    if (missing) {
      status.className = "status bad";
      status.textContent = `A required question is missing in "${s.title}". Select Edit on that section.`;
      return;
    }
  }
  btn.disabled = true; btn.textContent = "Sending...";
  const payload = buildPayload();
  let sent = !CONFIG.webhookUrl; // no webhook set = demo mode
  if (CONFIG.webhookUrl) {
    try {
      const res = await fetch(CONFIG.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      sent = res.ok;
    } catch {
      // Some webhooks block browser requests (CORS). Retry in "fire and forget" mode.
      try { await fetch(CONFIG.webhookUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(payload) }); sent = true; }
      catch { sent = false; }
    }
  }
  if (!sent) {
    btn.disabled = false; btn.textContent = "Send my answers";
    status.className = "status bad";
    status.textContent = "We couldn't send your answers. Check your connection and try again. Your answers are saved on this device.";
    return;
  }
  finish(payload);
}

function finish(payload) {
  done = true;
  try { localStorage.removeItem(CONFIG.storageKey); } catch {}
  if (CONFIG.redirectAfterSubmit) { location.href = CONFIG.redirectAfterSubmit; return; }
  const first = (payload.name || "").split(" ")[0];
  $("#nav").classList.add("hidden");
  $("#barFill").style.width = "100%";
  $("#stepList").replaceChildren(...visibleSteps().map((s) => el("li", { class: "done" }, el("span", { text: s.id === "review" ? "Review and send" : s.title }))));
  const brief = payload.brief;
  stage.replaceChildren(el("div", { class: "stage-in" },
    el("h1", { text: first ? `Thanks, ${first}. We have your answers.` : "Thanks. We have your answers." }),
    el("p", { class: "intro", text: "We'll review everything and reach out with next steps. Keep a copy of your brief below if you'd like." }),
    !CONFIG.webhookUrl ? el("div", { class: "note", text: "Demo mode: no webhook is set in script.js, so nothing was sent anywhere." }) : null,
    el("div", { class: "done-actions" },
      el("button", { type: "button", class: "btn primary", text: "Copy my brief", onclick: async (e) => {
        try { await navigator.clipboard.writeText(brief); e.target.textContent = "Copied"; } catch { e.target.textContent = "Copy failed"; } } }),
      el("button", { type: "button", class: "btn ghost", text: "Download brief", onclick: () => {
        const a = el("a", { href: URL.createObjectURL(new Blob([brief], { type: "text/plain" })), download: "jmx-project-brief.txt" });
        a.click(); URL.revokeObjectURL(a.href); } }),
      el("a", { class: "btn ghost", href: "https://jmxnext.com", text: "Visit jmxnext.com", style: "text-decoration:none" })
    )));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- boot ---------- */
$("#nextBtn").addEventListener("click", next);
$("#backBtn").addEventListener("click", back);
$("#form").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox" && e.target.type !== "radio") { e.preventDefault(); next(); }
});
render();
