/* ---------------- navigation helpers ---------------- */
/* scrollToId lives in main.js (shared across pages) */

/* The four JD-style sections (Management Board, Executive Board, Department
   Teams, Members) — used both to auto-open the right one from an org chart
   click (ensureTierVisible) and to close the other three whenever one opens
   (toggleTier), so only one is ever showing at a time. */
const ALL_TIERS = [
  {containerId:'mb-grid-wrap', btnId:'mb-toggle'},
  {containerId:'eb-departments-wrap', btnId:'eb-toggle'},
  {containerId:'tl-departments-wrap', btnId:'tl-toggle'},
  {containerId:'tracks-stack-wrap', btnId:'mt-toggle'}
];

/* Collapse/expand one of the four tiers above. All four start hidden on page
   load (see class="tier-hidden" on each container in directory.html) —
   nothing is expanded until a visitor taps the matching org chart box or this
   button. Opening one closes whichever of the other three was open, so they
   behave as a single exclusive group rather than four independent switches.

   Each container here is a *-wrap element (see .tier-anim in style.css) that
   wraps the real content (#mb-grid, #eb-departments, etc., unchanged) —
   toggling .tier-hidden on the wrapper animates a CSS grid-rows transition
   between the wrapper's true content height and 0, so Show/Hide slides
   instead of snapping. */
function toggleTier(containerId, btnId){
  const container = document.getElementById(containerId);
  const btn = document.getElementById(btnId);
  const willOpen = !btn.classList.contains('open');

  if(willOpen){
    ALL_TIERS.forEach(t => {
      if(t.containerId === containerId) return;
      const otherBtn = document.getElementById(t.btnId);
      if(otherBtn && otherBtn.classList.contains('open')){
        otherBtn.classList.remove('open');
        document.getElementById(t.containerId).classList.add('tier-hidden');
        otherBtn.setAttribute('aria-expanded', 'false');
        otherBtn.querySelector('.tier-toggle-label').textContent = 'Learn more';
      }
    });
  }

  const isOpen = btn.classList.toggle('open');
  container.classList.toggle('tier-hidden', !isOpen);
  btn.setAttribute('aria-expanded', String(isOpen));
  btn.querySelector('.tier-toggle-label').textContent = isOpen ? 'Hide' : 'Learn more';
}

/* If a chart node's card lives inside a collapsed tier, open that tier first —
   otherwise scrollIntoView below would try to scroll to a hidden element.
   For Department Teams this also selects the specific department tab the
   card lives in (see renderTL/selectTLTab) — the tier itself has to be
   un-hidden AND that one department's tab selected, since a card can be
   hidden by either. */
function ensureTierVisible(el){
  for(const t of ALL_TIERS){
    const container = document.getElementById(t.containerId);
    if(container && container.contains(el) && container.classList.contains('tier-hidden')){
      toggleTier(t.containerId, t.btnId);
    }
  }
  const panel = el.closest('.tl-panel-content');
  if(panel) selectTLTab(panel.dataset.dept);
}

function openAndScroll(slug){
  const card = document.getElementById('card-' + slug);
  if(!card) return;
  ensureTierVisible(card);
  if(!card.classList.contains('open')){
    const toggle = card.querySelector('.card-toggle');
    if(toggle) toggle.click();
  }
  card.scrollIntoView({behavior:'smooth', block:'center'});
  card.classList.add('flash');
  setTimeout(() => card.classList.remove('flash'), 1400);
}

