// Spacing/size knobs. Units: pt for font, mm for gaps and margins.
export const DEFAULT_STYLE = {
  fontSize: 9.5,
  lineHeight: 1.4,
  sectionGap: 6,
  entryGap: 3.2,
  marginX: 16,
  marginY: 15,
  indent: 4.5,
  photoSize: 30,
  photoShape: 'circle',
};

// Fictional sample CV, used on first load and by "Reset".
// Descriptions are legacy plain text; App normalises them to HTML on load.
export const SAMPLE = {
  template: 'clean',
  accent: '#1f5f6b',
  style: DEFAULT_STYLE,
  personal: {
    photo: '',
    name: 'Jordan Avery',
    title: 'Senior Product Designer',
    email: 'jordan.avery@example.com',
    phone: '+1 555 0142',
    location: 'Portland, OR',
    website: 'jordanavery.example',
    summary:
      'Product designer with 9 years of experience turning messy workflows into calm, usable tools. I work closely with engineering, run lightweight research, and care about accessibility and design systems that teams actually adopt.',
  },
  sections: [
    {
      id: 'exp',
      title: 'Experience',
      side: false,
      entries: [
        {
          id: 'e1',
          title: 'Senior Product Designer',
          subtitle: 'Northwind Logistics',
          date: '2021 – Present',
          location: 'Remote',
          description:
            '- Led redesign of the dispatch console used by 1,200 operators; cut average task time by 31%.\n- Built and maintained a 140-component design system shared by four product teams.\n- Ran monthly usability sessions and turned findings into a prioritised roadmap.\n- Mentored three junior designers through their first shipped features.',
        },
        {
          id: 'e2',
          title: 'Product Designer',
          subtitle: 'Brightleaf Health',
          date: '2018 – 2021',
          location: 'Seattle, WA',
          description:
            '- Designed the patient intake flow for 40 clinics, raising completion rates from 62% to 88%.\n- Partnered with engineering to ship a WCAG 2.1 AA audit and remediation plan.\n- Introduced design critiques and a shared research repository.',
        },
        {
          id: 'e3',
          title: 'UX Designer',
          subtitle: 'Copperline Studio',
          date: '2015 – 2018',
          location: 'Portland, OR',
          description:
            '- Delivered web and mobile projects for 20+ clients in retail, education and non-profit sectors.\n- Prototyped interactions in code to speed up handoff and reduce rework.',
        },
        {
          id: 'e4',
          title: 'Design Intern',
          subtitle: 'Fieldnote Labs',
          date: '2014 – 2015',
          location: 'Portland, OR',
          description: 'Supported the design team with wireframes, icon sets and usability test logistics.',
        },
      ],
    },
    {
      id: 'edu',
      title: 'Education',
      side: false,
      entries: [
        {
          id: 'd1',
          title: 'BFA, Interaction Design',
          subtitle: 'Pacific Northwest College of Art',
          date: '2011 – 2015',
          location: 'Portland, OR',
          description: 'Graduated with honours. Thesis on wayfinding in public transit apps.',
        },
      ],
    },
    {
      id: 'proj',
      title: 'Projects',
      side: false,
      entries: [
        {
          id: 'p1',
          title: 'Open Transit Kit',
          subtitle: 'Open-source UI kit',
          date: '2022',
          location: '',
          description: '- Accessible timetable and map components used by 3 regional transit agencies.\n- 900+ GitHub stars.',
        },
        {
          id: 'p2',
          title: 'Plain Forms',
          subtitle: 'Talk & workshop',
          date: '2020',
          location: '',
          description: 'Workshop on writing clear form labels and error messages, given at 5 meetups.',
        },
      ],
    },
    {
      id: 'skills',
      title: 'Skills',
      side: true,
      entries: [
        { id: 's1', title: 'Product design', subtitle: 'Figma, prototyping, design systems', date: '', location: '', description: '' },
        { id: 's2', title: 'Research', subtitle: 'Interviews, usability testing, surveys', date: '', location: '', description: '' },
        { id: 's3', title: 'Front-end', subtitle: 'HTML, CSS, React basics', date: '', location: '', description: '' },
        { id: 's4', title: 'Accessibility', subtitle: 'WCAG 2.1, screen reader testing', date: '', location: '', description: '' },
      ],
    },
    {
      id: 'lang',
      title: 'Languages',
      side: true,
      entries: [
        { id: 'l1', title: 'English', subtitle: 'Native', date: '', location: '', description: '' },
        { id: 'l2', title: 'Spanish', subtitle: 'Professional', date: '', location: '', description: '' },
      ],
    },
  ],
};
