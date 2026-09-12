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

/* Shared by toggleTier (the "Learn more" button) and openAndScroll (org
   chart clicks) — lands a target's top just below the sticky nav (84px,
   matching .section's own scroll-margin-top) instead of scrollIntoView's
   default, which has no such offset and would tuck the target behind the
   header.

   The tier's own open transition (.tier-anim, .45s) is usually still
   animating the very first time this runs — a fresh element inside a
   collapsing/expanding accordion doesn't have its final position yet, so
   that first call is only ever a rough pass. Pass `wrap` (the .tier-anim
   element actually being opened, if this call is the one opening it) and
   the correction fires off that transition's real `transitionend` instead
   of a guessed delay: computing the rough pass's target against a
   not-yet-laid-out accordion can come out at/near 0, and a second
   `scrollTo` fired at a guessed delay races the browser's own smooth-
   scroll timing for the (possibly still in-flight) first call — on a slow
   layout or long scroll distance the guess can lose that race and the
   correction never visibly lands. transitionend has no such guess. Falls
   back to a delay only when there's no wrap to listen on (openAndScroll,
   when the tier was already open and nothing is transitioning).

   skipImmediate drops that first rough-pass call entirely. It matters when
   a DIFFERENT tier is closing in the same click (toggleTier switching from
   one open section to another): at the instant this runs, that other
   tier's collapse hasn't been painted yet, so it still measures at its old
   full height and pushes this target artificially far down the page — the
   rough pass would smooth-scroll toward that too-low spot, then the
   transitionend correction yanks it back up, reading as an overshoot-then-
   snap-back. Skipping straight to the transitionend/fallback-triggered
   scroll means only the correct, final position is ever animated to. */