/* ---------------- data: Management Board (Chiefs) ---------------- */
const mbRoles = [
  {
    slug:"cgo", dept:"growth", code:"MB · CGO", date:"Jul 2026", title:"Chief Growth Officer",
    lead:"Drives marketing, brand, and growth metrics so A-HOUSE reaches a wider audience.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Growth",
    responsibilities:[
      {label:"Marketing Strategy", desc:"Guides A-HOUSE's marketing campaigns and social media, keeping materials on-brand with the Head of Growth."},
      {label:"Data & Analytics", desc:"Tracks membership growth and event feedback to sharpen strategy."},
      {label:"Event Promotion", desc:"Promotes every event — from regular workshops to flagship pitch competitions — across departments."}
    ],
    skills:["Campaign creativity","Cross-functional collaboration","Data-driven thinking","Social media proficiency"]
  },
  {
    slug:"ceno", dept:"engagement", code:"MB · CEnO", date:"Jul 2026", title:"Chief Engagement Officer",
    lead:"Builds the relationships — members, alumni, and partners — that make A-HOUSE feel like a community.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Relations",
    responsibilities:[
      {label:"Alumni & Partnerships", desc:"Builds and maintains long-term relationships with alumni, sponsors, and partner organizations, tracking every commitment on both sides."},
      {label:"Flagship Event Programming", desc:"Owns the program and flow for A-HOUSE's flagship events, designing engagement that reflects the org's culture and mission."}
    ],
    skills:["Interpersonal & relationship-building","Creativity","Event planning","Empathy & inclusivity"]
  },
  {
    slug:"cto", dept:"talent", code:"MB · CTO", date:"Jul 2026", title:"Chief Talent Officer",
    lead:"Recruits, trains, and grows A-HOUSE's members from onboarding through leadership.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Talent",
    responsibilities:[
      {label:"Recruitment", desc:"Leads A-HOUSE's recruitment process and onboarding, bringing in members who fit the org's mission and values."},
      {label:"Training & Development", desc:"Organizes workshops, speaker series, and mentorship opportunities that build members' entrepreneurial skills."},
      {label:"Performance & Welfare", desc:"Recognizes strong member contributions and serves as the point of contact for conflict resolution and member wellness."},
      {label:"Team Building", desc:"Runs team-building activities and retreats that keep the org feeling like a community."}
    ],
    skills:["Mentoring","Organization & facilitation","Training program design","Leadership"]
  },
  {
    slug:"coo", dept:"operations", code:"MB · COO", date:"Jul 2026", title:"Chief Operations Officer",
    lead:"Keeps the org's day-to-day machinery running — admin, logistics, resources, and risk.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Operations",
    responsibilities:[
      {label:"Administration", desc:"Builds the workflows and systems A-HOUSE runs on, and keeps organizational records — minutes, permits, masterfiles — in order."},
      {label:"Logistics", desc:"Coordinates venues, equipment, and supplies for every event, working with the Head of Operations to keep materials on schedule."},
      {label:"Resources & Risk", desc:"Optimizes how the org uses its budget and physical resources, and keeps activities compliant with Ateneo policy with contingency plans for what could go wrong."}
    ],
    skills:["Organization & time-management","Attention to detail","Proactive problem-solving","Leadership & collaboration"]
  },
  {
    slug:"cfo", dept:"finance", code:"MB · CFO", date:"Jan 2025", title:"Chief Financial Officer",
    lead:"Manages the org's money — budgeting, fundraising, and keeping the books transparent.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Finance",
    responsibilities:[
      {label:"Budgeting", desc:"Builds and manages A-HOUSE's annual budget, allocating resources across departments and tracking spend against plan."},
      {label:"Fundraising", desc:"Drives fundraising strategy — sponsorships, crowdfunding, partnerships — working with Growth and Engagement to secure support."},
      {label:"Financial Reporting", desc:"Keeps the org's finances transparent, preparing reports for the board and members."}
    ],
    skills:["Financial management & budgeting","Analytical thinking","Creative fundraising","Attention to detail"]
  },
  {
    slug:"cio", dept:"innovations", code:"MB · CIO", date:"Jul 2026", title:"Chief Innovation Officer",
    lead:"Leads new programs and R&D so A-HOUSE stays a hub for fresh entrepreneurial ideas.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Innovation",
    responsibilities:[
      {label:"Innovation Strategy", desc:"Sets A-HOUSE's innovation roadmap, tracking entrepreneurship trends and turning member feedback into actionable insight."},
      {label:"New Projects", desc:"Oversees new initiatives like hackathons and startup incubators, and acts as the board's fact-grounded resource when new ideas are pitched."},
      {label:"Program Implementation", desc:"Designs experiential-learning programs and works with Growth and Engagement to scale the ones that work."}
    ],
    skills:["Openness to new & unfamiliar ideas","Creative & strategic thinking","Startup ecosystem knowledge","Cross-team collaboration & communication"]
  }
];

