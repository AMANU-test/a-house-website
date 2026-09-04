/* ---------------- navigation helpers ---------------- */
/* scrollToId lives in main.js (shared across pages) */

/* The four JD-style sections (Management Board, Executive Board, Department
   Teams, Members) — used both to auto-open the right one from an org chart
   click (ensureTierVisible) and to close the other three whenever one opens
   (toggleTier), so only one is ever showing at a time. */
const ALL_TIERS = [
  {containerId:'mb-grid', btnId:'mb-toggle'},
  {containerId:'eb-departments', btnId:'eb-toggle'},
  {containerId:'tl-departments', btnId:'tl-toggle'},
  {containerId:'tracks-stack', btnId:'mt-toggle'}
];

/* Collapse/expand one of the four tiers above. All four start hidden on page
   load (see class="tier-hidden" on each container in directory.html) —
   nothing is expanded until a visitor taps the matching org chart box or this
   button. Opening one closes whichever of the other three was open, so they
   behave as a single exclusive group rather than four independent switches.

   Uses a class rather than the native `hidden` attribute — #mb-grid already
   carries class="grid" (display:grid), and that author rule overrides the
   browser's own [hidden]{display:none} default, which is why the Management
   Board toggle did nothing. .tier-hidden{display:none!important} always wins. */
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
        otherBtn.querySelector('.tier-toggle-label').textContent = 'Show';
      }
    });
  }

  const isOpen = btn.classList.toggle('open');
  container.classList.toggle('tier-hidden', !isOpen);
  btn.setAttribute('aria-expanded', String(isOpen));
  btn.querySelector('.tier-toggle-label').textContent = isOpen ? 'Hide' : 'Show';
}

/* If a chart node's card lives inside a collapsed tier, open that tier first —
   otherwise scrollIntoView below would try to scroll to a hidden element.
   For Department Teams this also opens the specific department <details> the
   card lives in (see renderTL) — the tier itself has to be un-hidden AND that
   one department panel opened, since a card can be hidden by either.

   Department Teams' panels are native <details> rather than a hand-rolled
   max-height toggle: a role card's own "View full responsibilities" can grow
   *inside* an already-open department panel, and a max-height snapshot taken
   when the panel opened has no way to know that happened, so the newly-taller
   content just gets clipped. <details> has no height to get stale — the
   browser handles arbitrary content size for free. They all share
   name="team-leads-accordion" too, so opening one natively closes whichever
   other department panel was open — no JS needed for that. */