function scrollIntoFocus(target, wrap, skipImmediate){
  if(!target) return;
  const scroll = () => {
    const rect = target.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - 84;
    window.scrollTo({top: Math.max(targetY, 0), behavior: 'smooth'});
  };
  if(!skipImmediate) scroll();
  if(wrap){
    let fallback;
    const onEnd = (e) => {
      if(e.target !== wrap || e.propertyName !== 'grid-template-rows') return;
      wrap.removeEventListener('transitionend', onEnd);
      clearTimeout(fallback);
      scroll();
    };
    wrap.addEventListener('transitionend', onEnd);
    // Covers prefers-reduced-motion (no transition ever fires) and any
    // other case transitionend doesn't — same 480ms guess as before, but
    // now only a backstop, not the primary mechanism.
    fallback = setTimeout(() => { wrap.removeEventListener('transitionend', onEnd); scroll(); }, 480);
  } else {
    setTimeout(scroll, 480);
  }
}

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
  let closedAnother = false;

  if(willOpen){
    ALL_TIERS.forEach(t => {
      if(t.containerId === containerId) return;
      const otherBtn = document.getElementById(t.btnId);
      if(otherBtn && otherBtn.classList.contains('open')){
        closedAnother = true;
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

  if(isOpen){
    // Same "bring the console into view" behavior as clicking an org chart
    // node (openAndScroll) — falls back to the container itself for
    // Members, the one tier with no .crt-console. skipImmediate
    // (closedAnother) when switching straight from one open tier to
    // another — see scrollIntoFocus's own comment for why.
    scrollIntoFocus(container.querySelector('.crt-console') || container, container, closedAnother);
  } else {
    // Closing from the console's own bottom Hide button (.crt-hide-btn)
    // leaves the viewport wherever it happened to be scrolled to inside a
    // console that's now gone — everything below where you were scrolled
    // shifts up to fill that space, landing you on whatever used to be
    // further down the page. Scrolling back to the section you just closed
    // returns you there instead — the section itself (not the button),
    // so the divider above it lands cleanly under the sticky nav with the
    // section's own top padding as breathing room, rather than the "Learn
    // more" button sitting cramped right against the nav with nothing
    // above it in view.
    scrollIntoFocus(btn.closest('.section') || btn, container);
  }

  // Tells callers (ensureTierVisible/openAndScroll) whether this call just
  // switched away from a different open tier — see scrollIntoFocus's
  // comment on skipImmediate for why that matters to them too.
  return closedAnother;
}

/* If a chart node's card lives inside a collapsed tier, open that tier first —
   otherwise scrollIntoView below would try to scroll to a hidden element.
   For all three department-selector tiers (Management Board, Executive
   Board, Department Teams) this also selects the specific department tile
   the card lives in (see renderDeptSelector/selectDeptTab) — the tier itself
   has to be un-hidden AND that one department's tile selected, since a card
   can be hidden by either. */
function ensureTierVisible(el){
  let switchedTiers = false;
  for(const t of ALL_TIERS){
    const container = document.getElementById(t.containerId);
    if(container && container.contains(el) && container.classList.contains('tier-hidden')){
      switchedTiers = toggleTier(t.containerId, t.btnId) || switchedTiers;
    }
  }
  const panel = el.closest('.dept-panel-content');
  if(panel) selectDeptTab(panel.dataset.tier, panel.dataset.id);
  return switchedTiers;
}

function openAndScroll(slug){
  const el = document.getElementById('role-' + slug);
  if(!el) return;
  // If this closed a different open tier to reveal `el`'s own, skip this
  // function's own immediate scroll below too — same overshoot risk as
  // toggleTier's, since that other tier's collapse still hasn't painted.
  const skipImmediate = ensureTierVisible(el);

  // Not el.scrollIntoView() — el sits inside a horizontally snap-scrolling
  // .dept-screen-track, and the outer tier is still mid-transition (the
  // grid-rows 0fr->1fr animation from ensureTierVisible's toggleTier just
  // started) when this runs. scrollIntoView's automatic inline adjustment
  // reads that not-yet-settled layout and can nudge the track off page 0,
  // which the scroll-snap then "corrects" onto the wrong page once layout
  // catches up. scrollIntoFocus's plain vertical window scroll never
  // touches the track, so it can't trigger that at all.
  //
  // Lands on the console's own top edge (not el itself) — centering the
  // small role-block in the viewport put a variable, unpredictable amount
  // of the section's "Tier 0N — Live / <Board name> / description" header
  // above it, sometimes pushing the roster tray below the fold instead.
  // ensureTierVisible already reset the screen to the Overview page, where
  // this role's block always sits right after the console's own title, so
  // landing on the console's top keeps it in view too.
  scrollIntoFocus(el.closest('.crt-console') || el, undefined, skipImmediate);

  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 1400);
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

/* One color + two-letter tag per department, reused across all three "choose
   your department" selectors below (Management Board, Executive Board,
   Department Teams) — the same "character" identity follows a department
   from tier to tier instead of each row inventing its own scheme. */
const deptStyle = {
  growth:      {color:"#D6473C", tag:"GS"},
  engagement:  {color:"#3E8FE0", tag:"ER"},
  talent:      {color:"#E8B33B", tag:"TD"},
  operations:  {color:"#4FAE7A", tag:"OP"},
  finance:     {color:"#9B6BD9", tag:"FN"},
  innovations: {color:"#DB7A2C", tag:"IN"}
};

/* Real headshots (chroma-keyed from actual green-screen photos, see
   assets/roster/ — not generated or drawn) used only for the Management
   Board roster tiles below — these are the six department Chiefs, not the
   Heads. Every other tier keeps the plain letter-tag avatar. */
const deptPhoto = {
  growth:      "assets/roster/chief-growth.png",
  engagement:  "assets/roster/chief-engagement.png",
  talent:      "assets/roster/chief-talent.png",
  operations:  "assets/roster/chief-operations.png",
  finance:     "assets/roster/chief-finance.png",
  innovations: "assets/roster/chief-innovations.png"
};

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

/* Builds the three swipeable "screen" pages (Overview, Key Responsibilities,
   Skills & Competencies) for one department's stage — see renderDeptSelector
   below. `roles` is normally a single-role array (one Chief, one Head), but
   Department Teams can have several Leads per department, so every page
   handles an array: with one role each page is just that role's content;
   with several, each role gets its own labeled block stacked in the page
   instead of a separate screen per person — swiping stays "one category at a
   time", not "one person at a time". */
function buildDeptScreenPages(roles, opts){
  const multi = roles.length > 1;
  const overview = roles.map(r => `
    <div class="dept-role-block" id="role-${r.slug}">
      <span class="card-code ${opts.codeClass}">${opts.codeLabelFor(r)}</span>
      <h4>${r.title}</h4>
      <p>${r.lead}</p>
    </div>
  `).join('');
  const responsibilities = roles.map(r => `
    <div class="dept-role-block">
      ${multi ? `<h4>${r.title}</h4>` : ''}
      <ul>${renderResponsibilities(r.responsibilities)}</ul>
    </div>
  `).join('');
  const skills = roles.map(r => `
    <div class="dept-role-block">
      ${multi ? `<h4>${r.title}</h4>` : ''}
      <div class="skills-tags">${r.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
    </div>
  `).join('');
  return [overview, responsibilities, skills];
}

/* Management Board and Executive Board render as a 2-column grid, which
   naturally splits into a left column and a right column — used here to put
   the three "front-end" departments (Growth, Engagement, Talent) on the left
   and the three "back-end" ones (Operations, Finance, Innovations) on the
   right, instead of departmentMeta's default order. Doesn't touch the org
   chart or Team Leads, which keep departmentMeta's own order. */
const boardDisplayOrder = ['growth','engagement','talent','operations','finance','innovations'];
function boardOrderedDepts(){
  return boardDisplayOrder.map(key => departmentMeta.find(d => d.key === key));
}

/* Management Board and Executive Board both get the "CRT terminal" console
   shell wrapped around the exact same renderDeptSelector/selectDeptTab
   machinery everything else on this page uses — only the chrome around it
   (bezel, screen glass, scanlines, watermark) and its CSS skin differ; no
   tab-selection logic is duplicated, so both stay exactly as reliable as
   Department Teams. Real headshots (deptPhoto — the six Chiefs) replace the
   plain letter tag on each tile, and a large duotone cutout of whichever
   department is currently selected "enters" from the right edge of the
   console, character-select-screen style (see crtEnterCharacter).

   Executive Board reuses those same Chief cutouts — Heads don't have their
   own photoshoot — but passes `locked: true`, which blacks every photo out
   via CSS (.crt-console--locked, in style.css) for an "not unlocked yet"
   silhouette instead of showing the Chief's actual face. */
function renderCrtBoard(tier, gridId, {consoleLabel, rosterLabel, locked, groups}){
  document.getElementById(gridId).innerHTML = `
    <div class="crt-console${locked ? ' crt-console--locked' : ''}">
      <div class="crt-console-topbar">
        <span class="crt-led"></span>
        <span class="crt-console-label">${consoleLabel}</span>
        <div class="crt-vents"><span></span><span></span><span></span><span></span><span></span></div>
      </div>
      <div class="crt-screen">
        <div class="crt-watermark" aria-hidden="true">${'A-HOUSE&nbsp; '.repeat(14)}</div>
        <div class="crt-scanlines" aria-hidden="true"></div>
        <img class="crt-enter-photo" id="${tier}-enter-photo" src="" alt="" aria-hidden="true">
        <div class="crt-content" id="${tier}-departments-inner"></div>
        <!-- Same toggleTier() the section's own "Learn more"/Hide button
             calls (keeps both buttons, and the label on the one up top,
             in sync) — reachable from the bottom of a long console without
             scrolling all the way back up past the roster to close it.
             Reuses .tier-toggle's exact look; already in its "open" state
             since this only ever renders while the console is showing. -->
        <button type="button" class="tier-toggle open crt-hide-btn" onclick="toggleTier('${gridId}-wrap','${tier}-toggle')">
          <span class="chev"></span><span class="tier-toggle-label">Hide</span>
        </button>
      </div>
    </div>
  `;

  renderDeptSelector(tier, `${tier}-departments-inner`, groups);

  const label = document.createElement('div');
  label.className = 'crt-roster-label';
  label.textContent = rosterLabel;
  document.getElementById(`${tier}-departments-inner`).querySelector('.dept-select').before(label);
}

function renderMB(){
  const groups = boardOrderedDepts().map(dept => {
    const r = mbRoles.find(role => role.dept === dept.key);
    const stageHeadHtml = `
      <div class="dept-stage-head">
        <h3>${dept.name}</h3>
        <span class="dept-reports">Reports to: Chief Executive Officer</span>
      </div>
    `;
    const pages = buildDeptScreenPages([r], {codeClass:'chief', codeLabelFor: role => role.code});
    return {dept, tileSubtitle: r.code.replace('MB · ', ''), stageHeadHtml, pages, photoUrl: deptPhoto[dept.key]};
  });
  renderCrtBoard('mb', 'mb-grid', {
    consoleLabel: 'A-HOUSE // MANAGEMENT BOARD TERMINAL',
    rosterLabel: 'Select department — Management Board roster',
    groups
  });
}

/* Executive Board — same console as Management Board, but locked: true so
   every photo renders as a black silhouette (see renderCrtBoard above). */
function renderEB(){
  const groups = boardOrderedDepts().map(dept => {
    const role = ebRoles.find(r => r.dept === dept.key);
    const stageHeadHtml = `
      <div class="dept-stage-head">
        <h3>${dept.name}</h3>
        <span class="dept-reports">Reports to: ${dept.chiefTitle}</span>
      </div>
    `;
    const pages = buildDeptScreenPages([role], {codeClass:'head', codeLabelFor: () => 'EB · HEAD'});
    return {dept, tileSubtitle: 'HEAD', stageHeadHtml, pages, photoUrl: deptPhoto[dept.key]};
  });
  renderCrtBoard('eb', 'eb-departments', {
    consoleLabel: 'A-HOUSE // EXECUTIVE BOARD TERMINAL',
    rosterLabel: 'Select department — Executive Board roster',
    locked: true,
    groups
  });
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

/* ---------------- shared "choose your department" selector ---------------- */
/* Used by all three org tiers (Management Board, Executive Board, Department
   Teams) so picking a department works the same way everywhere: one shared
   "screen" on top — a horizontally swipeable set of three pages (Overview,
   Key Responsibilities, Skills & Competencies) — with a row of colored
   department tiles below it, like a character-select screen where the
   6 buttons choose what plays on the one screen above them. Each tier's
   selection (and each screen's scroll position) is independent: picking
   Growth Strategy under Executive Board doesn't touch Management Board's.

   `groups` is [{dept, tileSubtitle, stageHeadHtml, pages}] — stageHeadHtml is
   the department name + "Reports to" line, and pages is the [overview,
   responsibilities, skills] html triple from buildDeptScreenPages, both
   built by the caller. Starts fully closed (no tile active, screen height 0)
   like every other tier on this page; clicking a tile opens the screen to
   that department (always starting on the Overview page), clicking the same
   tile again closes it, and clicking a different tile swaps the screen's
   content in place. */
const SCREEN_PAGE_LABELS = ['Overview', 'Key Responsibilities', 'Skills & Competencies'];

function renderDeptSelector(tier, containerId, groups){
  const container = document.getElementById(containerId);
  const tilesHtml = groups.map(g => {
    // `id` is what makes a tile/panel unique — usually just the department
    // key (one tile per department, as on Management/Executive Board), but
    // Department Teams puts several teams under one department, so it passes
    // each team's own slug as `id` instead. `dept` stays the *department*
    // throughout (color, photo, tag) regardless of how many tiles share it.
    const id = g.id || g.dept.key;
    const style = deptStyle[g.dept.key];
    const avatarHtml = g.photoUrl
      ? `<span class="dept-avatar dept-avatar-photo"><img src="${g.photoUrl}" alt="${g.dept.name} head"><span class="dept-avatar-tag">${style.tag}</span></span>`
      : `<span class="dept-avatar">${style.tag}</span>`;
    return `
      <button class="dept-tile" data-tier="${tier}" data-id="${id}" data-dept="${g.dept.key}" style="--dept-color:${style.color};" onclick="selectDeptTab('${tier}','${id}')">
        ${avatarHtml}
        <span>
          <span class="dept-tile-name">${g.tileName || g.dept.name}</span>
          <span class="dept-tile-tag">${g.tileSubtitle}</span>
        </span>
      </button>
    `;
  }).join('');
  const panelsHtml = groups.map(g => {
    const id = g.id || g.dept.key;
    return `
    <div class="dept-panel-content" data-tier="${tier}" data-id="${id}" data-dept="${g.dept.key}" data-photo="${g.photoUrl || ''}" hidden>
      ${g.stageHeadHtml}
      <div class="dept-screen">
        <div class="dept-screen-track">
          ${g.pages.map(p => `<div class="dept-screen-page">${p}</div>`).join('')}
        </div>
        <div class="dept-screen-nav">
          ${SCREEN_PAGE_LABELS.map((label, i) => `<button class="dept-screen-dot${i === 0 ? ' active' : ''}" data-page="${i}">${label}</button>`).join('')}
        </div>
      </div>
    </div>
  `;
  }).join('');
  container.innerHTML = `
    <div class="tier-anim tier-hidden" id="${tier}-stage-wrap">
      <div class="dept-stage" id="${tier}-stage">${panelsHtml}</div>
    </div>
    <div class="dept-select">${tilesHtml}</div>
  `;

  container.querySelectorAll('.dept-panel-content').forEach(panel => {
    const track = panel.querySelector('.dept-screen-track');
    const dots = panel.querySelectorAll('.dept-screen-dot');
    dots.forEach(dot => dot.addEventListener('click', () => {
      track.scrollTo({left: track.clientWidth * Number(dot.dataset.page), behavior: 'smooth'});
    }));
    let ticking = false;
    track.addEventListener('scroll', () => {
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const idx = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        syncMobilePageHeight(track);
        ticking = false;
      });
    });
  });

  lockScreenHeight(container);
}

/* The screen's height would otherwise follow whichever page is showing — a
   short "Overview" then a long "Key Responsibilities" list makes the whole
   console visibly grow and shrink as you swipe between them. Fixed per
   department (each swapped into flow just long enough to read its own 3
   pages' true heights, synchronously, so nothing is ever actually painted
   mid-swap) rather than one height shared across every department in the
   tier — .dept-screen-track is a flex row, so its 3 pages already stretch
   to match whichever of the three is tallest for THAT department; sharing
   one number across all 6 departments as well meant one department's long
   "Key Responsibilities" was inflating every other department's short
   "Skills" page too, most of it empty space. align-self:flex-start,
   applied only for the instant of measuring, opts a page out of that
   stretch so it reports its own real content height instead of a
   sibling's.

   That measurement is only ever as good as the width (and fonts) it was
   taken at, though — text wraps differently at other widths, and Press
   Start 2P's blocky glyphs wrap very differently from whatever fallback
   font was showing before it finished loading. So a lock computed once at
   page load goes stale the moment the viewport resizes, or the moment a
   web font swaps in after first paint: either a dead gap under short
   content (locked height too tall for current conditions) or
   clipped/overflowing content (too short). heightLockedContainers + the
   resize listener below re-measure every console when that happens, and
   selectDeptTab() re-measures again right before showing anything, so the
   lock always matches whatever width/fonts are actually in effect now.

   On top of the per-department measurement, every console in the same
   container is then capped to the SHORTEST department's own height (e.g.
   Management Board's Growth, whose 3-bullet "Key Responsibilities" is the
   tier's shortest) instead of each keeping its own, taller number — a
   department like Talent (4 bullets) would otherwise render as a visibly
   bigger console just because its role happens to have one more
   responsibility. Whatever page pushes a department over that cap (almost
   always Key Responsibilities) scrolls internally instead — see
   .crt-content .dept-screen-page's overflow-y in style.css — so the extra
   content is still reachable, it just doesn't grow the console. */
const heightLockedContainers = [];
function lockScreenHeight(container){
  if(!heightLockedContainers.includes(container)) heightLockedContainers.push(container);
  const panels = container.querySelectorAll('.dept-panel-content');
  const measurements = [];
  panels.forEach(panel => {
    const wasHidden = panel.hidden;
    panel.hidden = false;
    let maxH = 0;
    panel.querySelectorAll('.dept-screen-page').forEach(page => {
      page.style.alignSelf = 'flex-start';
      if(page.offsetHeight > maxH) maxH = page.offsetHeight;
      page.style.alignSelf = '';
    });
    panel.hidden = wasHidden;
    if(maxH > 0) measurements.push({panel, maxH});
  });
  if(!measurements.length) return;
  const capH = Math.min(...measurements.map(m => m.maxH));
  measurements.forEach(({panel}) => {
    panel.querySelector('.dept-screen-track').style.setProperty('--screen-min-h', capH + 'px');
  });
}

/* Below this width, even a per-department lock (above) still means every
   page shares that department's tallest one — usually "Key
   Responsibilities", since its bullets wrap to far more lines on a narrow
   phone than they do on desktop. That's the console being padded out well
   past the short "Overview" page shown by default, eating into a phone's
   limited height for no benefit a mobile visitor can even see (there's no
   swipe-jump to avoid feeling if they haven't swiped anywhere yet). Below
   this width the currently-visible page's own height wins instead —
   swiping to a longer page can resize the console there, a trade a phone
   visitor trying to actually reach the roster tray comes out ahead on. */
const MOBILE_SCREEN_BREAKPOINT = 760;
function syncMobilePageHeight(track){
  if(window.innerWidth > MOBILE_SCREEN_BREAKPOINT) return;
  const idx = Math.round(track.scrollLeft / track.clientWidth);
  const page = track.querySelectorAll('.dept-screen-page')[idx];
  if(!page) return;
  page.style.alignSelf = 'flex-start';
  const h = page.offsetHeight;
  page.style.alignSelf = '';
  if(h > 0) track.style.setProperty('--screen-min-h', h + 'px');
}

// lockScreenHeight sets every panel back to its department-wide lock, so
// any panel currently on screen (not [hidden]) needs syncMobilePageHeight
// re-applied right after on mobile, same as selectDeptTab does — otherwise
// resizing into/within mobile width with a department already open leaves
// the wider department-lock in effect until the next tile click.
function relockAndResync(container){
  lockScreenHeight(container);
  container.querySelectorAll('.dept-panel-content:not([hidden])').forEach(panel => {
    syncMobilePageHeight(panel.querySelector('.dept-screen-track'));
  });
}

let screenHeightResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(screenHeightResizeTimer);
  screenHeightResizeTimer = setTimeout(() => {
    heightLockedContainers.forEach(relockAndResync);
  }, 250);
});
// Google Fonts load with display:swap — the fallback font's metrics can
// wrap text differently than Press Start 2P/Rajdhani once they arrive,
// so re-lock again after they're actually in, not just on first paint.
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(() => heightLockedContainers.forEach(relockAndResync));
}