/* ---------------- data: Executive Board (Heads Only) ---------------- */
const departmentMeta = [
  {key:"growth",      name:"Growth Strategy Department",       chiefTitle:"Chief Growth Officer (CGO)"},
  {key:"engagement",  name:"Engagement & Relations Department", chiefTitle:"Chief Engagement Officer (CEnO)"},
  {key:"talent",      name:"Talent Development Department",     chiefTitle:"Chief Talent Officer (CTO)"},
  {key:"operations",  name:"Operations Department",             chiefTitle:"Chief Operations Officer (COO)"},
  {key:"finance",     name:"Finance Department",                chiefTitle:"Chief Financial Officer (CFO)"},
  {key:"innovations", name:"Innovations Department",            chiefTitle:"Chief Innovation Officer (CIO)"}
];

const ebRoles = [
  {slug:"head-growth", dept:"growth", tier:"head", title:"Head of Growth", date:"Jul 2026",
    lead:"Executes marketing campaigns and supervises the teams behind content, branding, and promotion.",
    reportsTo:"Chief Growth Officer (CGO)", supervises:"Growth Project Teams",
    responsibilities:[
      {label:"Marketing Execution", desc:"Oversees promotional materials and campaigns for every event, keeping content on-brand with the CGO's strategy."},
      {label:"Content Management", desc:"Supervises the teams behind social media, graphics, photography, and publicity, and coordinates their publishing schedule."},
      {label:"Performance Monitoring", desc:"Tracks content performance and engagement to sharpen future campaigns."}
    ],
    skills:["Communication & organizational skills","Creativity & attention to detail","Multi-project management","Collaborative leadership","Digital marketing familiarity"]},

  {slug:"head-relations", dept:"engagement", tier:"head", title:"Head of Relations", date:"Jul 2026",
    lead:"Runs partnership and alumni outreach day to day, and executes engagement activities for events.",
    reportsTo:"Chief Engagement Officer (CEnO)", supervises:"Engagement & Relations Project Teams",
    responsibilities:[
      {label:"Event Management", desc:"Supervises project teams planning and running engagement activities for A-HOUSE events, keeping programs true to the org's culture and mission."},
      {label:"External Relations", desc:"Builds and maintains relationships with partner organizations, sponsors, and industry professionals."},
      {label:"Partnership Coordination", desc:"Oversees the sponsorships and partnerships team, tracking deliverables to make sure commitments are met."}
    ],
    skills:["Communication & interpersonal skills","Professionalism with external stakeholders","Organizational & coordination abilities","Relationship-building mindset","Attention to detail"]},

  {slug:"head-talent", dept:"talent", tier:"head", title:"Head of Talent", date:"Jul 2026",
    lead:"Leads recruitment cycles and onboarding, and runs member development and welfare initiatives.",
    reportsTo:"Chief Talent Officer (CTO)", supervises:"Talent Project Teams",
    responsibilities:[
      {label:"Recruitment", desc:"Leads project teams through each recruitment cycle — interviews, applicant communications, and onboarding logistics."},
      {label:"Member Development", desc:"Organizes workshops, mentorship, and leadership-development initiatives for members."},
      {label:"Member Engagement", desc:"Runs initiatives that build organizational culture and keep members involved."},
      {label:"Member Welfare", desc:"Monitors member concerns and coordinates recognition for outstanding contributions."}
    ],
    skills:["Interpersonal & communication skills","Organizational & facilitation abilities","Empathy & active listening","Leadership & mentoring","Inclusive-environment mindset"]},

  {slug:"head-operations", dept:"operations", tier:"head", title:"Head of Operations", date:"Jul 2026",
    lead:"Supervises logistics and administrative project teams, keeping events and records on schedule.",
    reportsTo:"Chief Operations Officer (COO)", supervises:"Operations Project Teams",
    responsibilities:[
      {label:"Project Team Supervision", desc:"Leads Operations project teams through planning and execution, delegating work and holding it accountable."},
      {label:"Event Logistics", desc:"Coordinates venues, equipment, transportation, and materials, and confirms readiness before and during events."},
      {label:"Administrative Management", desc:"Maintains meeting minutes, permits, and departmental masterfiles."},
      {label:"Operational Coordination", desc:"Works with other departments to anticipate needs, and helps the COO plan for risk."}
    ],
    skills:["Organizational & project management","Multi-deadline management","Attention to detail","Delegation & leadership","Calm under pressure"]},

  {slug:"head-finance", dept:"finance", tier:"head", title:"Head of Finance", date:"Jul 2026",
    lead:"Handles day-to-day budgeting, expense tracking, and reimbursements to keep finances accurate.",
    reportsTo:"Chief Financial Officer (CFO)", supervises:"Finance Project Teams",
    responsibilities:[
      {label:"Financial Operations", desc:"Supervises expense tracking and makes sure reimbursements are processed on time."},
      {label:"Budget Monitoring", desc:"Helps departments track their budgets and flags concerns to the CFO."},
      {label:"Fundraising Support", desc:"Coordinates the operational side of fundraising initiatives and keeps sponsorship records."},
      {label:"Financial Documentation", desc:"Maintains organized financial records and helps prepare reports for leadership."}
    ],
    skills:["Organizational & numerical skills","Attention to detail & accuracy","Integrity & accountability","Confidential information handling","Coordination & communication"]},

  {slug:"head-innovations", dept:"innovations", tier:"head", title:"Head of Innovation", date:"Jul 2026",
    lead:"Executes innovation projects and gathers member feedback to shape A-HOUSE's next programs.",
    reportsTo:"Chief Innovation Officer (CIO)", supervises:"Innovation Project Teams",
    responsibilities:[
      {label:"Project Development", desc:"Supervises project teams running innovation initiatives and helps build new programs for members."},
      {label:"Research & Insights", desc:"Collects member feedback and event evaluations, turning them into recommendations."},
      {label:"Program Implementation", desc:"Supports pilot projects and experimental initiatives, coordinating with other departments."},
      {label:"Innovation Coordination", desc:"Encourages creative problem-solving within project teams and helps the CIO evaluate new opportunities."}
    ],
    skills:["Creativity & curiosity","Organizational & project management","Analytical thinking & problem-solving","Collaboration & communication","Adaptability & openness"]}
];