function ensureTierVisible(el){
  for(const t of ALL_TIERS){
    const container = document.getElementById(t.containerId);
    if(container && container.contains(el) && container.classList.contains('tier-hidden')){
      toggleTier(t.containerId, t.btnId);
    }
  }
  const tlGroup = el.closest('.tl-dept-group');
  if(tlGroup) tlGroup.open = true;
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
    overview:"The Chief Growth Officer (CGO) is responsible for driving A-HOUSE's growth through innovative communications and marketing strategies. They ensure the organization's vision is amplified and engages a larger audience.",
    responsibilities:[
      {h:"Marketing Strategy", items:["Guide creative campaigns to promote A-HOUSE's events, programs, and membership opportunities.","Oversee social media platforms, ensuring consistent and impactful content.","Collaborate with the Head of Growth to ensure that marketing materials reflect the organization's brand."]},
      {h:"Data and Analytics", items:["Monitor membership growth and engagement metrics to refine strategies.","Analyze feedback from events and initiatives to improve marketing efforts."]},
      {h:"Event Promotion", items:["Work with other departments to promote regular projects, such as workshops and networking nights, as well as flagship events, like startup pitch competitions."]}
    ],
    skills:["Campaign creativity","Cross-functional collaboration","Data-driven thinking","Social media proficiency"]
  },
  {
    slug:"ceno", dept:"engagement", code:"MB · CEnO", date:"Jul 2026", title:"Chief Engagement Officer",
    lead:"Builds the relationships — members, alumni, and partners — that make A-HOUSE feel like a community.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Relations",
    overview:"The Chief Engagement Officer (CEnO) ensures strong relationships with members, alumni, and external stakeholders. Their primary goal is to create a sense of belonging within A-HOUSE while fostering a positive and engaging experience for everyone involved.",
    responsibilities:[
      {h:"Alumni Relations and External Partnerships", items:["Foster long-term relationships with alumni by maintaining regular communication and encouraging their participation in organizational initiatives, events, and programs.","Identify, establish, and maintain partnerships with external organizations, companies, sponsors, and other key stakeholders aligned with the organization's mission and objectives.","Track and manage sponsor and partner relationships, ensuring proper documentation of communications, commitments, and partnership outcomes."]},
      {h:"Event Management", items:["Primarily oversee the conceptualization and development of programs, flow, and engagement activities for the organization's flagship events.","Design programs that promote member engagement, organizational culture, and community-building while aligning with the organization's goals and identity.","Ensure that all programs are inclusive, well-structured, and reflective of the organization's mission, values, and standards of excellence."]}
    ],
    skills:["Interpersonal & relationship-building","Creativity","Event planning","Empathy & inclusivity"]
  },
  {
    slug:"cto", dept:"talent", code:"MB · CTO", date:"Jul 2026", title:"Chief Talent Officer",
    lead:"Recruits, trains, and grows A-HOUSE's members from onboarding through leadership.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Talent",
    overview:"The Chief Talent Officer (CTO) functions as the Head of Human Resources for A-HOUSE. They oversee the strategic recruitment, onboarding, professional upskilling, and welfare of members. They ensure every individual in the organization has a clear growth path and the tools needed to develop vital leadership capabilities.",
    responsibilities:[
      {h:"Recruitment", items:["Lead the recruitment process to attract new members who align with A-HOUSE's mission and values.","Develop onboarding strategies to seamlessly integrate new members into A-HOUSE's organizational culture."]},
      {h:"Training and Development", items:["Organize workshops, training sessions, and speaker series to help members develop entrepreneurial skills.","Collaborate with alumni and external speakers to provide mentorship and guidance."]},
      {h:"Performance Tracking & Member Welfare", items:["Monitor member contributions and recognize outstanding performances.","Establish systems to recognize and reward outstanding member achievements.","Act as the direct point of contact for conflict resolution and member wellness."]},
      {h:"Team Building", items:["Foster a sense of camaraderie and collaboration among members.","Organize team-building activities and retreats to strengthen the organization's culture."]}
    ],
    skills:["Mentoring","Organization & facilitation","Training program design","Leadership"]
  },
  {
    slug:"coo", dept:"operations", code:"MB · COO", date:"Jul 2026", title:"Chief Operations Officer",
    lead:"Keeps the org's day-to-day machinery running — admin, logistics, resources, and risk.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Operations",
    overview:"The Chief Operations Officer (COO) ensures the seamless execution of A-HOUSE's day-to-day activities. They oversee administration, logistics, and overall organizational efficiency, allowing other departments to focus on their respective roles. The COO is the backbone of the organization, ensuring all processes are smooth and resources are optimized.",
    responsibilities:[
      {h:"Administrative Oversight", items:["Develop and implement efficient workflows and administrative systems to support A-HOUSE's activities.","Oversee the documentation of important organizational records, such as meeting minutes, event permits, and masterfiles."]},
      {h:"Logistics Management", items:["Coordinate logistical support for events, workshops, and competitions, including venue reservations, equipment, and supplies.","Collaborate with the Head of Operations to ensure all materials are prepared and delivered on time."]},
      {h:"Resource Optimization", items:["Ensure the efficient use of financial and physical resources for all organizational activities.","Monitor and maintain inventories of materials, supplies, and other organizational assets."]},
      {h:"Risk Management and Compliance", items:["Ensure that all organizational activities adhere to Ateneo policies and regulations.","Identify potential risks to operations and develop contingency plans."]}
    ],
    skills:["Organization & time-management","Attention to detail","Proactive problem-solving","Leadership & collaboration"]
  },
  {
    slug:"cfo", dept:"finance", code:"MB · CFO", date:"Jan 2025", title:"Chief Financial Officer",
    lead:"Manages the org's money — budgeting, fundraising, and keeping the books transparent.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Finance",
    overview:"The Chief Financial Officer (CFO) is responsible for managing A-HOUSE's finances, ensuring financial sustainability and transparency. They oversee fundraising initiatives, budgeting, and financial reporting to support the organization's goals. The CFO plays a critical role in helping the organization allocate resources wisely while pursuing its mission of fostering entrepreneurship.",
    responsibilities:[
      {h:"Budgeting and Financial Planning", items:["Create and manage the organization's annual budget, ensuring alignment with strategic goals.","Work closely with department leads to allocate resources for their initiatives.","Monitor and track expenses to ensure adherence to the budget."]},
      {h:"Fundraising Initiatives", items:["Develop creative fundraising strategies, such as sponsorships, crowdfunding campaigns, or partnerships.","Collaborate with the Growth Strategy and Engagement teams to secure financial support from external stakeholders."]},
      {h:"Financial Reporting and Transparency", items:["Prepare financial reports and present them to the executive board and members.","Maintain transparency by ensuring that all financial records are accurate and accessible."]}
    ],
    skills:["Financial management & budgeting","Analytical thinking","Creative fundraising","Attention to detail"]
  },
  {
    slug:"cio", dept:"innovations", code:"MB · CIO", date:"Jul 2026", title:"Chief Innovation Officer",
    lead:"Leads new programs and R&D so A-HOUSE stays a hub for fresh entrepreneurial ideas.",
    reportsTo:"Chief Executive Officer", supervises:"Head of Innovation",
    overview:"The Chief Innovation Officer (CIO) leads A-HOUSE's efforts to foster a culture of creativity and experimentation. They oversee the development of innovative programs, projects, and research initiatives that empower members to think outside the box, as well as identify key insights from events to make succeeding reiterations in the future, better. The CIO ensures that A-HOUSE remains a hub for forward-thinking ideas and groundbreaking solutions.",
    responsibilities:[
      {h:"Innovation Strategy", items:["Develop and implement an innovation roadmap for A-HOUSE that aligns with its mission.","Identify emerging trends in entrepreneurship and incorporate them into organizational activities.","Gather information on members regarding project feasibility, and generate insights through feedback for every event."]},
      {h:"Project Consultation", items:["Coordinate and organize events with other management board members, serving as a resource grounded in fact and experience rather than ideation alone.","Provide key insights drawn from member feedback whenever the board is consulted on new ideas and events.","Oversee the ideation and execution of new projects, such as hackathons, startup incubators, and other research initiatives.","Collaborate with other departments to align innovation projects with organizational goals."]},
      {h:"Program Implementation", items:["Design programs that teach entrepreneurial skills through experiential learning.","Collaborate with the Engagement and Growth teams to scale successful projects."]}
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
    overview:"The Head of Growth supports the Chief Growth Officer by leading the execution of A-HOUSE's marketing and communications initiatives. They supervise project teams responsible for content creation, branding, and promotional efforts to ensure consistent and impactful organizational visibility.",
    responsibilities:[
      {label:"Marketing Execution", desc:"Oversee the production of promotional materials for organizational events and initiatives, and ensure that all content aligns with A-HOUSE's branding and communications strategy."},
      {label:"Content Management", desc:"Supervise project teams responsible for social media, graphics, photography, and publicity, and coordinate publication schedules across communication platforms."},
      {label:"Campaign Coordination", desc:"Assist in executing marketing campaigns that promote membership, events, and organizational initiatives, coordinating closely with other departments to gather promotional requirements."},
      {label:"Performance Monitoring", desc:"Monitor content performance and engagement metrics, and provide recommendations for improving future campaigns."}
    ],
    skills:["Communication & organizational skills","Creativity & attention to detail","Multi-project management","Collaborative leadership","Digital marketing familiarity"]},

  {slug:"head-relations", dept:"engagement", tier:"head", title:"Head of Relations", date:"Jul 2026",
    lead:"Runs partnership and alumni outreach day to day, and executes engagement activities for events.",
    reportsTo:"Chief Engagement Officer (CEnO)", supervises:"Engagement & Relations Project Teams",
    overview:"The Head of Relations supports the Chief Engagement Officer by overseeing initiatives related to external partnerships, alumni relations, and stakeholder engagement. They supervise project teams in maintaining meaningful relationships with external partners while ensuring smooth coordination for collaborative initiatives.",
    responsibilities:[
      {label:"Event Management", desc:"Supervise project teams in planning and executing engagement activities for A-HOUSE events, and ensure event programs align with A-HOUSE's culture, mission, and objectives."},
      {label:"External Relations", desc:"Assist in identifying and maintaining relationships with partner organizations, sponsors, and industry professionals, coordinating meetings and communications with external stakeholders."},
      {label:"Partnership Coordination", desc:"Supervise project teams responsible for sponsorships and partnerships, and track partnership deliverables to ensure commitments are fulfilled."}
    ],
    skills:["Communication & interpersonal skills","Professionalism with external stakeholders","Organizational & coordination abilities","Relationship-building mindset","Attention to detail"]},

  {slug:"head-talent", dept:"talent", tier:"head", title:"Head of Talent", date:"Jul 2026",
    lead:"Leads recruitment cycles and onboarding, and runs member development and welfare initiatives.",
    reportsTo:"Chief Talent Officer (CTO)", supervises:"Talent Project Teams",
    overview:"The Head of Talent supports the Chief Talent Officer by overseeing the execution of recruitment, onboarding, member development, and welfare initiatives. They supervise project teams to ensure members have meaningful opportunities for growth while fostering an inclusive and supportive organizational culture.",
    responsibilities:[
      {label:"Recruitment", desc:"Lead project teams during recruitment cycles and applicant processing, coordinating interviews, applicant communications, and onboarding logistics."},
      {label:"Member Development", desc:"Assist in organizing workshops, mentorship opportunities, and leadership development initiatives, and monitor the implementation of member development programs."},
      {label:"Member Engagement", desc:"Support initiatives that strengthen organizational culture and member retention, coordinating activities that promote collaboration and team cohesion."},
      {label:"Member Welfare", desc:"Assist in monitoring member concerns and well-being, and coordinate recognition initiatives for outstanding member contributions."}
    ],
    skills:["Interpersonal & communication skills","Organizational & facilitation abilities","Empathy & active listening","Leadership & mentoring","Inclusive-environment mindset"]},

  {slug:"head-operations", dept:"operations", tier:"head", title:"Head of Operations", date:"Jul 2026",
    lead:"Supervises logistics and administrative project teams, keeping events and records on schedule.",
    reportsTo:"Chief Operations Officer (COO)", supervises:"Operations Project Teams",
    overview:"The Head of Operations supports the Chief Operations Officer in ensuring the smooth execution of A-HOUSE's day-to-day operations. They directly supervise project teams responsible for administrative and logistical tasks, ensuring that organizational activities are executed efficiently, on time, and according to plan.",
    responsibilities:[
      {label:"Project Team Supervision", desc:"Lead and supervise Operations project teams throughout planning and execution, delegating responsibilities while ensuring accountability and timely delivery."},
      {label:"Event Logistics", desc:"Coordinate venue reservations, equipment, transportation, and event materials, and monitor event readiness before and during implementation."},
      {label:"Administrative Management", desc:"Maintain accurate documentation, including meeting minutes, permits, and departmental masterfiles, keeping organizational records updated and accessible."},
      {label:"Operational Coordination", desc:"Coordinate closely with other departments to anticipate operational requirements, and assist the COO in identifying risks and contingency plans."}
    ],
    skills:["Organizational & project management","Multi-deadline management","Attention to detail","Delegation & leadership","Calm under pressure"]},

  {slug:"head-finance", dept:"finance", tier:"head", title:"Head of Finance", date:"Jul 2026",
    lead:"Handles day-to-day budgeting, expense tracking, and reimbursements to keep finances accurate.",
    reportsTo:"Chief Financial Officer (CFO)", supervises:"Finance Project Teams",
    overview:"The Head of Finance supports the Chief Financial Officer by overseeing the execution of the organization's financial operations. They supervise project teams responsible for budgeting, expense tracking, reimbursements, and fundraising logistics while ensuring financial accuracy and accountability.",
    responsibilities:[
      {label:"Financial Operations", desc:"Supervise the recording and monitoring of organizational expenses, and ensure timely processing of reimbursements and financial documentation."},
      {label:"Budget Monitoring", desc:"Assist departments in monitoring their allocated budgets, and identify and communicate potential budget concerns to the CFO."},
      {label:"Fundraising Support", desc:"Coordinate the operational aspects of fundraising initiatives, and assist in maintaining sponsorship and fundraising records."},
      {label:"Financial Documentation", desc:"Maintain organized financial records and supporting documents, and assist in preparing reports for organizational leadership."}
    ],
    skills:["Organizational & numerical skills","Attention to detail & accuracy","Integrity & accountability","Confidential information handling","Coordination & communication"]},

  {slug:"head-innovations", dept:"innovations", tier:"head", title:"Head of Innovation", date:"Jul 2026",
    lead:"Executes innovation projects and gathers member feedback to shape A-HOUSE's next programs.",
    reportsTo:"Chief Innovation Officer (CIO)", supervises:"Innovation Project Teams",
    overview:"The Head of Innovation supports the Chief Innovation Officer by overseeing the execution of innovation-focused projects and initiatives. They supervise project teams responsible for developing new programs, gathering member insights, and implementing creative solutions that strengthen A-HOUSE's entrepreneurial ecosystem.",
    responsibilities:[
      {label:"Project Development", desc:"Supervise project teams in planning and executing innovation initiatives, and assist in developing new programs and entrepreneurial experiences for members."},
      {label:"Research & Insights", desc:"Coordinate the collection of member feedback and event evaluations, organizing insights and recommendations for future organizational improvements."},
      {label:"Program Implementation", desc:"Support the execution of pilot projects, workshops, and experimental initiatives, coordinating closely with other departments during implementation."},
      {label:"Innovation Coordination", desc:"Encourage creative problem-solving within project teams, and assist the CIO in evaluating new opportunities and organizational improvements."}
    ],
    skills:["Creativity & curiosity","Organizational & project management","Analytical thinking & problem-solving","Collaboration & communication","Adaptability & openness"]}
];

