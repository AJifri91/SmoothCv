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
  pageNumbers: false,
};

// Fictional sample CV, used on first load and by "Reset". Sized to fit one A4 page in every template.
// Descriptions are legacy plain text; App normalises them to HTML on load.
export const SAMPLE = {
  isSample: true,
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
    website: '',
    links: [
      { id: 'k1', label: 'LinkedIn', url: 'https://www.linkedin.com/in/jordan-avery-example' },
      { id: 'k2', label: 'GitHub', url: 'https://github.com/jordan-avery-example' },
    ],
    extra: '',
    summary:
      'Product designer with 9 years of experience turning messy workflows into calm, usable tools. I work closely with engineering and care about accessibility and design systems teams actually adopt.',
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
            '- Led redesign of the dispatch console used by 1,200 operators; cut task time by 31%.\n- Built a 140-component design system shared by four product teams.\n- Mentored three junior designers through their first shipped features.',
        },
        {
          id: 'e2',
          title: 'Product Designer',
          subtitle: 'Brightleaf Health',
          date: '2018 – 2021',
          location: 'Seattle, WA',
          description:
            '- Designed the patient intake flow for 40 clinics, raising completion from 62% to 88%.\n- Partnered with engineering on a WCAG 2.1 AA audit and fixes.',
        },
        {
          id: 'e3',
          title: 'UX Designer',
          subtitle: 'Copperline Studio',
          date: '2015 – 2018',
          location: 'Portland, OR',
          description: 'Web and mobile projects for 20+ clients in retail, education and non-profit sectors.',
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
          description: '',
        },
      ],
    },
    {
      id: 'skills',
      title: 'Skills',
      side: true,
      inline: true,
      entries: [
        { id: 's1', title: 'Figma', subtitle: '', date: '', location: '', description: '' },
        { id: 's2', title: 'Prototyping', subtitle: '', date: '', location: '', description: '' },
        { id: 's3', title: 'Design systems', subtitle: '', date: '', location: '', description: '' },
        { id: 's4', title: 'User research', subtitle: '', date: '', location: '', description: '' },
        { id: 's5', title: 'Accessibility', subtitle: '', date: '', location: '', description: '' },
        { id: 's6', title: 'HTML & CSS', subtitle: '', date: '', location: '', description: '' },
      ],
    },
    {
      id: 'lang',
      title: 'Languages',
      side: true,
      inline: true,
      entries: [
        { id: 'l1', title: 'English', subtitle: 'Native', date: '', location: '', description: '' },
        { id: 'l2', title: 'Spanish', subtitle: 'Professional', date: '', location: '', description: '' },
      ],
    },
  ],
};