/* ---------------- data: Department Teams (Tier 03 — one tier below Head) ---------------- */
const leadRoles = [
  {slug:"lead-content-design", dept:"growth", tier:"lead", title:"Lead, Content & Design",
    lead:"Designs the graphics, photos, and promo materials that put A-HOUSE's events in front of people.",
    reportsTo:"Head of Growth", supervises:"Content & Design Team members",
    responsibilities:[
      {label:"Visual Production", desc:"Designs graphics, layouts, and promo materials for every event and membership drive, and captures photo/video documentation for use across channels."},
      {label:"Brand Consistency", desc:"Keeps every asset — posters, social templates, and more — consistent with A-HOUSE's visual identity."},
      {label:"Team Coordination", desc:"Recruits and directs the Content & Design Team each cycle, assigning tasks and reviewing output."}
    ],
    skills:["Graphic design","Photo & video capture","Attention to visual detail","Deadline management","Brand consistency"]},

  {slug:"lead-social-publicity", dept:"growth", tier:"lead", title:"Lead, Social & Publicity",
    lead:"Runs A-HOUSE's social platforms day to day and tracks what's actually landing.",
    reportsTo:"Head of Growth", supervises:"Social & Publicity Team members",
    responsibilities:[
      {label:"Social Media Management", desc:"Plans and publishes content across A-HOUSE's social platforms on a consistent schedule, and responds to comments and messages in the org's voice."},
      {label:"Campaign Execution", desc:"Rolls out promotional campaigns for events and membership drives, coordinating publicity needs with other departments."},
      {label:"Performance Tracking", desc:"Monitors engagement for every post and campaign, and turns what's working into recommendations for the Head of Growth."}
    ],
    skills:["Social platform fluency","Copywriting","Analytics & reporting","Community management","Cross-team coordination"]},

  {slug:"lead-event-engagement", dept:"engagement", tier:"lead", title:"Lead, Event Engagement",
    lead:"Plans and runs the on-the-ground activities that make A-HOUSE events feel like A-HOUSE.",
    reportsTo:"Head of Relations", supervises:"Event Engagement Team members",
    responsibilities:[
      {label:"Program Design", desc:"Plans the run-of-show and engagement segments for A-HOUSE events, keeping programs true to the org's culture."},
      {label:"On-Site Execution", desc:"Leads the Event Engagement Team in running activities during events, keeping things on schedule and participants engaged."},
      {label:"Post-Event Review", desc:"Gathers participant feedback after each event and relays insights to the Head of Relations."}
    ],
    skills:["Event facilitation","Program design","Public speaking","Adaptability","Team leadership"]},

  {slug:"lead-partnerships-sponsorships", dept:"engagement", tier:"lead", title:"Lead, Partnerships & Sponsorships",
    lead:"Keeps sponsor and partner relationships moving and their deliverables on track.",
    reportsTo:"Head of Relations", supervises:"Partnerships & Sponsorships Team members",
    responsibilities:[
      {label:"Outreach & Follow-Up", desc:"Reaches out to prospective sponsors and partners, and keeps in regular touch with existing ones."},
      {label:"Deliverables Tracking", desc:"Logs partnership and sponsorship commitments, and confirms both sides are meeting them on time."},
      {label:"Team Supervision", desc:"Directs the Partnerships & Sponsorships Team on outreach and documentation for each active partnership."}
    ],
    skills:["Relationship management","Professional communication","Organization & follow-through","Negotiation basics","Documentation"]},

  {slug:"lead-recruitment", dept:"talent", tier:"lead", title:"Lead, Recruitment",
    lead:"Runs each recruitment cycle from application through onboarding.",
    reportsTo:"Head of Talent", supervises:"Recruitment Team members",
    responsibilities:[
      {label:"Cycle Management", desc:"Coordinates application periods, interviews, and applicant communications for each recruitment cycle."},
      {label:"Onboarding", desc:"Leads the Recruitment Team in welcoming new members, making sure onboarding logistics are ready on time."},
      {label:"Process Improvement", desc:"Tracks recruitment metrics each cycle and recommends adjustments for the next one."}
    ],
    skills:["Interviewing","Organization & scheduling","Clear communication","Discretion with applicant info","Onboarding design"]},

  {slug:"lead-member-development", dept:"talent", tier:"lead", title:"Lead, Member Development",
    lead:"Builds the workshops and mentorship opportunities that help members grow.",
    reportsTo:"Head of Talent", supervises:"Member Development Team members",
    responsibilities:[
      {label:"Program Planning", desc:"Organizes workshops, speaker sessions, and skill-building activities aligned with what members need to grow."},
      {label:"Mentorship Coordination", desc:"Connects members and alumni for mentorship and coordinates the logistics behind it."},
      {label:"Program Monitoring", desc:"Tracks attendance and feedback for development programs and reports outcomes to the Head of Talent."}
    ],
    skills:["Program planning","Mentorship coordination","Facilitation","Relationship-building","Feedback analysis"]},

  {slug:"lead-engagement-welfare", dept:"talent", tier:"lead", title:"Lead, Engagement & Welfare",
    lead:"Keeps the community feeling like a community — team-building, check-ins, recognition.",
    reportsTo:"Head of Talent", supervises:"Engagement & Welfare Team members",
    responsibilities:[
      {label:"Culture & Team-Building", desc:"Plans activities that build camaraderie and strengthen collaboration among members and officers."},
      {label:"Member Check-Ins", desc:"Serves as a point of contact for member concerns, flagging issues that need the Head of Talent's attention."},
      {label:"Recognition", desc:"Coordinates recognition initiatives that highlight outstanding member contributions each term."}
    ],
    skills:["Empathy & active listening","Activity planning","Conflict de-escalation","Discretion","Team-building"]},

  {slug:"lead-logistics", dept:"operations", tier:"lead", title:"Lead, Logistics",
    lead:"Makes sure every event has what it needs, where it needs to be, on time.",
    reportsTo:"Head of Operations", supervises:"Logistics Team members",
    responsibilities:[
      {label:"Venue & Equipment", desc:"Coordinates venue bookings, equipment, and transportation for events, workshops, and competitions."},
      {label:"Readiness Checks", desc:"Confirms materials and equipment are ready ahead of each event, and troubleshoots issues on-site."},
      {label:"Team Direction", desc:"Assigns logistics tasks to the team for each event and checks completion against the Head of Operations' timeline."}
    ],
    skills:["Logistics planning","Vendor & venue coordination","Problem-solving under pressure","Attention to detail","On-site troubleshooting"]},

  {slug:"lead-admin-records", dept:"operations", tier:"lead", title:"Lead, Administration & Records",
    lead:"Keeps A-HOUSE's minutes, permits, and masterfiles in order.",
    reportsTo:"Head of Operations", supervises:"Administration & Records Team members",
    responsibilities:[
      {label:"Documentation", desc:"Takes and files minutes for meetings, and maintains event permits and departmental masterfiles."},
      {label:"Recordkeeping Systems", desc:"Keeps organizational records updated, accessible, and consistently formatted."},
      {label:"Compliance Support", desc:"Flags documentation gaps against Ateneo policy to the Head of Operations before events proceed."}
    ],
    skills:["Recordkeeping","Attention to detail","Familiarity with Ateneo org policies","Organization","Confidentiality"]},

  {slug:"lead-financial-operations", dept:"finance", tier:"lead", title:"Lead, Financial Operations",
    lead:"Handles day-to-day expenses, reimbursements, and budget tracking.",
    reportsTo:"Head of Finance", supervises:"Financial Operations Team members",
    responsibilities:[
      {label:"Expense Processing", desc:"Records organizational expenses and processes reimbursements in a timely manner."},
      {label:"Budget Monitoring", desc:"Tracks each department's spending against its budget, and flags potential overruns to the Head of Finance."},
      {label:"Financial Recordkeeping", desc:"Maintains accurate financial documentation and supports the preparation of financial reports."}
    ],
    skills:["Bookkeeping basics","Numerical accuracy","Confidentiality","Organization","Spreadsheet proficiency"]},

  {slug:"lead-fundraising", dept:"finance", tier:"lead", title:"Lead, Fundraising",
    lead:"Runs A-HOUSE's fundraising initiatives on the ground, from merch to bazaars.",
    reportsTo:"Head of Finance", supervises:"Fundraising Team members",
    responsibilities:[
      {label:"Initiative Execution", desc:"Plans and runs fundraising activities — merch sales, tambay weeks, bazaars — coordinating logistics as needed."},
      {label:"Sponsorship Records", desc:"Keeps accurate records of fundraising-related sponsorships and contributions."},
      {label:"Results Reporting", desc:"Tracks proceeds from each initiative and reports results to the Head of Finance."}
    ],
    skills:["Initiative planning","Basic sales & pitching","Organization","Recordkeeping","Creative fundraising ideas"]},

  {slug:"lead-external-innovations", dept:"innovations", tier:"lead", title:"Lead, External Innovations",
    lead:"Scouts what's happening in the wider startup space and turns it into new programs for members.",
    reportsTo:"Head of Innovation", supervises:"External Innovations Team members",
    responsibilities:[
      {label:"Program Development", desc:"Develops new programs and experiences for members, drawing on trends from the broader startup ecosystem."},
      {label:"Trend Scanning", desc:"Tracks what's happening in entrepreneurship outside A-HOUSE and brings relevant ideas to the Head of Innovation."},
      {label:"Cross-Team Scaling", desc:"Works with Growth Strategy and Engagement & Relations to scale successful pilot programs into recurring ones."}
    ],
    skills:["Trend research","Program design","Cross-team collaboration","Creative thinking","Presentation skills"]},

  {slug:"lead-internal-innovations", dept:"innovations", tier:"lead", title:"Lead, Internal Innovations",
    lead:"Runs the feedback loop that keeps A-HOUSE's own programs improving.",
    reportsTo:"Head of Innovation", supervises:"Internal Innovations Team members",
    responsibilities:[
      {label:"Feedback Collection", desc:"Coordinates the collection of member feedback and event evaluations across departments."},
      {label:"Insight Reporting", desc:"Turns feedback into clear insights and presents them to the Head of Innovation when new ideas are on the table."},
      {label:"Process Improvement", desc:"Encourages creative problem-solving in project teams and flags organizational improvements members report."}
    ],
    skills:["Feedback & data analysis","Report writing","Active listening","Organizational awareness","Constructive facilitation"]},

  {slug:"lead-incubation-track", dept:"innovations", tier:"lead", title:"Lead, Incubation Track",
    lead:"Runs A-HOUSE's program for turning student ventures into real startups.",
    reportsTo:"Head of Innovation", supervises:"Incubation Track Team members",
    responsibilities:[
      {label:"Program Execution", desc:"Supports pilot projects and workshops that help student ventures move from idea to startup."},
      {label:"Partner Coordination", desc:"Works with the Ateneo Intellectual Property Office (AIPO) and other departments to keep initiatives on schedule."},
      {label:"Founder Support", desc:"Tracks participating ventures' progress and flags the support they need to the Head of Innovation."}
    ],
    skills:["Program management","Startup/venture knowledge","Partner coordination","Mentorship","Follow-through"]}
];

