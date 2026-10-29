/**
 * CareerConnect – 50 Job Listings Seeder
 * Adds 50 unique job listings across 35+ companies and 16 Indian locations
 * without deleting existing users or applications.
 *
 * NOTE: These are SAMPLE demonstration listings for educational and testing purposes.
 *
 * Run: node backend/seedJobs.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');

const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

const EMPLOYER_LIST = [
  { email: 'talent@amazon.in', name: 'Amazon India Talent', companyName: 'Amazon', industry: 'E-Commerce & Cloud', location: 'Hyderabad, Telangana', website: 'https://www.amazon.jobs', description: 'Amazon is guided by four principles: customer obsession, passion for invention, commitment to operational excellence, and long-term thinking.' },
  { email: 'careers@apple.in', name: 'Apple India Careers', companyName: 'Apple', industry: 'Consumer Electronics & Software', location: 'Bengaluru, Karnataka', website: 'https://jobs.apple.com', description: 'Apple creates technology that empowers people around the world with innovative products like iPhone, Mac, and iOS.' },
  { email: 'talent@meta.com', name: 'Meta Platforms India', companyName: 'Meta', industry: 'Social Media & AR/VR', location: 'Bengaluru, Karnataka', website: 'https://www.metacareers.com', description: 'Meta builds technologies that help people connect, find communities, and grow businesses across Facebook, Instagram, and WhatsApp.' },
  { email: 'hire@ibm.in', name: 'IBM India Hiring', companyName: 'IBM', industry: 'IT & Cloud Services', location: 'Bengaluru, Karnataka', website: 'https://www.ibm.com/careers', description: 'IBM is a global technology and consulting company helping clients solve business challenges through hybrid cloud and AI.' },
  { email: 'hr@infosys.com', name: 'Infosys HR Team', companyName: 'Infosys', industry: 'IT Services & Consulting', location: 'Bengaluru, Karnataka', website: 'https://www.infosys.com/careers', description: 'Infosys is a global leader in next-generation digital services and consulting, serving clients across 50+ countries.' },
  { email: 'recruit@tcs.com', name: 'TCS Recruitment', companyName: 'TCS', industry: 'IT Services & Consulting', location: 'Mumbai, Maharashtra', website: 'https://www.tcs.com/careers', description: 'Tata Consultancy Services is an IT services, consulting and business solutions organization.' },
  { email: 'talent@wipro.com', name: 'Wipro Talent Acquisition', companyName: 'Wipro', industry: 'IT Services', location: 'Bengaluru, Karnataka', website: 'https://careers.wipro.com', description: 'Wipro is a leading technology services and consulting company focused on building innovative solutions.' },
  { email: 'careers@hcltech.com', name: 'HCLTech Careers', companyName: 'HCLTech', industry: 'IT Services & Engineering', location: 'Noida, Uttar Pradesh', website: 'https://www.hcltech.com/careers', description: 'HCLTech is a global technology company supercharging progress with industry-leading digital and engineering capabilities.' },
  { email: 'hr@accenture.in', name: 'Accenture India Recruitment', companyName: 'Accenture', industry: 'Management Consulting & IT', location: 'Bengaluru, Karnataka', website: 'https://www.accenture.com/in-en/careers', description: 'Accenture is a global professional services company with leading capabilities in digital, cloud, and security.' },
  { email: 'talent@cognizant.com', name: 'Cognizant Talent Acquisition', companyName: 'Cognizant', industry: 'IT Services & Consulting', location: 'Chennai, Tamil Nadu', website: 'https://careers.cognizant.com', description: 'Cognizant engineers modern businesses to improve everyday lives across digital products and cloud modernization.' },
  { email: 'hr@capgemini.in', name: 'Capgemini India HR', companyName: 'Capgemini', industry: 'IT Consulting & Technology', location: 'Mumbai, Maharashtra', website: 'https://www.capgemini.com/in-en/careers', description: 'Capgemini is a global leader in partnering with companies to transform and manage business with technology.' },
  { email: 'careers@deloitte.in', name: 'Deloitte India Talent', companyName: 'Deloitte', industry: 'Audit, Tax & Advisory Services', location: 'Bengaluru, Karnataka', website: 'https://www2.deloitte.com/in/en/careers.html', description: 'Deloitte drives progress for clients across audit, consulting, financial advisory, risk management, and tax services.' },
  { email: 'hire@oracle.in', name: 'Oracle India Campus & Lateral', companyName: 'Oracle', industry: 'Enterprise Software & Cloud', location: 'Bengaluru, Karnataka', website: 'https://www.oracle.com/corporate/careers', description: 'Oracle offers integrated suites of applications plus secure, autonomous infrastructure in Oracle Cloud.' },
  { email: 'talent@cisco.in', name: 'Cisco Systems India', companyName: 'Cisco', industry: 'Networking Hardware & Security', location: 'Bengaluru, Karnataka', website: 'https://jobs.cisco.com', description: 'Cisco is the worldwide technology leader that securely connects everything to make anything possible.' },
  { email: 'careers@nvidia.in', name: 'NVIDIA India Careers', companyName: 'NVIDIA', industry: 'Semiconductors & AI', location: 'Pune, Maharashtra', website: 'https://www.nvidia.com/en-in/about-nvidia/careers', description: 'NVIDIA is the pioneer of GPU-accelerated computing and the global engine for modern artificial intelligence.' },
  { email: 'hr@intel.in', name: 'Intel Technology India', companyName: 'Intel', industry: 'Semiconductors & Microprocessors', location: 'Bengaluru, Karnataka', website: 'https://jobs.intel.com', description: 'Intel creates world-changing technology that enables global progress and enriches lives.' },
  { email: 'careers@qualcomm.in', name: 'Qualcomm India Talent', companyName: 'Qualcomm', industry: 'Wireless Telecommunications & Chips', location: 'Hyderabad, Telangana', website: 'https://www.qualcomm.com/company/careers', description: 'Qualcomm is the world leading wireless tech innovator behind 5G development and Snapdragon mobile processors.' },
  { email: 'talent@adobe.in', name: 'Adobe India Recruitment', companyName: 'Adobe', industry: 'Creative Software & Digital Media', location: 'Noida, Uttar Pradesh', website: 'https://www.adobe.com/careers.html', description: 'Adobe is changing the world through digital experiences with Photoshop, Illustrator, and Creative Cloud.' },
  { email: 'hr@salesforce.in', name: 'Salesforce India Careers', companyName: 'Salesforce', industry: 'Cloud & CRM Software', location: 'Hyderabad, Telangana', website: 'https://www.salesforce.com/company/careers', description: 'Salesforce is the customer company that empowers companies of every size and industry to connect with customers.' },
  { email: 'talent@zoho.com', name: 'Zoho Corporation HR', companyName: 'Zoho', industry: 'Cloud SaaS & Business Applications', location: 'Chennai, Tamil Nadu', website: 'https://careers.zohocorp.com', description: 'Zoho provides complete business software suites with 55+ products serving 100M+ users globally.' },
  { email: 'careers@freshworks.com', name: 'Freshworks People Ops', companyName: 'Freshworks', industry: 'Customer Experience & CRM SaaS', location: 'Chennai, Tamil Nadu', website: 'https://www.freshworks.com/company/careers', description: 'Freshworks creates innovative customer and employee engagement software that is intuitive and easy to use.' },
  { email: 'hire@flipkart.com', name: 'Flipkart Talent Team', companyName: 'Flipkart', industry: 'E-Commerce Marketplace', location: 'Bengaluru, Karnataka', website: 'https://www.flipkartcareers.com', description: 'Flipkart is one of India leading e-commerce marketplaces bringing millions of products to Indian consumers.' },
  { email: 'talent@swiggy.in', name: 'Swiggy People & Culture', companyName: 'Swiggy', industry: 'Food Delivery & Quick Commerce', location: 'Bengaluru, Karnataka', website: 'https://careers.swiggy.com', description: 'Swiggy is India leading on-demand convenience platform connecting consumers to restaurants, groceries, and more.' },
  { email: 'hr@zomato.com', name: 'Zomato Talent Team', companyName: 'Zomato', industry: 'Food Tech & Quick Commerce', location: 'Gurugram, Haryana', website: 'https://www.zomato.com/careers', description: 'Zomato connects customers, restaurant partners, and delivery partners across India and beyond.' },
  { email: 'careers@paytm.com', name: 'Paytm HR', companyName: 'Paytm', industry: 'Financial Technology & Digital Payments', location: 'Noida, Uttar Pradesh', website: 'https://paytm.com/about-us/careers', description: 'Paytm is India pioneer in mobile payments and financial services for consumers and merchants.' },
  { email: 'talent@phonepe.com', name: 'PhonePe Talent Acquisition', companyName: 'PhonePe', industry: 'Digital Payments & Financial Services', location: 'Bengaluru, Karnataka', website: 'https://www.phonepe.com/careers', description: 'PhonePe is India leading payments app making digital transactions easy, fast, and secure for 500M+ users.' },
  { email: 'hire@uber.in', name: 'Uber India Engineering', companyName: 'Uber', industry: 'Mobility & Transportation Tech', location: 'Bengaluru, Karnataka', website: 'https://www.uber.com/in/en/careers', description: 'Uber reimagines the way the world moves for the better through ridesharing, delivery, and freight.' },
  { email: 'hr@atlassian.in', name: 'Atlassian India People', companyName: 'Atlassian', industry: 'Developer Collaboration Software', location: 'Bengaluru, Karnataka', website: 'https://www.atlassian.com/company/careers', description: 'Atlassian creates collaboration tools like Jira, Confluence, and Trello that empower teamwork worldwide.' },
  { email: 'careers@siemens.in', name: 'Siemens Technology India', companyName: 'Siemens', industry: 'Industrial Automation & Digitalization', location: 'Bengaluru, Karnataka', website: 'https://new.siemens.com/in/en/company/jobs.html', description: 'Siemens focuses on industry, infrastructure, transport, and healthcare to create technology with purpose.' },
  { email: 'hire@bosch.in', name: 'Bosch Global Software Tech', companyName: 'Bosch', industry: 'Mobility Solutions & IoT', location: 'Bengaluru, Karnataka', website: 'https://www.bosch.in/careers', description: 'Bosch is a world leader in automotive engineering, IoT, and industrial software technologies.' },
  { email: 'talent@dell.in', name: 'Dell Technologies India', companyName: 'Dell', industry: 'Computer Hardware & Cloud Infrastructure', location: 'Bengaluru, Karnataka', website: 'https://jobs.dell.com', description: 'Dell Technologies drives human progress through accessible technology solutions from PC hardware to edge computing.' },
  { email: 'hr@hp.in', name: 'HP Inc. India Talent', companyName: 'HP', industry: 'Personal Systems & Print Technology', location: 'Bengaluru, Karnataka', website: 'https://jobs.hp.com', description: 'HP creates technology that makes life better for everyone, everywhere with personal computing and printing solutions.' },
  { email: 'careers@tataelxsi.com', name: 'Tata Elxsi Talent Acquisition', companyName: 'Tata Elxsi', industry: 'Design & Engineering Services', location: 'Bengaluru, Karnataka', website: 'https://www.tataelxsi.com/careers', description: 'Tata Elxsi helps customers bring next-generation automotive, broadcast, communications, and healthcare products to market.' },
  { email: 'talent@ltimindtree.com', name: 'LTIMindtree Careers', companyName: 'LTIMindtree', industry: 'IT Services & Consulting', location: 'Bengaluru, Karnataka', website: 'https://www.ltimindtree.com/careers', description: 'LTIMindtree is a global technology consulting and digital solutions company enabling digital transformation.' },
  { email: 'careers@techmahindra.com', name: 'Tech Mahindra Recruitment', companyName: 'Tech Mahindra', industry: 'Digital Transformation & Telecom IT', location: 'Pune, Maharashtra', website: 'https://careers.techmahindra.com', description: 'Tech Mahindra delivers innovative and customer-centric digital experiences for enterprises worldwide.' },
  { email: 'talent@tataelectronics.com', name: 'Tata Electronics Talent', companyName: 'Tata Electronics', industry: 'Electronics Manufacturing & Precision Engineering', location: 'Hosur, Tamil Nadu', website: 'https://www.tataelectronics.com', description: 'Tata Electronics is a greenfield venture by the Tata Group leading precision electronics and semiconductor manufacturing.' }
];

const RAW_JOBS = [
  // 1. Google - Software Developer
  {
    companyName: 'Google',
    title: '[Sample Listing] Software Developer – Distributed Systems',
    category: 'Software Engineering',
    role: 'Software Developer',
    description: 'Sample demonstration listing. Join Google core infrastructure team working on high-throughput backend services and storage architectures. Real-world tasks involve distributed algorithms, latency profiling, and microservice resilience.',
    responsibilities: 'Design and implement high-availability services in C++ or Java.\nPerform distributed tracing and latency optimization.\nCollaborate in cross-functional design sprints.',
    requiredSkills: ['C++', 'Java', 'Distributed Systems', 'Data Structures', 'Linux', 'Git'],
    qualifications: 'B.Tech or M.Tech in Computer Science or related engineering field.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    salary: '₹18,00,000 – ₹24,00,000 / year',
    deadlineDays: 45
  },
  // 2. Microsoft - AI/ML Engineer
  {
    companyName: 'Microsoft',
    title: '[Sample Listing] AI/ML Engineer – Azure Cognitive Services',
    category: 'Data Science & AI',
    role: 'AI/ML Engineer',
    description: 'Sample demonstration listing. Work with the Azure AI research division to train, fine-tune, and deploy transformer-based deep learning models and enterprise cognitive microservices.',
    responsibilities: 'Fine-tune LLMs and transformer architectures using PyTorch.\nBuild high-throughput inference endpoints with ONNX Runtime.\nMonitor dataset drift and model accuracy metrics.',
    requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Azure', 'ONNX', 'Git'],
    qualifications: 'Degree in Computer Science, AI, or Mathematics with relevant portfolio.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Hyderabad, Telangana',
    salary: '₹16,00,000 – ₹22,00,000 / year',
    deadlineDays: 40
  },
  // 3. Amazon - Cloud Engineer
  {
    companyName: 'Amazon',
    title: '[Sample Listing] Cloud Engineer – AWS Infrastructure',
    category: 'DevOps & Cloud',
    role: 'Cloud Engineer',
    description: 'Sample demonstration listing. Help architect, manage, and scale high-availability AWS cloud infrastructure for Amazon retail operations, microservice fleets, and serverless architectures.',
    responsibilities: 'Provision and maintain multi-region AWS environments using Terraform.\nImplement auto-scaling policies, VPC peering, and IAM policies.\nRespond to cloud system events and drive continuous reliability.',
    requiredSkills: ['AWS', 'Terraform', 'Linux', 'Bash', 'Docker', 'Networking', 'Python'],
    qualifications: 'Bachelor in Engineering with AWS Certified Solutions Architect or Cloud Practitioner.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Hyderabad, Telangana',
    salary: '₹14,00,000 – ₹19,00,000 / year',
    deadlineDays: 35
  },
  // 4. Apple - Full Stack Developer
  {
    companyName: 'Apple',
    title: '[Sample Listing] Full Stack Developer – Internal Engineering Tools',
    category: 'Software Engineering',
    role: 'Full Stack Developer',
    description: 'Sample demonstration listing. Build end-to-end internal web applications for Apple hardware engineering teams. Stack comprises React, Node.js, and relational SQL databases with pixel-perfect design standards.',
    responsibilities: 'Create responsive frontends in modern React and TypeScript.\nDesign resilient REST and GraphQL APIs in Node.js.\nMaintain PostgreSQL schemas and optimize complex joins.',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'PostgreSQL', 'HTML', 'CSS', 'Git'],
    qualifications: 'B.Tech/B.E in CS/IT with demonstrable full-stack web projects.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Bengaluru, Karnataka',
    salary: '₹17,00,000 – ₹23,00,000 / year',
    deadlineDays: 38
  },
  // 5. Meta - Frontend Developer
  {
    companyName: 'Meta',
    title: '[Sample Listing] Frontend Developer – Web Experience Team',
    category: 'Software Engineering',
    role: 'Frontend Developer',
    description: 'Sample demonstration listing. Build interactive, performant web interfaces with React, Relay, and modern CSS modules. Focus on Core Web Vitals, accessibility, and high framerates across devices.',
    responsibilities: 'Develop reusable React UI components.\nProfile rendering bottlenecks and eliminate layout shifts.\nEnsure WCAG 2.1 AA accessibility compliance across all components.',
    requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'TypeScript', 'Webpack', 'Git'],
    qualifications: 'Degree in Engineering or Computer Applications with strong frontend mastery.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    salary: '₹18,00,000 – ₹25,00,000 / year',
    deadlineDays: 30
  },
  // 6. IBM - Data Scientist
  {
    companyName: 'IBM',
    title: '[Sample Listing] Data Scientist – Predictive Analytics Hub',
    category: 'Data Science & AI',
    role: 'Data Scientist',
    description: 'Sample demonstration listing. Build statistical models, time-series forecasts, and churn predictors using Python, pandas, and scikit-learn for enterprise telecom and healthcare accounts.',
    responsibilities: 'Perform exploratory data analysis on multi-gigabyte tabular datasets.\nTrain classification and regression models with cross-validation.\nTranslate business inquiries into data-backed executive presentations.',
    requiredSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-Learn', 'Statistics', 'Tableau'],
    qualifications: 'Master or Bachelor in Statistics, Mathematics, Data Science, or Computer Science.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Delhi, India',
    salary: '₹11,00,000 – ₹15,00,000 / year',
    deadlineDays: 42
  },
  // 7. Infosys - Java Developer
  {
    companyName: 'Infosys',
    title: '[Sample Listing] Java Developer – Core Banking Modernization',
    category: 'Software Engineering',
    role: 'Java Developer',
    description: 'Sample demonstration listing. Modernize legacy banking workflows into Spring Boot microservices backed by Kafka event streams and Oracle databases.',
    responsibilities: 'Write robust Spring Boot REST controllers and service layers.\nWrite JUnit unit tests and Mockito mock tests.\nDeploy microservices onto OpenShift container clusters.',
    requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'REST APIs', 'Hibernate', 'Oracle DB', 'Git'],
    qualifications: 'B.Tech/B.E in CS/IT/ECE with strong Java fundamentals.',
    experienceLevel: 'Fresher',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Mysuru, Karnataka',
    salary: '₹4,80,000 – ₹6,50,000 / year',
    deadlineDays: 35
  },
  // 8. TCS - Python Developer
  {
    companyName: 'TCS',
    title: '[Sample Listing] Python Developer – Enterprise Automation & API Suite',
    category: 'Software Engineering',
    role: 'Python Developer',
    description: 'Sample demonstration listing. Develop scalable Python APIs using FastAPI and Django for internal enterprise portal integrations and automated reporting pipelines.',
    responsibilities: 'Build asynchronous REST APIs using FastAPI and Pydantic.\nImplement background worker tasks with Celery and Redis.\nWrite automated unit test suites using pytest.',
    requiredSkills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'Git'],
    qualifications: 'B.Tech/B.Sc in Computer Science or IT.',
    experienceLevel: 'Fresher',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Kolkata, West Bengal',
    salary: '₹4,20,000 – ₹5,80,000 / year',
    deadlineDays: 28
  },
  // 9. Wipro - Cybersecurity Analyst
  {
    companyName: 'Wipro',
    title: '[Sample Listing] Cybersecurity Analyst – SOC Defense',
    category: 'Cybersecurity',
    role: 'Cybersecurity Analyst',
    description: 'Sample demonstration listing. Monitor security event streams 24/7 across client networks. Investigate intrusion indicators, triage alerts, and execute incident containment playbooks.',
    responsibilities: 'Analyze real-time security alerts in Splunk and QRadar.\nInvestigate potential phishing campaigns and unauthorized access attempts.\nDraft root-cause incident response reports for security management.',
    requiredSkills: ['SIEM', 'Network Security', 'Linux', 'Incident Response', 'Wireshark', 'Firewalls', 'Python'],
    qualifications: 'B.Tech/BCA with Security+, CEH or equivalent cybersecurity coursework.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Kochi, Kerala',
    salary: '₹5,50,000 – ₹7,50,000 / year',
    deadlineDays: 32
  },
  // 10. HCLTech - Network Engineer
  {
    companyName: 'HCLTech',
    title: '[Sample Listing] Network Engineer – Global Infrastructure Operations',
    category: 'Networking & Systems',
    role: 'Network Engineer',
    description: 'Sample demonstration listing. Configure, maintain, and troubleshoot enterprise LAN/WAN networks, Cisco routers, core switches, and Palo Alto perimeter firewalls.',
    responsibilities: 'Configure BGP, OSPF routing protocols and VLAN topologies.\nPerform packet captures and analyze network latency issues.\nCoordinate planned firmware upgrades and disaster recovery drills.',
    requiredSkills: ['Cisco Networking', 'CCNA', 'TCP/IP', 'BGP', 'OSPF', 'Firewall Configuration', 'Wireshark'],
    qualifications: 'B.Tech in ECE/CS or Diploma with CCNA certification.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Noida, Uttar Pradesh',
    salary: '₹4,50,000 – ₹6,20,000 / year',
    deadlineDays: 25
  },
  // 11. Accenture - DevOps Engineer
  {
    companyName: 'Accenture',
    title: '[Sample Listing] DevOps Engineer – Cloud CI/CD Automation',
    category: 'DevOps & Cloud',
    role: 'DevOps Engineer',
    description: 'Sample demonstration listing. Automate build, test, and release pipelines for enterprise financial clients leveraging GitHub Actions, Docker, and Kubernetes.',
    responsibilities: 'Build declarative CI/CD pipelines with GitHub Actions.\nManage container clusters on Azure Kubernetes Service (AKS).\nImplement automated infrastructure as code with Terraform.',
    requiredSkills: ['Docker', 'Kubernetes', 'Terraform', 'Azure', 'GitHub Actions', 'Linux', 'Python'],
    qualifications: 'B.Tech in CS/IT with practical DevOps tooling experience.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Mumbai, Maharashtra',
    salary: '₹7,50,000 – ₹10,50,000 / year',
    deadlineDays: 40
  },
  // 12. Cognizant - Software Tester
  {
    companyName: 'Cognizant',
    title: '[Sample Listing] Software Tester – Automation & Quality Engineering',
    category: 'Quality Assurance & Testing',
    role: 'Software Tester',
    description: 'Sample demonstration listing. Create automated test suites for web and mobile applications using Selenium WebDriver, TestNG, and Postman API automation.',
    responsibilities: 'Design test scenarios, test cases, and traceability matrices.\nDevelop automated regression scripts using Java and Selenium.\nExecute API testing with Postman and log defects in Jira.',
    requiredSkills: ['Selenium', 'Java', 'TestNG', 'Postman', 'Jira', 'SQL', 'Manual Testing'],
    qualifications: 'B.Tech/BCA/B.Sc in CS or related field. ISTQB certification preferred.',
    experienceLevel: 'Fresher',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Coimbatore, Tamil Nadu',
    salary: '₹4,00,000 – ₹5,50,000 / year',
    deadlineDays: 30
  },
  // 13. Capgemini - Data Analyst
  {
    companyName: 'Capgemini',
    title: '[Sample Listing] Data Analyst – Supply Chain & Logistics Insights',
    category: 'Data Science & AI',
    role: 'Data Analyst',
    description: 'Sample demonstration listing. Cleanse and model supply chain transactional datasets, design interactive dashboards, and deliver operational KPI metrics for global manufacturing clients.',
    responsibilities: 'Write complex SQL queries, window functions, and aggregations.\nBuild executive dashboards in Power BI and Tableau.\nAutomate data ingestion routines with Python scripts.',
    requiredSkills: ['SQL', 'Power BI', 'Python', 'Excel', 'Data Modeling', 'Tableau', 'Statistics'],
    qualifications: 'Degree in Statistics, Mathematics, Computer Science, or Business Analytics.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Pune, Maharashtra',
    salary: '₹5,20,000 – ₹7,20,000 / year',
    deadlineDays: 35
  },
  // 14. Deloitte - UI/UX Designer
  {
    companyName: 'Deloitte',
    title: '[Sample Listing] UI/UX Designer – Digital Transformation Studio',
    category: 'UI/UX Design',
    role: 'UI/UX Designer',
    description: 'Sample demonstration listing. Create intuitive enterprise design systems, interactive prototypes, and modern dashboards that streamline complex corporate workflows.',
    responsibilities: 'Conduct stakeholder user interviews and build customer journey maps.\nDesign high-fidelity wireframes and design systems in Figma.\nFacilitate usability testing and hand off component specs to engineers.',
    requiredSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
    qualifications: 'Degree in Design, HCI, or related field with a modern digital portfolio.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Mumbai, Maharashtra',
    salary: '₹7,00,000 – ₹10,00,000 / year',
    deadlineDays: 28
  },
  // 15. Oracle - Backend Developer
  {
    companyName: 'Oracle',
    title: '[Sample Listing] Backend Developer – Autonomous Database Cloud',
    category: 'Software Engineering',
    role: 'Backend Developer',
    description: 'Sample demonstration listing. Work on backend microservices driving Oracle Cloud Autonomous Database management APIs, telemetry processors, and provisioning engines.',
    responsibilities: 'Develop high-performance REST APIs using Java and Spring.\nOptimize complex SQL queries and PL/SQL stored procedures.\nImplement reliable error handling and automated monitoring.',
    requiredSkills: ['Java', 'SQL', 'PL/SQL', 'Spring Boot', 'REST APIs', 'Linux', 'Git'],
    qualifications: 'B.Tech/M.Tech in CS/IT with strong backend architecture skills.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Ahmedabad, Gujarat',
    salary: '₹9,00,000 – ₹13,00,000 / year',
    deadlineDays: 34
  },
  // 16. Cisco - Network Engineer
  {
    companyName: 'Cisco',
    title: '[Sample Listing] Network Engineer – SD-WAN & Cloud Networking',
    category: 'Networking & Systems',
    role: 'Network Engineer',
    description: 'Sample demonstration listing. Support the deployment and automated validation of Cisco SD-WAN controllers, vEdge routers, and cloud access security brokers.',
    responsibilities: 'Deploy and test SD-WAN overlay topologies.\nAutomate device configurations using Python and Ansible.\nAnalyze telemetry data to optimize WAN traffic paths.',
    requiredSkills: ['Cisco Networking', 'SD-WAN', 'Python', 'Ansible', 'Routing Protocols', 'Linux', 'CCNA'],
    qualifications: 'B.Tech in ECE/CS/IT with Cisco certification or coursework.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Bengaluru, Karnataka',
    salary: '₹10,00,000 – ₹14,00,000 / year',
    deadlineDays: 36
  },
  // 17. NVIDIA - AI/ML Engineer
  {
    companyName: 'NVIDIA',
    title: '[Sample Listing] AI/ML Engineer – Computer Vision & TensorRT',
    category: 'Data Science & AI',
    role: 'AI/ML Engineer',
    description: 'Sample demonstration listing. Optimize state-of-the-art computer vision models for edge inference on NVIDIA Jetson platforms and data center GPUs using TensorRT.',
    responsibilities: 'Implement object detection and segmentation models using PyTorch.\nQuantize neural networks (FP16/INT8) using TensorRT.\nBenchmark latency, memory throughput, and model FPS.',
    requiredSkills: ['PyTorch', 'Python', 'Computer Vision', 'CUDA', 'C++', 'TensorRT', 'Git'],
    qualifications: 'M.Tech or B.Tech in CS/AI with hands-on computer vision project experience.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Pune, Maharashtra',
    salary: '₹19,00,000 – ₹26,00,000 / year',
    deadlineDays: 45
  },
  // 18. Intel - Software Developer
  {
    companyName: 'Intel',
    title: '[Sample Listing] Software Developer – Systems & Linux Kernel Driver',
    category: 'Software Engineering',
    role: 'Software Developer',
    description: 'Sample demonstration listing. Develop and debug Linux device drivers and low-level firmware for upcoming Intel processor platforms and PCIe accelerators.',
    responsibilities: 'Write and test C drivers for Linux kernel subsystems.\nPerform hardware bring-up and debug using logic analyzers.\nContribute fixes to internal and open-source toolchains.',
    requiredSkills: ['C', 'Linux Kernel', 'Device Drivers', 'GDB', 'Data Structures', 'Git'],
    qualifications: 'B.Tech/M.Tech in ECE/CS with low-level systems programming interest.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Bengaluru, Karnataka',
    salary: '₹13,00,000 – ₹18,00,000 / year',
    deadlineDays: 35
  },
  // 19. Qualcomm - Android Developer
  {
    companyName: 'Qualcomm',
    title: '[Sample Listing] Android Developer – Multimedia & Camera Stack',
    category: 'Software Engineering',
    role: 'Android Developer',
    description: 'Sample demonstration listing. Integrate and optimize Android camera HAL, video codecs, and display pipelines for Snapdragon powered mobile chipsets.',
    responsibilities: 'Develop Android framework modules in Kotlin and Java.\nDebug native C++ layers using Android NDK.\nOptimize image capture latency and video recording frame rates.',
    requiredSkills: ['Android Development', 'Kotlin', 'Java', 'C++', 'Android NDK', 'Git'],
    qualifications: 'B.Tech in CS/ECE with hands-on Android development experience.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Hyderabad, Telangana',
    salary: '₹15,00,000 – ₹21,00,000 / year',
    deadlineDays: 32
  },
  // 20. Adobe - UI/UX Designer
  {
    companyName: 'Adobe',
    title: '[Sample Listing] UI/UX Designer – Web Creation Tools',
    category: 'UI/UX Design',
    role: 'UI/UX Designer',
    description: 'Sample demonstration listing. Design delightful user experiences for web-based authoring surfaces, collaborative design canvases, and asset browser panels.',
    responsibilities: 'Create interaction concepts, wireframes, and prototypes in Figma and Adobe XD.\nConduct qualitative user testing with creative professionals.\nDefine visual guidelines aligned with the Spectrum design token system.',
    requiredSkills: ['Figma', 'Adobe XD', 'UI/UX Design', 'User Research', 'Prototyping', 'Design Systems'],
    qualifications: 'Design degree or equivalent portfolio demonstrating consumer web product UI.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Noida, Uttar Pradesh',
    salary: '₹8,50,000 – ₹12,50,000 / year',
    deadlineDays: 30
  },
  // 21. Salesforce - Full Stack Developer
  {
    companyName: 'Salesforce',
    title: '[Sample Listing] Full Stack Developer – Remote Customer Success Hub',
    category: 'Software Engineering',
    role: 'Full Stack Developer',
    description: 'Sample demonstration listing. Fully remote role building customer support intelligence portals with Node.js microservices and Lightning Web Components (LWC).',
    responsibilities: 'Build interactive dashboards using modern web standards and LWC.\nDesign and maintain REST microservices with Node.js and Express.\nEnsure 85%+ test coverage with Jest and Mocha.',
    requiredSkills: ['JavaScript', 'Node.js', 'Express.js', 'REST APIs', 'HTML', 'CSS', 'PostgreSQL', 'Git'],
    qualifications: 'B.Tech/MCA with proficiency in JavaScript across frontend and backend.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Remote',
    location: 'Remote, India',
    salary: '₹12,00,000 – ₹17,00,000 / year',
    deadlineDays: 40
  },
  // 22. Zoho - Java Developer
  {
    companyName: 'Zoho',
    title: '[Sample Listing] Java Developer – Zoho Books Accounting Engine',
    category: 'Software Engineering',
    role: 'Java Developer',
    description: 'Sample demonstration listing. Build high-reliability financial transaction processing engines and ledger accounting modules supporting millions of business invoices daily.',
    responsibilities: 'Develop high-performance Java code with minimal garbage collection overhead.\nDesign optimized MySQL schema tables, indices, and partitioned tables.\nResolve concurrency bottlenecks in multi-tenant environments.',
    requiredSkills: ['Java', 'MySQL', 'Multithreading', 'Data Structures', 'REST APIs', 'Git'],
    qualifications: 'B.Tech/B.E in CS/IT with solid understanding of object-oriented architecture.',
    experienceLevel: 'Fresher',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Chennai, Tamil Nadu',
    salary: '₹5,50,000 – ₹8,00,000 / year',
    deadlineDays: 35
  },
  // 23. Freshworks - Frontend Developer
  {
    companyName: 'Freshworks',
    title: '[Sample Listing] Frontend Developer – Freshservice ITSM',
    category: 'Software Engineering',
    role: 'Frontend Developer',
    description: 'Sample demonstration listing. Build lightning-fast ticket resolution consoles and analytics widgets for IT service desk professionals using React, TypeScript, and Tailwind CSS.',
    responsibilities: 'Develop modular React component libraries with accessibility baked in.\nIntegrate GraphQL and RESTful backend APIs seamlessly.\nProfile memory leaks and optimize client-side bundle size.',
    requiredSkills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'REST APIs', 'Git'],
    qualifications: 'B.Tech in CS/IT with demonstrable web development projects.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Chennai, Tamil Nadu',
    salary: '₹8,00,000 – ₹11,50,000 / year',
    deadlineDays: 30
  },
  // 24. Razorpay - Backend Developer
  {
    companyName: 'Razorpay',
    title: '[Sample Listing] Backend Developer – Subscriptions & Recurring Payments',
    category: 'Software Engineering',
    role: 'Backend Developer',
    description: 'Sample demonstration listing. Build high-concurrency payment mandate services in Go and Node.js that process millions of recurring auto-debit payments daily.',
    responsibilities: 'Design resilient distributed workflows for payment gateway failovers.\nOptimize Redis caching and PostgreSQL query latency.\nInstrument telemetry using Prometheus, OpenTelemetry, and Grafana.',
    requiredSkills: ['Node.js', 'Go', 'PostgreSQL', 'Redis', 'Kafka', 'Microservices', 'Git'],
    qualifications: 'B.Tech in CS/IT with understanding of distributed systems.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    salary: '₹14,00,000 – ₹19,00,000 / year',
    deadlineDays: 35
  },
  // 25. Flipkart - Data Scientist
  {
    companyName: 'Flipkart',
    title: '[Sample Listing] Data Scientist – Search Ranking & Discovery',
    category: 'Data Science & AI',
    role: 'Data Scientist',
    description: 'Sample demonstration listing. Enhance search relevance and query understanding for over 150 million Indian e-commerce shoppers using NLP and semantic search embeddings.',
    responsibilities: 'Train learning-to-rank algorithms on clickstream and purchase data.\nEvaluate semantic text search using BERT and FAISS vector embeddings.\nRun rigorous A/B experiments on search engine result pages.',
    requiredSkills: ['Python', 'Machine Learning', 'NLP', 'SQL', 'PyTorch', 'Spark', 'Statistics'],
    qualifications: 'M.Tech/B.Tech in CS, Statistics, or Data Science.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    salary: '₹17,00,000 – ₹24,00,000 / year',
    deadlineDays: 40
  },
  // 26. Swiggy - Python Developer
  {
    companyName: 'Swiggy',
    title: '[Sample Listing] Python Developer – Delivery Dispatch & Surge Pricing',
    category: 'Software Engineering',
    role: 'Python Developer',
    description: 'Sample demonstration listing. Develop real-time dispatch algorithms and batch allocation microservices in Python that pair hungry diners with nearby delivery partners.',
    responsibilities: 'Write performant Python backend services using AsyncIO and FastAPI.\nIntegrate Redis geospatial indices for rapid proximity lookups.\nMonitor dispatch latency and optimize queue throughput.',
    requiredSkills: ['Python', 'FastAPI', 'Redis', 'Docker', 'PostgreSQL', 'Microservices', 'Git'],
    qualifications: 'B.Tech/B.E in Computer Science with algorithmic problem-solving skills.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Gurugram, Haryana',
    salary: '₹13,00,000 – ₹18,00,000 / year',
    deadlineDays: 28
  },
  // 27. Zomato - Android Developer
  {
    companyName: 'Zomato',
    title: '[Sample Listing] Android Developer – Dining & Live Order Tracking',
    category: 'Software Engineering',
    role: 'Android Developer',
    description: 'Sample demonstration listing. Build fluid, animations-driven Android screens using Jetpack Compose that display live delivery rider GPS tracks and restaurant menus.',
    responsibilities: 'Craft reactive UIs with Jetpack Compose, Kotlin Coroutines, and Flow.\nIntegrate Google Maps SDK for real-time order tracking animations.\nEnsure smooth 60fps scrolling and memory-safe image caching.',
    requiredSkills: ['Android Development', 'Kotlin', 'Jetpack Compose', 'MVVM', 'REST APIs', 'Git'],
    qualifications: 'B.Tech in CS/IT with published Android applications or portfolio repos.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Gurugram, Haryana',
    salary: '₹12,00,000 – ₹17,00,000 / year',
    deadlineDays: 30
  },
  // 28. Paytm - Cybersecurity Analyst
  {
    companyName: 'Paytm',
    title: '[Sample Listing] Cybersecurity Analyst – Payment Security & Fraud Prevention',
    category: 'Cybersecurity',
    role: 'Cybersecurity Analyst',
    description: 'Sample demonstration listing. Guard payment rails against account takeover, automated bot attacks, and fraudulent transactions across millions of wallet and UPI users.',
    responsibilities: 'Analyze anomalous transaction patterns using real-time security rules.\nPerform vulnerability assessments and web app penetration testing.\nEnsure continuous compliance with RBI security guidelines and PCI-DSS.',
    requiredSkills: ['Cybersecurity', 'Web Application Security', 'Burp Suite', 'Python', 'SQL', 'PCI-DSS'],
    qualifications: 'Degree in Engineering or Cyber Forensics with CEH/CompTIA certifications.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Noida, Uttar Pradesh',
    salary: '₹8,00,000 – ₹12,00,000 / year',
    deadlineDays: 32
  },
  // 29. PhonePe - Software Developer
  {
    companyName: 'PhonePe',
    title: '[Sample Listing] Software Developer – Merchant Checkout Infrastructure',
    category: 'Software Engineering',
    role: 'Software Developer',
    description: 'Sample demonstration listing. Engineer merchant payment gateway APIs handling 10,000+ queries per second with sub-100ms response times.',
    responsibilities: 'Build reliable microservices using Java and Dropwizard/Spring.\nDesign idempotent payment API endpoints and webhook retries.\nMaintain zero-downtime release deployments.',
    requiredSkills: ['Java', 'Spring Boot', 'MySQL', 'Kafka', 'Redis', 'REST APIs', 'Git'],
    qualifications: 'B.Tech in CS/IT with strong foundations in multi-threading and data structures.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    salary: '₹15,00,000 – ₹21,00,000 / year',
    deadlineDays: 35
  },
  // 30. Uber - Backend Developer
  {
    companyName: 'Uber',
    title: '[Sample Listing] Backend Developer – Driver Lifecycle Platform',
    category: 'Software Engineering',
    role: 'Backend Developer',
    description: 'Sample demonstration listing. Join Uber engineering to build scalable document verification, onboarding workflows, and earnings computation microservices in Go.',
    responsibilities: 'Design and implement resilient services in Go.\nModel high-throughput datastores with Cassandra and MySQL.\nWrite comprehensive integration and performance benchmark suites.',
    requiredSkills: ['Go', 'Microservices', 'Cassandra', 'MySQL', 'Docker', 'Kafka', 'Git'],
    qualifications: 'B.Tech/M.Tech in Computer Science or Software Engineering.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    salary: '₹20,00,000 – ₹28,00,000 / year',
    deadlineDays: 42
  },
  // 31. Atlassian - DevOps Engineer
  {
    companyName: 'Atlassian',
    title: '[Sample Listing] DevOps Engineer – Global Site Reliability',
    category: 'DevOps & Cloud',
    role: 'DevOps Engineer',
    description: 'Sample demonstration listing. Work from anywhere in India keeping Jira and Confluence cloud services reliable and performant for millions of daily active engineering teams.',
    responsibilities: 'Manage AWS infrastructure via Terraform and internal IaC tooling.\nAutomate incident response routines with Python and AWS Lambda.\nEstablish SLO/SLI error budget monitoring using Datadog and Splunk.',
    requiredSkills: ['Terraform', 'AWS', 'Kubernetes', 'Python', 'Linux', 'Datadog', 'Git'],
    qualifications: 'B.Tech/BCA in CS with hands-on cloud automation and SRE experience.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Remote',
    location: 'Remote, India',
    salary: '₹16,00,000 – ₹24,00,000 / year',
    deadlineDays: 38
  },
  // 32. Siemens - Cloud Engineer
  {
    companyName: 'Siemens',
    title: '[Sample Listing] Cloud Engineer – MindSphere Industrial IoT',
    category: 'DevOps & Cloud',
    role: 'Cloud Engineer',
    description: 'Sample demonstration listing. Architect and operate cloud data lakes and edge-to-cloud telemetry ingestion pipelines for Siemens smart factory and turbine installations.',
    responsibilities: 'Deploy and scale AWS and Azure IoT Hub microservices.\nConfigure secure API gateways and mutual TLS device authentication.\nMonitor real-time machine telemetry streams with Grafana.',
    requiredSkills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Linux', 'Python', 'Networking'],
    qualifications: 'B.Tech in CS/ECE/EEE with interest in industrial IoT and cloud engineering.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    salary: '₹8,50,000 – ₹12,50,000 / year',
    deadlineDays: 30
  },
  // 33. Bosch - Software Tester
  {
    companyName: 'Bosch',
    title: '[Sample Listing] Software Tester – Automotive Embedded Diagnostics',
    category: 'Quality Assurance & Testing',
    role: 'Software Tester',
    description: 'Sample demonstration listing. Validate ECU control software, CAN bus message traffic, and safety diagnostic stacks using CANoe and automated test benches in Hosur.',
    responsibilities: 'Create automated Hardware-in-the-Loop (HIL) test scripts using CAPL and Python.\nLog and analyze automotive CAN/LIN bus trace logs.\nVerify compliance against ISO 26262 automotive safety standards.',
    requiredSkills: ['Software Testing', 'Python', 'CAN Bus', 'CAPL', 'CANoe', 'Embedded Testing'],
    qualifications: 'B.Tech in ECE/EEE/Mechanical with automotive software testing focus.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Hosur, Tamil Nadu',
    salary: '₹5,50,000 – ₹8,00,000 / year',
    deadlineDays: 35
  },
  // 34. Dell - Data Analyst
  {
    companyName: 'Dell',
    title: '[Sample Listing] Data Analyst – Global Operations & Inventory',
    category: 'Data Science & AI',
    role: 'Data Analyst',
    description: 'Sample demonstration listing. Track manufacturing yield, component supplier lead times, and global distribution logistics using automated Power BI reports and SQL.',
    responsibilities: 'Extract, clean, and consolidate inventory metrics from enterprise data warehouses.\nBuild automated reporting models with DAX and Power Query.\nPresent variance insights and forecast summaries to supply chain directors.',
    requiredSkills: ['SQL', 'Power BI', 'Excel', 'DAX', 'Python', 'Data Analytics', 'Statistics'],
    qualifications: 'B.Tech, B.Sc, or MBA in Analytics/Operations/Computer Science.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    salary: '₹6,00,000 – ₹9,00,000 / year',
    deadlineDays: 28
  },
  // 35. HP - Software Tester
  {
    companyName: 'HP',
    title: '[Sample Listing] Software Tester – Print Ecosystem Automation',
    category: 'Quality Assurance & Testing',
    role: 'Software Tester',
    description: 'Sample demonstration listing. Build Python and Appium test automation suites verifying HP Smart printing apps and cloud printer firmware across Windows, macOS, and mobile.',
    responsibilities: 'Automate end-to-end user workflows using Python and Appium/Selenium.\nExecute network protocol testing across Wi-Fi Direct and AirPrint.\nTrack defect lifecycles and regression pass rates in Jira.',
    requiredSkills: ['Python', 'Selenium', 'Appium', 'Test Automation', 'Jira', 'Git'],
    qualifications: 'Degree in Computer Science or IT with test automation coursework.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Chennai, Tamil Nadu',
    salary: '₹5,00,000 – ₹7,50,000 / year',
    deadlineDays: 32
  },
  // 36. Tata Elxsi - Android Developer
  {
    companyName: 'Tata Elxsi',
    title: '[Sample Listing] Android Developer – In-Vehicle Infotainment (AAOS)',
    category: 'Software Engineering',
    role: 'Android Developer',
    description: 'Sample demonstration listing. Build custom Android Automotive OS (AAOS) applications and digital instrument cluster interfaces for next-generation electric vehicles.',
    responsibilities: 'Develop automotive companion apps using Kotlin and Jetpack.\nInterface with vehicle Car API services and hardware HAL layers.\nEnsure strict compliance with automotive distraction-free UI guidelines.',
    requiredSkills: ['Android Development', 'Kotlin', 'AAOS', 'Java', 'Android SDK', 'Git'],
    qualifications: 'B.Tech in CS/ECE with hands-on Android mobile or embedded development.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Hybrid',
    location: 'Kochi, Kerala',
    salary: '₹6,00,000 – ₹9,50,000 / year',
    deadlineDays: 35
  },
  // 37. LTIMindtree - Java Developer
  {
    companyName: 'LTIMindtree',
    title: '[Sample Listing] Java Developer – Digital Retail Platforms',
    category: 'Software Engineering',
    role: 'Java Developer',
    description: 'Sample demonstration listing. Develop scalable e-commerce cart, checkout, and inventory microservices using Spring Boot and PostgreSQL for Fortune 500 retail clients.',
    responsibilities: 'Implement RESTful web services in Java 17 and Spring Boot.\nIntegrate Redis distributed caching and Kafka order notification topics.\nWrite automated unit test cases with JUnit 5.',
    requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis', 'Git'],
    qualifications: 'B.Tech/B.E in CS/IT/ECE.',
    experienceLevel: 'Fresher',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Coimbatore, Tamil Nadu',
    salary: '₹4,50,000 – ₹6,50,000 / year',
    deadlineDays: 30
  },
  // 38. Tech Mahindra - Network Engineer
  {
    companyName: 'Tech Mahindra',
    title: '[Sample Listing] Network Engineer – 5G Telecom Operations',
    category: 'Networking & Systems',
    role: 'Network Engineer',
    description: 'Sample demonstration listing. Monitor, maintain, and troubleshoot core IP routing and 5G radio access network (RAN) connectivity for leading international telecom carriers.',
    responsibilities: 'Monitor network performance alarms in network operations center (NOC).\nConfigure IP routing protocols (MPLS, BGP) on carrier-grade routers.\nCoordinate emergency network restorations during fiber cuts.',
    requiredSkills: ['Cisco Networking', 'CCNA', 'TCP/IP', 'MPLS', 'BGP', 'Telecom', 'Linux'],
    qualifications: 'B.Tech in ECE/Telecommunications/CS.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Jaipur, Rajasthan',
    salary: '₹4,20,000 – ₹6,00,000 / year',
    deadlineDays: 28
  },
  // 39. Bosch - Software Developer (Coimbatore)
  {
    companyName: 'Bosch',
    title: '[Sample Listing] Software Developer – Embedded C & AUTOSAR',
    category: 'Software Engineering',
    role: 'Software Developer',
    description: 'Sample demonstration listing. Write modular embedded C firmware for automotive engine control units (ECUs), sensor interfaces, and power steering microcontrollers.',
    responsibilities: 'Develop embedded C firmware compliant with MISRA C guidelines.\nImplement AUTOSAR basic software (BSW) stacks.\nVerify code execution on target silicon using hardware debuggers.',
    requiredSkills: ['Embedded C', 'C', 'AUTOSAR', 'Microcontrollers', 'CAN Bus', 'Git'],
    qualifications: 'B.Tech/M.Tech in ECE/EEE/Mechatronics.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Coimbatore, Tamil Nadu',
    salary: '₹6,50,000 – ₹9,50,000 / year',
    deadlineDays: 35
  },
  // 40. Tata Electronics - Cloud Engineer
  {
    companyName: 'Tata Electronics',
    title: '[Sample Listing] Cloud Engineer – Smart Manufacturing Cloud',
    category: 'DevOps & Cloud',
    role: 'Cloud Engineer',
    description: 'Sample demonstration listing. Build hybrid cloud infrastructure connecting high-precision manufacturing cleanrooms in Hosur with central predictive quality data lakes.',
    responsibilities: 'Provision and configure AWS IoT Greengrass and hybrid gateways.\nImplement automated CI/CD for factory floor software updates.\nEnforce zero-trust network access across industrial OT and IT networks.',
    requiredSkills: ['AWS', 'Linux', 'Docker', 'Terraform', 'Python', 'Networking'],
    qualifications: 'B.Tech in CS/IT/ECE with cloud certification or training.',
    experienceLevel: 'Entry Level',
    jobType: 'Full-time',
    workplaceMode: 'Onsite',
    location: 'Hosur, Tamil Nadu',
    salary: '₹6,00,000 – ₹9,00,000 / year',
    deadlineDays: 40
  },
  // 41. Infosys - Software Developer Intern (Jaipur)
  {
    companyName: 'Infosys',
    title: '[Sample Listing] Software Developer Intern – Enterprise Web Applications',
    category: 'Software Engineering',
    role: 'Software Developer',
    description: 'Sample demonstration listing. 6-month hands-on internship in Jaipur working with senior mentors on full-stack web applications, REST services, and database schemas.',
    responsibilities: 'Develop UI features with HTML, CSS, JavaScript, and React.\nWrite backend controllers in Java/Python.\nParticipate in daily agile standups and sprint retrospectives.',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Java', 'SQL', 'Git'],
    qualifications: 'Currently enrolled in pre-final or final year B.Tech/B.E or MCA.',
    experienceLevel: 'Internship',
    jobType: 'Internship',
    workplaceMode: 'Onsite',
    location: 'Jaipur, Rajasthan',
    salary: '₹22,000 / month stipend',
    deadlineDays: 20
  },
  // 42. TCS - Data Analyst Intern (Ahmedabad)
  {
    companyName: 'TCS',
    title: '[Sample Listing] Data Analyst Intern – Business Intelligence & Insights',
    category: 'Data Science & AI',
    role: 'Data Analyst',
    description: 'Sample demonstration listing. Paid 6-month internship analyzing enterprise datasets, building SQL extraction scripts, and creating Power BI dashboards.',
    responsibilities: 'Extract and validate data using SQL from relational databases.\nCreate visualization charts and executive summaries in Power BI.\nCleanse data anomalies and handle null value imputations.',
    requiredSkills: ['SQL', 'Excel', 'Power BI', 'Python', 'Data Analysis'],
    qualifications: 'Pursuing degree in Computer Science, Statistics, Mathematics or Engineering.',
    experienceLevel: 'Internship',
    jobType: 'Internship',
    workplaceMode: 'Hybrid',
    location: 'Ahmedabad, Gujarat',
    salary: '₹20,000 / month stipend',
    deadlineDays: 25
  },
  // 43. Wipro - Frontend Developer Intern (Mysuru)
  {
    companyName: 'Wipro',
    title: '[Sample Listing] Frontend Developer Intern – Modern Web UI',
    category: 'Software Engineering',
    role: 'Frontend Developer',
    description: 'Sample demonstration listing. Join Wipro digital practice for an internship building responsive interfaces, user form validations, and API integrations with React and CSS.',
    responsibilities: 'Build responsive web pages based on Figma design mockups.\nConnect frontend components to RESTful mock APIs.\nEnsure cross-browser compatibility across Chrome, Firefox, and Safari.',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    qualifications: 'Pre-final or final year undergraduate student in engineering or CS.',
    experienceLevel: 'Internship',
    jobType: 'Internship',
    workplaceMode: 'Onsite',
    location: 'Mysuru, Karnataka',
    salary: '₹20,000 / month stipend',
    deadlineDays: 22
  },
  // 44. Cognizant - Full Stack Developer Intern (Kolkata)
  {
    companyName: 'Cognizant',
    title: '[Sample Listing] Full Stack Developer Intern – Cloud Web Apps',
    category: 'Software Engineering',
    role: 'Full Stack Developer',
    description: 'Sample demonstration listing. Hands-on internship developing web portals with Node.js, Express, MongoDB, and modern JavaScript frontends.',
    responsibilities: 'Implement CRUD API endpoints in Node.js and Express.\nDesign NoSQL schemas and write MongoDB aggregation pipelines.\nBuild clean, responsive UI screens using HTML, CSS, and modern JS.',
    requiredSkills: ['JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'HTML', 'CSS', 'Git'],
    qualifications: 'Pursuing B.Tech/B.E/BCA/MCA with interest in modern JavaScript stacks.',
    experienceLevel: 'Internship',
    jobType: 'Internship',
    workplaceMode: 'Hybrid',
    location: 'Kolkata, West Bengal',
    salary: '₹24,000 / month stipend',
    deadlineDays: 20
  },
  // 45. Zoho - Python Developer Intern (Chennai)
  {
    companyName: 'Zoho',
    title: '[Sample Listing] Python Developer Intern – Automation & Tooling',
    category: 'Software Engineering',
    role: 'Python Developer',
    description: 'Sample demonstration listing. Develop internal testing frameworks, log analysis scripts, and database migration helpers using Python at Zoho Chennai campus.',
    responsibilities: 'Write Python automation scripts for log processing and reporting.\nBuild mini web dashboards using Flask for internal developer telemetry.\nParticipate in code reviews with senior engineering mentors.',
    requiredSkills: ['Python', 'SQL', 'Flask', 'Linux', 'Git'],
    qualifications: 'Students in pre-final or final year of engineering/technology degrees.',
    experienceLevel: 'Internship',
    jobType: 'Internship',
    workplaceMode: 'Onsite',
    location: 'Chennai, Tamil Nadu',
    salary: '₹25,000 / month stipend',
    deadlineDays: 18
  },
  // 46. Freshworks - UI/UX Designer Intern (Chennai)
  {
    companyName: 'Freshworks',
    title: '[Sample Listing] UI/UX Designer Intern – Product Experience',
    category: 'UI/UX Design',
    role: 'UI/UX Designer',
    description: 'Sample demonstration listing. 6-month product design internship helping craft user flows, micro-interactions, and Figma components for Freshworks SaaS suite.',
    responsibilities: 'Create user journeys, wireframes, and interactive prototypes in Figma.\nShadow customer research sessions and synthesize usability notes.\nLearn and contribute to the Freshworks design system.',
    requiredSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'Design Systems'],
    qualifications: 'Students or recent graduates of Design, Fine Arts, HCI, or related disciplines.',
    experienceLevel: 'Internship',
    jobType: 'Internship',
    workplaceMode: 'Hybrid',
    location: 'Chennai, Tamil Nadu',
    salary: '₹28,000 / month stipend',
    deadlineDays: 25
  },
  // 47. Google - Cloud Engineer Intern (Hyderabad)
  {
    companyName: 'Google',
    title: '[Sample Listing] Cloud Engineer Intern – Google Cloud Platform',
    category: 'DevOps & Cloud',
    role: 'Cloud Engineer',
    description: 'Sample demonstration listing. Summer internship with Google Cloud engineering. Work on automation scripts, cloud telemetry, container deployments, and networking.',
    responsibilities: 'Write automation scripts in Python or Go for infrastructure health checks.\nConfigure CI/CD deployment pipelines using Google Cloud Build.\nDocument system architectures and present sprint findings to team leads.',
    requiredSkills: ['Python', 'Linux', 'Docker', 'Cloud Computing', 'Git'],
    qualifications: 'Currently enrolled in an undergraduate or graduate degree in engineering.',
    experienceLevel: 'Internship',
    jobType: 'Internship',
    workplaceMode: 'Hybrid',
    location: 'Hyderabad, Telangana',
    salary: '₹60,000 / month stipend',
    deadlineDays: 30
  },
  // 48. Microsoft - Cybersecurity Analyst Intern (Noida)
  {
    companyName: 'Microsoft',
    title: '[Sample Listing] Cybersecurity Analyst Intern – Threat Defense',
    category: 'Cybersecurity',
    role: 'Cybersecurity Analyst',
    description: 'Sample demonstration listing. Join Microsoft Threat Intelligence team in Noida to analyze security telemetry, research malware signatures, and build automated triage scripts.',
    responsibilities: 'Query security logs using Kusto Query Language (KQL).\nAnalyze network traces and investigate anomalous login patterns.\nAssist in developing automated alert containment scripts in Python.',
    requiredSkills: ['Cybersecurity', 'Python', 'Networking', 'KQL', 'Linux', 'Git'],
    qualifications: 'Pre-final or final year engineering student with cybersecurity passion.',
    experienceLevel: 'Internship',
    jobType: 'Internship',
    workplaceMode: 'Hybrid',
    location: 'Noida, Uttar Pradesh',
    salary: '₹50,000 / month stipend',
    deadlineDays: 28
  },
  // 49. IBM - AI/ML Engineer Intern (Kochi)
  {
    companyName: 'IBM',
    title: '[Sample Listing] AI/ML Engineer Intern – Generative AI & NLP',
    category: 'Data Science & AI',
    role: 'AI/ML Engineer',
    description: 'Sample demonstration listing. Work with IBM Kochi software lab on LLM prompt engineering, retrieval-augmented generation (RAG) pipelines, and Python evaluation scripts.',
    responsibilities: 'Build RAG demonstration pipelines using LangChain and Python.\nBenchmark prompt completions against standard evaluation datasets.\nDocument findings and present proof-of-concepts to senior researchers.',
    requiredSkills: ['Python', 'Machine Learning', 'NLP', 'LangChain', 'Git'],
    qualifications: 'Undergraduate or graduate engineering student in CS, Data Science, or AI.',
    experienceLevel: 'Internship',
    jobType: 'Internship',
    workplaceMode: 'Remote',
    location: 'Kochi, Kerala',
    salary: '₹30,000 / month stipend',
    deadlineDays: 24
  },
  // 50. Amazon - DevOps Engineer Intern (Remote)
  {
    companyName: 'Amazon',
    title: '[Sample Listing] DevOps Engineer Intern – AWS Operations',
    category: 'DevOps & Cloud',
    role: 'DevOps Engineer',
    description: 'Sample demonstration listing. Remote internship with Amazon AWS operations team building automated monitoring scripts, CI/CD pipelines, and cloud health dashboards.',
    responsibilities: 'Create automated deployment playbooks using AWS CloudFormation and Terraform.\nDevelop telemetry scripts in Python and Bash for serverless metrics.\nCollaborate across distributed team members via Agile standups.',
    requiredSkills: ['AWS', 'Linux', 'Python', 'Docker', 'Terraform', 'Git'],
    qualifications: 'Currently pursuing degree in Computer Science, IT, or Engineering.',
    experienceLevel: 'Internship',
    jobType: 'Internship',
    workplaceMode: 'Remote',
    location: 'Remote, India',
    salary: '₹45,000 / month stipend',
    deadlineDays: 26
  }
];

const seedJobs = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerconnect';
    console.log(`[SeedJobs] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[SeedJobs] Upserting employer accounts and company profiles...');
    const companyMap = {};

    // First load any already existing companies/employers (Google, Microsoft, Razorpay, etc.)
    const existingCompanies = await Company.find({});
    for (const c of existingCompanies) {
      companyMap[c.companyName.toLowerCase()] = {
        companyId: c._id,
        employerId: c.employerId,
        companyName: c.companyName
      };
    }

    // Now upsert all employers from EMPLOYER_LIST
    for (const emp of EMPLOYER_LIST) {
      const key = emp.companyName.toLowerCase();
      if (!companyMap[key]) {
        let user = await User.findOne({ email: emp.email });
        if (!user) {
          user = await User.create({
            name: emp.name,
            email: emp.email,
            password: 'employer123',
            role: 'employer',
            isActive: true
          });
        }

        let company = await Company.findOne({ employerId: user._id });
        if (!company) {
          company = await Company.create({
            employerId: user._id,
            companyName: emp.companyName,
            description: emp.description,
            website: emp.website,
            location: emp.location,
            industry: emp.industry,
            logoUrl: ''
          });
        }

        companyMap[key] = {
          companyId: company._id,
          employerId: user._id,
          companyName: company.companyName
        };
      }
    }

    // Fallback employer if any company key is missing
    const fallback = Object.values(companyMap)[0];

    // Clean up previously seeded demo/sample jobs so we can re-seed cleanly without duplicates
    const deleteResult = await Job.deleteMany({
      $or: [
        { title: { $regex: '^\\[Sample Listing\\]' } },
        { title: { $regex: '^\\[DEMO\\]' } }
      ]
    });
    console.log(`[SeedJobs] Cleaned up ${deleteResult.deletedCount} previous sample jobs to prevent duplicates.`);

    // Build docs to insert
    const docs = RAW_JOBS.map((j) => {
      const cInfo = companyMap[j.companyName.toLowerCase()] || fallback;
      return {
        employerId: cInfo.employerId,
        companyId: cInfo.companyId,
        companyName: cInfo.companyName,
        title: j.title,
        category: j.category,
        description: j.description,
        responsibilities: j.responsibilities,
        requiredSkills: j.requiredSkills,
        qualifications: j.qualifications,
        experienceLevel: j.experienceLevel,
        jobType: j.jobType,
        workplaceMode: j.workplaceMode,
        location: j.location,
        salary: j.salary,
        deadline: daysFromNow(j.deadlineDays),
        status: 'Active'
      };
    });

    console.log(`[SeedJobs] Inserting ${docs.length} diverse job listings...`);
    const inserted = await Job.insertMany(docs);
    console.log(`[SeedJobs] Successfully inserted ${inserted.length} unique jobs!`);

    const totalActive = await Job.countDocuments({ status: 'Active' });
    console.log(`[SeedJobs] Total Active jobs currently in database: ${totalActive}`);

    // Verification summary of locations & companies
    const distinctCompanies = await Job.distinct('companyName');
    const distinctLocations = await Job.distinct('location');
    console.log(`[SeedJobs] Distinct companies in DB: ${distinctCompanies.length}`);
    console.log(`[SeedJobs] Distinct locations in DB: ${distinctLocations.length}`);

    console.log('\n======================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('[SeedJobs Error]:', err);
    process.exit(1);
  }
};

seedJobs();