/* ---------------- data: Department Teams (Tier 03 — one tier below Head) ---------------- */
const leadRoles = [
  {slug:"lead-content-design", dept:"growth", tier:"lead", title:"Lead, Content & Design",
    lead:"Designs the graphics, photos, and promo materials that put A-HOUSE's events in front of people.",
    reportsTo:"Head of Growth", supervises:"Content & Design Team members",
    overview:"The Lead, Content & Design owns the visual and written materials that put A-HOUSE in front of its audience — from event graphics to photo documentation — working closely with the Head of Growth to keep every asset on-brand.",
    responsibilities:[
      {label:"Visual Production", desc:"Design graphics, layouts, and promotional materials for A-HOUSE's events, programs, and membership drives, and capture photo and video documentation at events for use across channels."},
      {label:"Brand Consistency", desc:"Ensure every piece of content — from posters to social templates — follows A-HOUSE's visual identity and messaging guidelines set by the Head of Growth."},
      {label:"Team Coordination", desc:"Recruit and direct the Content & Design Team for each production cycle, assigning design tasks and reviewing output before it ships."}
    ],
    skills:["Graphic design","Photo & video capture","Attention to visual detail","Deadline management","Brand consistency"]},

  {slug:"lead-social-publicity", dept:"growth", tier:"lead", title:"Lead, Social & Publicity",
    lead:"Runs A-HOUSE's social platforms day to day and tracks what's actually landing.",
    reportsTo:"Head of Growth", supervises:"Social & Publicity Team members",
    overview:"The Lead, Social & Publicity runs A-HOUSE's day-to-day presence on social media and tracks how well campaigns land, feeding what's working back to the Head of Growth.",
    responsibilities:[
      {label:"Social Media Management", desc:"Plan and publish content across A-HOUSE's social platforms on a consistent schedule, and respond to comments and messages in the organization's voice."},
      {label:"Campaign Execution", desc:"Roll out promotional campaigns for events, membership drives, and initiatives, coordinating publicity needs with other departments."},
      {label:"Performance Tracking", desc:"Monitor engagement metrics for every post and campaign, and summarize what's working into recommendations for the Head of Growth."}
    ],
    skills:["Social platform fluency","Copywriting","Analytics & reporting","Community management","Cross-team coordination"]},

  {slug:"lead-event-engagement", dept:"engagement", tier:"lead", title:"Lead, Event Engagement",
    lead:"Plans and runs the on-the-ground activities that make A-HOUSE events feel like A-HOUSE.",
    reportsTo:"Head of Relations", supervises:"Event Engagement Team members",
    overview:"The Lead, Event Engagement designs and runs the on-the-ground programming that makes A-HOUSE events feel like A-HOUSE — icebreakers, activities, and program flow — reporting to the Head of Relations.",
    responsibilities:[
      {label:"Program Design", desc:"Plan the run-of-show, activities, and engagement segments for A-HOUSE events, ensuring each program reflects the organization's culture and goals."},
      {label:"On-Site Execution", desc:"Lead the Event Engagement Team in facilitating activities during events, keeping programs on schedule and participants engaged."},
      {label:"Post-Event Review", desc:"Gather participant feedback after each event and relay insights to the Head of Relations to improve future programming."}
    ],
    skills:["Event facilitation","Program design","Public speaking","Adaptability","Team leadership"]},

  {slug:"lead-partnerships-sponsorships", dept:"engagement", tier:"lead", title:"Lead, Partnerships & Sponsorships",
    lead:"Keeps sponsor and partner relationships moving and their deliverables on track.",
    reportsTo:"Head of Relations", supervises:"Partnerships & Sponsorships Team members",
    overview:"The Lead, Partnerships & Sponsorships manages the day-to-day of A-HOUSE's external relationships — sponsors, partner organizations, and alumni — tracking every commitment made on both sides for the Head of Relations.",
    responsibilities:[
      {label:"Outreach & Follow-Up", desc:"Reach out to prospective sponsors and partner organizations, and maintain regular communication with existing partners and alumni."},
      {label:"Deliverables Tracking", desc:"Log partnership and sponsorship commitments, and confirm both A-HOUSE and its partners are meeting agreed deliverables on time."},
      {label:"Team Supervision", desc:"Direct the Partnerships & Sponsorships Team on outreach assignments and documentation for each active partnership."}
    ],
    skills:["Relationship management","Professional communication","Organization & follow-through","Negotiation basics","Documentation"]},

  {slug:"lead-recruitment", dept:"talent", tier:"lead", title:"Lead, Recruitment",
    lead:"Runs each recruitment cycle from application through onboarding.",
    reportsTo:"Head of Talent", supervises:"Recruitment Team members",
    overview:"The Lead, Recruitment runs A-HOUSE's recruitment cycles start to finish — from application to onboarding — under the Head of Talent.",
    responsibilities:[
      {label:"Cycle Management", desc:"Coordinate application periods, interviews, and applicant communications for each recruitment cycle."},
      {label:"Onboarding", desc:"Lead the Recruitment Team in welcoming and integrating new members, ensuring onboarding materials and logistics are ready on time."},
      {label:"Process Improvement", desc:"Track recruitment metrics each cycle and recommend adjustments to the Head of Talent for the next one."}
    ],
    skills:["Interviewing","Organization & scheduling","Clear communication","Discretion with applicant info","Onboarding design"]},

  {slug:"lead-member-development", dept:"talent", tier:"lead", title:"Lead, Member Development",
    lead:"Builds the workshops and mentorship opportunities that help members grow.",
    reportsTo:"Head of Talent", supervises:"Member Development Team members",
    overview:"The Lead, Member Development builds the workshops, mentorship, and leadership-training opportunities that help A-HOUSE members grow, reporting to the Head of Talent.",
    responsibilities:[
      {label:"Program Planning", desc:"Organize workshops, speaker sessions, and skill-building activities aligned with what members need to grow as founders and leaders."},
      {label:"Mentorship Coordination", desc:"Connect members and alumni for mentorship, and coordinate logistics for mentorship-based initiatives."},
      {label:"Program Monitoring", desc:"Track attendance and feedback for development programs, and report outcomes to the Head of Talent."}
    ],
    skills:["Program planning","Mentorship coordination","Facilitation","Relationship-building","Feedback analysis"]},

  {slug:"lead-engagement-welfare", dept:"talent", tier:"lead", title:"Lead, Engagement & Welfare",
    lead:"Keeps the community feeling like a community — team-building, check-ins, recognition.",
    reportsTo:"Head of Talent", supervises:"Engagement & Welfare Team members",
    overview:"The Lead, Engagement & Welfare keeps A-HOUSE feeling like a community day to day — team-building, member check-ins, and recognition — under the Head of Talent.",
    responsibilities:[
      {label:"Culture & Team-Building", desc:"Plan activities that build camaraderie and strengthen collaboration among members and officers."},
      {label:"Member Check-Ins", desc:"Serve as a point of contact for member concerns and well-being, and flag issues that need the Head of Talent's attention."},
      {label:"Recognition", desc:"Coordinate recognition initiatives that highlight outstanding member contributions each term."}
    ],
    skills:["Empathy & active listening","Activity planning","Conflict de-escalation","Discretion","Team-building"]},

  {slug:"lead-logistics", dept:"operations", tier:"lead", title:"Lead, Logistics",
    lead:"Makes sure every event has what it needs, where it needs to be, on time.",
    reportsTo:"Head of Operations", supervises:"Logistics Team members",
    overview:"The Lead, Logistics makes sure every A-HOUSE event has what it needs, where it needs to be, on time — venues, equipment, and materials — reporting to the Head of Operations.",
    responsibilities:[
      {label:"Venue & Equipment", desc:"Coordinate venue bookings, equipment reservations, and transportation for events, workshops, and competitions."},
      {label:"Readiness Checks", desc:"Confirm all materials and equipment are prepared and delivered ahead of each event, and troubleshoot issues on-site."},
      {label:"Team Direction", desc:"Assign logistics tasks to the Logistics Team for each event and confirm completion against the Head of Operations' timeline."}
    ],
    skills:["Logistics planning","Vendor & venue coordination","Problem-solving under pressure","Attention to detail","On-site troubleshooting"]},

  {slug:"lead-admin-records", dept:"operations", tier:"lead", title:"Lead, Administration & Records",
    lead:"Keeps A-HOUSE's minutes, permits, and masterfiles in order.",
    reportsTo:"Head of Operations", supervises:"Administration & Records Team members",
    overview:"The Lead, Administration & Records keeps A-HOUSE's paperwork in order — minutes, permits, and masterfiles — so the org stays compliant and organized, under the Head of Operations.",
    responsibilities:[
      {label:"Documentation", desc:"Take and file minutes for organizational meetings, and maintain event permits and departmental masterfiles."},
      {label:"Recordkeeping Systems", desc:"Keep organizational records updated, accessible, and consistently formatted across departments."},
      {label:"Compliance Support", desc:"Flag any documentation gaps against Ateneo policy requirements to the Head of Operations before events proceed."}
    ],
    skills:["Recordkeeping","Attention to detail","Familiarity with Ateneo org policies","Organization","Confidentiality"]},

  {slug:"lead-financial-operations", dept:"finance", tier:"lead", title:"Lead, Financial Operations",
    lead:"Handles day-to-day expenses, reimbursements, and budget tracking.",
    reportsTo:"Head of Finance", supervises:"Financial Operations Team members",
    overview:"The Lead, Financial Operations handles A-HOUSE's day-to-day money movement — expenses, reimbursements, and budget tracking — reporting to the Head of Finance.",
    responsibilities:[
      {label:"Expense Processing", desc:"Record organizational expenses and process member and department reimbursements in a timely manner."},
      {label:"Budget Monitoring", desc:"Track each department's spending against its allocated budget, and flag potential overruns to the Head of Finance."},
      {label:"Financial Recordkeeping", desc:"Maintain organized, accurate financial documentation and support the preparation of financial reports."}
    ],
    skills:["Bookkeeping basics","Numerical accuracy","Confidentiality","Organization","Spreadsheet proficiency"]},

  {slug:"lead-fundraising", dept:"finance", tier:"lead", title:"Lead, Fundraising",
    lead:"Runs A-HOUSE's fundraising initiatives on the ground, from merch to bazaars.",
    reportsTo:"Head of Finance", supervises:"Fundraising Team members",
    overview:"The Lead, Fundraising runs A-HOUSE's fundraising initiatives on the ground — merch drops, bazaars, and sponsorship-linked campaigns — reporting to the Head of Finance.",
    responsibilities:[
      {label:"Initiative Execution", desc:"Plan and run fundraising activities such as merch sales, tambay weeks, and bazaars, coordinating logistics with other departments as needed."},
      {label:"Sponsorship Records", desc:"Maintain accurate records of fundraising-related sponsorships and contributions alongside the Head of Finance."},
      {label:"Results Reporting", desc:"Track proceeds from each fundraising initiative and report results to the Head of Finance for financial reporting."}
    ],
    skills:["Initiative planning","Basic sales & pitching","Organization","Recordkeeping","Creative fundraising ideas"]},

  {slug:"lead-external-innovations", dept:"innovations", tier:"lead", title:"Lead, External Innovations",
    lead:"Scouts what's happening in the wider startup space and turns it into new programs for members.",
    reportsTo:"Head of Innovation", supervises:"External Innovations Team members",
    overview:"The Lead, External Innovations scouts what's happening in the wider entrepreneurship space and turns it into new programs and experiences for A-HOUSE members, reporting to the Head of Innovation.",
    responsibilities:[
      {label:"Program Development", desc:"Develop new programs and entrepreneurial experiences for members, drawing on emerging trends in the broader startup ecosystem."},
      {label:"Trend Scanning", desc:"Track developments in the entrepreneurship space outside A-HOUSE, and bring relevant ideas back to the Head of Innovation for potential adoption."},
      {label:"Cross-Team Scaling", desc:"Collaborate with the Growth Strategy and Engagement & Relations departments to scale successful pilot programs into recurring initiatives."}
    ],
    skills:["Trend research","Program design","Cross-team collaboration","Creative thinking","Presentation skills"]},

  {slug:"lead-internal-innovations", dept:"innovations", tier:"lead", title:"Lead, Internal Innovations",
    lead:"Runs the feedback loop that keeps A-HOUSE's own programs improving.",
    reportsTo:"Head of Innovation", supervises:"Internal Innovations Team members",
    overview:"The Lead, Internal Innovations runs the feedback loop that keeps A-HOUSE's own programs improving — gathering member input after every event and turning it into recommendations for the Head of Innovation.",
    responsibilities:[
      {label:"Feedback Collection", desc:"Coordinate the collection of member feedback and event evaluations across A-HOUSE's departments and programs."},
      {label:"Insight Reporting", desc:"Organize feedback into clear insights and recommendations, and present them to the Head of Innovation when the board is consulted on new ideas."},
      {label:"Process Improvement", desc:"Encourage creative problem-solving within project teams and help identify organizational improvements based on what members report."}
    ],
    skills:["Feedback & data analysis","Report writing","Active listening","Organizational awareness","Constructive facilitation"]},

  {slug:"lead-incubation-track", dept:"innovations", tier:"lead", title:"Lead, Incubation Track",
    lead:"Runs A-HOUSE's program for turning student ventures into real startups.",
    reportsTo:"Head of Innovation", supervises:"Incubation Track Team members",
    overview:"The Lead, Incubation Track runs A-HOUSE's longer-term program for turning student ventures into real startups, including its collaboration with the Ateneo Intellectual Property Office (AIPO).",
    responsibilities:[
      {label:"Program Execution", desc:"Support the execution of pilot projects, workshops, and experimental initiatives that help student ventures move from idea to startup."},
      {label:"Partner Coordination", desc:"Coordinate with the Ateneo Intellectual Property Office (AIPO) and other departments to keep the Incubation Track's initiatives on schedule."},
      {label:"Founder Support", desc:"Track participating ventures' progress through the program and flag the support they need to the Head of Innovation."}
    ],
    skills:["Program management","Startup/venture knowledge","Partner coordination","Mentorship","Follow-through"]}
];