/* ---------------- rendering ---------------- */
/* Every role's responsibilities are {label, desc} pairs — one flat, plain-
   language bullet per pair, no header-plus-sub-bullets nesting. There's no
   separate "Overview" block either: the teaser line above already covers
   that (a full paragraph restating it just added length, not information),
   so the expanded state is only ever these bullets plus skills — a handful
   of scannable lines, not a memo. */
function renderResponsibilities(list){
  return list.map(block => `<li><strong>${block.label}:</strong> ${block.desc}</li>`).join('');
}

function cardTemplate(role, opts){
  const codeClass = opts.codeClass;
  const codeLabel = opts.codeLabel;
  const dateLabel = opts.dateLabel || '';
  const deptLabel = opts.deptLabel || '';
  return `
    <div class="card ${codeClass}" id="card-${role.slug}">
      <div class="card-top">
        <span class="card-code ${codeClass}">${codeLabel}</span>
        ${dateLabel ? `<span class="card-date">${dateLabel}</span>` : ''}
      </div>
      ${deptLabel ? `<div class="card-dept">${deptLabel}</div>` : ''}
      <h3>${role.title}</h3>
      <p class="lead">${role.lead}</p>
      <div class="card-toggle" onclick="toggleCard('${role.slug}')">
        <span class="chev"></span> <span class="toggle-label">View full responsibilities</span>
      </div>
      <div class="card-detail" id="detail-${role.slug}">
        <div class="card-detail-inner">
          <div class="detail-block">
            <h4>Key Responsibilities</h4>
            <ul>${renderResponsibilities(role.responsibilities)}</ul>
          </div>
          <div class="detail-block">
            <h4>Skills &amp; Competencies</h4>
            <div class="skills-tags">${role.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleCard(slug){
  const card = document.getElementById('card-' + slug);
  const detail = document.getElementById('detail-' + slug);
  const label = card.querySelector('.toggle-label');
  const isOpen = card.classList.toggle('open');
  if(isOpen){
    detail.style.maxHeight = detail.scrollHeight + 40 + 'px';
    label.textContent = 'Hide responsibilities';
  } else {
    detail.style.maxHeight = 0;
    label.textContent = 'View full responsibilities';
  }
}

/* Management Board and Executive Board render as a 2-column grid, which
   naturally splits into a left column and a right column — used here to put
   the three "front-end" departments (Growth, Engagement, Talent) on the left
   and the three "back-end" ones (Operations, Finance, Innovations) on the
   right, instead of departmentMeta's default order. Doesn't touch the org
   chart or Team Leads, which keep departmentMeta's own order. */
const boardDisplayOrder = ['growth','operations','engagement','finance','talent','innovations'];
function boardOrderedDepts(){
  return boardDisplayOrder.map(key => departmentMeta.find(d => d.key === key));
}

function renderMB(){
  document.getElementById('mb-grid').innerHTML = boardOrderedDepts().map(dept => {
    const r = mbRoles.find(role => role.dept === dept.key);
    return cardTemplate(r, {codeClass:'chief', codeLabel:r.code});
  }).join('');
}

function renderEB(){
  const container = document.getElementById('eb-departments');
  const cardsHtml = boardOrderedDepts().map(dept => {
    const role = ebRoles.find(r => r.dept === dept.key);
    if(!role) return '';
    return cardTemplate(role, {
      codeClass: role.tier, codeLabel: 'EB · HEAD',
      deptLabel: dept.name
    });
  }).join('');
  container.innerHTML = `<div class="grid">${cardsHtml}</div>`;
}

function renderOrgChart(){
  const container = document.getElementById('org-departments');
  container.innerHTML = departmentMeta.map(dept => {
    const chief = mbRoles.find(r => r.dept === dept.key);
    const head = ebRoles.find(r => r.dept === dept.key && r.tier === 'head');
    const leads = leadRoles.filter(r => r.dept === dept.key);
    return `
      <div class="org-dept">
        <div class="org-dept-name">${dept.name}</div>
        <button class="org-node chief" onclick="openAndScroll('${chief.slug}')">${chief.title}</button>
        <button class="org-node head" onclick="openAndScroll('${head.slug}')">${head.title}</button>
        ${leads.length ? `<div class="org-dept-leads">${leads.map(l => {
          // The chart node names the *team* ("Content & Design Team"), not the Lead role
          // ("Lead, Content & Design") — makes clear each box is a group a Lead runs,
          // not one person. supervises is always "<Team name> Team members".
          const teamName = l.supervises.replace(/ members$/, '');
          return `<button class="org-node lead" onclick="openAndScroll('${l.slug}')">${teamName}</button>`;
        }).join('')}</div>` : ''}
      </div>
    `;
  }).join('');
}

/* Department Teams: a row of 6 department tabs, not a 6-row vertical stack —
   one shared panel below shows whichever department is selected, so opening
   one department's Leads doesn't push five other closed rows down the page
   before you even get there. Starts fully closed (no tab active, panel
   height 0) like every other tier on this page; clicking a tab opens the
   panel to that department, clicking the same tab again closes it, and
   clicking a different tab just swaps the panel's content in place. */
function renderTL(){
  const container = document.getElementById('tl-departments');
  const groups = departmentMeta
    .map(dept => ({dept, leads: leadRoles.filter(r => r.dept === dept.key)}))
    .filter(g => g.leads.length);
  const tabsHtml = groups.map(g => `
    <button class="tl-tab" data-dept="${g.dept.key}" onclick="selectTLTab('${g.dept.key}')">${g.dept.name}</button>
  `).join('');
  const panelsHtml = groups.map(g => {
    const head = ebRoles.find(r => r.dept === g.dept.key && r.tier === 'head');
    const gridClass = g.leads.length >= 4 ? 'grid-4' : g.leads.length === 3 ? 'grid-3' : 'grid';
    return `
      <div class="tl-panel-content" data-dept="${g.dept.key}" hidden>
        <div class="tl-panel-head">
          <h3>${g.dept.name}</h3>
          <span class="tl-dept-reports">Reports to: ${head.title}</span>
        </div>
        <div class="${gridClass}">
          ${g.leads.map(role => cardTemplate(role, {codeClass:'lead', codeLabel:'TEAM LEAD'})).join('')}
        </div>
      </div>
    `;
  }).join('');
  container.innerHTML = `
    <div class="tl-tabs">${tabsHtml}</div>
    <div class="tier-anim tier-hidden" id="tl-panel-wrap">
      <div class="tl-panel" id="tl-panel">${panelsHtml}</div>
    </div>
  `;
}

function selectTLTab(deptKey){
  const wrap = document.getElementById('tl-panel-wrap');
  const tabs = document.querySelectorAll('.tl-tab');
  const alreadyActive = [...tabs].some(t => t.classList.contains('active') && t.dataset.dept === deptKey);

  if(alreadyActive){
    tabs.forEach(t => t.classList.remove('active'));
    wrap.classList.add('tier-hidden');
    return;
  }

  tabs.forEach(t => t.classList.toggle('active', t.dataset.dept === deptKey));
  document.querySelectorAll('.tl-panel-content').forEach(c => {
    c.hidden = c.dataset.dept !== deptKey;
  });
  wrap.classList.remove('tier-hidden');
}

renderMB();
renderEB();
renderTL();
renderOrgChart();