function selectDeptTab(tier, id){
  const wrap = document.getElementById(tier + '-stage-wrap');
  const stage = document.getElementById(tier + '-stage');
  const tiles = document.querySelectorAll(`.dept-tile[data-tier="${tier}"]`);
  const alreadyActive = [...tiles].some(t => t.classList.contains('active') && t.dataset.id === id);

  if(alreadyActive){
    tiles.forEach(t => t.classList.remove('active'));
    wrap.classList.add('tier-hidden');
    crtExitCharacter(tier);
    return;
  }

  tiles.forEach(t => t.classList.toggle('active', t.dataset.id === id));
  document.querySelectorAll(`.dept-panel-content[data-tier="${tier}"]`).forEach(c => {
    c.hidden = c.dataset.id !== id;
  });
  // Re-measure right before showing anything, not just once at page load —
  // the initial lock can go stale from a resize (see the listener below) but
  // also, less obviously, from a web font finishing its swap-in after first
  // paint: Press Start 2P's blocky glyphs wrap text very differently than
  // whatever fallback font was showing a moment earlier, and that's a much
  // bigger height swing than a resize. Recomputing on every selection means
  // it's always measuring the fonts/width actually in effect right now.
  lockScreenHeight(document.getElementById(tier + '-departments-inner'));
  // The tile carries its own department key separately from `id` (see
  // renderDeptSelector) — that's what colors the console and picks which
  // photo enters, even when several tiles (Department Teams) share one.
  const deptKey = [...tiles].find(t => t.dataset.id === id).dataset.dept;
  stage.style.setProperty('--dept-color', deptStyle[deptKey].color);
  wrap.classList.remove('tier-hidden');
  crtEnterCharacter(tier, deptKey);

  // Always reopen on the Overview page, not wherever it was last scrolled to.
  const activePanel = stage.querySelector(`.dept-panel-content[data-id="${id}"]`);
  const track = activePanel.querySelector('.dept-screen-track');
  track.scrollTo({left: 0, behavior: 'instant'});
  activePanel.querySelectorAll('.dept-screen-dot').forEach((d, i) => d.classList.toggle('active', i === 0));
  // On mobile this overrides the per-department lockScreenHeight() just set
  // above with just the Overview page's own (usually much shorter) height.
  syncMobilePageHeight(track);
}