/* ---------------- rendering ---------------- */
function renderResponsibilities(list){
  return list.map(block => {
    if(block.items){
      return `<li><strong>${block.h}</strong><ul>${block.items.map(it => `<li>${it}</li>`).join('')}</ul></li>`;
    }
    return `<li><strong>${block.label}:</strong> ${block.desc}</li>`;
  }).join('');
}

function cardTemplate(role, opts){
  const codeClass = opts.codeClass;
  const codeLabel = opts.codeLabel;
  const dateLabel = opts.dateLabel || '';
  const deptLabel = opts.deptLabel || '';
  return `
    <div class="card" id="card-${role.slug}">
      <div class="card-top">
        <span class="card-code ${codeClass}">${codeLabel}</span>
        ${dateLabel ? `<span class="card-date">${dateLabel}</span>` : ''}
      </div>
      ${deptLabel ? `<div class="card-dept">${deptLabel}</div>` : ''}
      <h3>${role.title}</h3>
      <p class="lead">${role.lead || (role.overview.length > 130 ? role.overview.slice(0,130) + '…' : role.overview)}</p>
      <div class="card-toggle" onclick="toggleCard('${role.slug}')">
        <span class="chev"></span> <span class="toggle-label">View full responsibilities</span>
      </div>
      <div class="card-detail" id="detail-${role.slug}">
        <div class="card-detail-inner">
          <div class="detail-block">
            <h4>Overview</h4>
            <p style="font-size:14px; color:var(--ink);">${role.overview}</p>
          </div>
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

function renderTL(){
  const container = document.getElementById('tl-departments');
  const groups = departmentMeta
    .map(dept => ({dept, leads: leadRoles.filter(r => r.dept === dept.key)}))
    .filter(g => g.leads.length);
  container.innerHTML = groups.map(g => {
    const head = ebRoles.find(r => r.dept === g.dept.key && r.tier === 'head');
    const gridClass = g.leads.length >= 4 ? 'grid-4' : g.leads.length === 3 ? 'grid-3' : 'grid';
    return `
      <details class="tl-dept-group" data-dept="${g.dept.key}" name="team-leads-accordion">
        <summary class="tl-dept-toggle">
          <span class="tl-dept-toggle-text">
            <h3>${g.dept.name}</h3>
            <span class="tl-dept-reports">Reports to: ${head.title}</span>
          </span>
          <span class="chev"></span>
        </summary>
        <div class="tl-dept-body-inner">
          <div class="${gridClass}">
            ${g.leads.map(role => cardTemplate(role, {codeClass:'lead', codeLabel:'TEAM LEAD'})).join('')}
          </div>
        </div>
      </details>
    `;
  }).join('');
}

renderMB();
renderEB();
renderTL();
renderOrgChart();
