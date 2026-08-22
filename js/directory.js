/* ---------------- navigation helpers ---------------- */
/* scrollToId lives in main.js (shared across pages) */
function openAndScroll(slug){
  const card = document.getElementById('card-' + slug);
  if(!card) return;
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
      <div class="card-meta">Reports to: ${role.reportsTo}<br>Supervises: ${role.supervises}</div>
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

function renderMB(){
  document.getElementById('mb-grid').innerHTML = mbRoles.map(r => cardTemplate(r, {
    codeClass:'chief', codeLabel:r.code
  })).join('');
}

function renderEB(){
  const container = document.getElementById('eb-departments');
  const cardsHtml = departmentMeta.map(dept => {
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
    return `
      <div class="org-dept">
        <div class="org-dept-name">${dept.name}</div>
        <button class="org-node chief" onclick="openAndScroll('${chief.slug}')">${chief.title}</button>
        <button class="org-node head" onclick="openAndScroll('${head.slug}')">${head.title}</button>
      </div>
    `;
  }).join('');
}

renderMB();
renderEB();
renderOrgChart();