/* The large duotone cutout that "enters" from the right edge of the CRT
   console when a department is selected (character-select-screen flourish,
   see the Street Fighter reference) — a no-op wherever a tier doesn't render
   a `${tier}-enter-photo` element (there isn't one outside a CRT console). */
function crtEnterCharacter(tier, deptKey){
  const img = document.getElementById(tier + '-enter-photo');
  const photo = deptPhoto[deptKey];
  if(!img || !photo) return;
  img.src = photo;
  img.alt = deptStyle[deptKey].tag + ' entering';
  img.classList.remove('entering');
  void img.offsetWidth; // restart the entrance animation even if it's already showing someone else
  img.classList.add('active', 'entering');
}

function crtExitCharacter(tier){
  const img = document.getElementById(tier + '-enter-photo');
  if(img) img.classList.remove('active', 'entering');
}

/* Department Teams gets the same CRT console as Executive Board (locked
   silhouettes — Leads don't have their own photoshoot either) but one tile
   per *team*, not per department: 14 Leads across 6 departments, so a
   department with 3 teams (e.g. Talent) shows 3 separate boxes instead of
   stacking all 3 leads onto one shared panel. That's what `id` on each group
   is for (see renderDeptSelector/selectDeptTab) — several tiles can now
   share the same `dept` (for color/photo/code) while staying independently
   selectable via each Lead's own slug. The wider roster tray this needs is
   handled entirely in CSS (#tl-departments-inner .dept-select). */
function renderTL(){
  const groups = leadRoles.map(lead => {
    const dept = departmentMeta.find(d => d.key === lead.dept);
    const teamName = lead.supervises.replace(/ members$/, '');
    const stageHeadHtml = `
      <div class="dept-stage-head">
        <h3>${teamName}</h3>
        <span class="dept-reports">Reports to: ${lead.reportsTo}</span>
      </div>
    `;
    const pages = buildDeptScreenPages([lead], {codeClass:'lead', codeLabelFor: () => 'TEAM LEAD'});
    return {
      id: lead.slug, dept, tileName: teamName, tileSubtitle: deptStyle[dept.key].tag,
      stageHeadHtml, pages, photoUrl: deptPhoto[dept.key]
    };
  });
  renderCrtBoard('tl', 'tl-departments', {
    consoleLabel: 'A-HOUSE // TEAM-TERMINAL',
    rosterLabel: 'Select team — Department Teams roster',
    locked: true,
    groups
  });
}

renderMB();
renderEB();
renderTL();
renderOrgChart();
