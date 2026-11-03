// AI-generated headshot (not a real person). Inlined as a data URL so a saved sample never
// points at a hashed asset that a later deploy removes.
import samplePhoto from './sample-photo.jpg?inline';

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

// Sample spacing tuned per template so the sample fills exactly one A4 page in each.
// Found by shrinking margins/line height (font kept >= 9pt) until it fit, then widening gaps until full.
const tuned = (o) => ({ ...DEFAULT_STYLE, ...o });
export const SAMPLE_STYLES = {
  clean: tuned({ fontSize: 9, lineHeight: 1.3, sectionGap: 3.5, entryGap: 2.25, marginX: 12, marginY: 10, photoSize: 26 }),
  minimal: tuned({ fontSize: 9.5, lineHeight: 1.4, sectionGap: 3.5, entryGap: 2, marginX: 16, marginY: 10, photoSize: 30 }),
  sidebar: tuned({ fontSize: 10.25, lineHeight: 1.45, sectionGap: 4.5, entryGap: 2.25, marginX: 16, marginY: 14, photoSize: 30 }),
  banner: tuned({ fontSize: 9.5, lineHeight: 1.3, sectionGap: 3.5, entryGap: 2, marginX: 12, marginY: 10, photoSize: 30 }),
  duo: tuned({ fontSize: 10, lineHeight: 1.45, sectionGap: 3.5, entryGap: 2.25, marginX: 16, marginY: 14, photoSize: 30 }),
};

const blank = { date: '', location: '', description: '' };

// Fictional person with an AI-generated photo, used on first load and by "Reset".
// Descriptions are legacy plain text; App normalises them to HTML on load.
export const SAMPLE = {
  isSample: true,
  template: 'clean',
  accent: '#1f5f6b',
  style: SAMPLE_STYLES.clean,
  personal: {
    photo: samplePhoto,
    name: 'Sara Lindholm',
    title: 'Senior Data Scientist',
    email: 'sara.lindholm@example.com',
    phone: '+46 70 123 45 67',
    location: 'Stockholm, Sweden',
    website: '',
    links: [
      { id: 'k1', label: 'LinkedIn', url: 'https://www.linkedin.com/in/sara-lindholm-example' },
      { id: 'k2', label: 'GitHub', url: 'https://github.com/sara-lindholm-example' },
    ],
    extra: 'Open to hybrid roles in Stockholm and Uppsala',
    summary:
      'Data scientist with 8 years of experience turning messy operational data into forecasting and decision tools that teams use every day. Comfortable from SQL and pipelines to models in production, and happiest working closely with product and business owners.',
  },
  sections: [
    {
      id: 'exp',
      title: 'Experience',
      side: false,
      entries: [
        {
          id: 'e1',
          title: 'Senior Data Scientist',
          subtitle: 'Nordvik Energy',
          date: '2021 – Present',
          location: 'Stockholm',
          description:
            '- Built a demand-forecasting service for 1.4 million households; cut forecast error by 23%.\n- Designed the feature store and Airflow pipelines now shared by three analytics teams.\n- Led A/B testing of a dynamic pricing pilot that lifted off-peak usage by 11%.\n- Mentor four junior data scientists and run the monthly ML reading group.',
        },
        {
          id: 'e2',
          title: 'Data Scientist',
          subtitle: 'Klarvik Retail Group',
          date: '2018 – 2021',
          location: 'Gothenburg',
          description:
            '- Developed churn and customer-lifetime-value models used in every quarterly campaign.\n- Automated weekly reporting with dbt and Power BI, freeing about 15 analyst hours a week.\n- Introduced model monitoring that caught two silent data drifts before they reached production.',
        },
        {
          id: 'e3',
          title: 'Data Analyst',
          subtitle: 'Svea Logistics',
          date: '2016 – 2018',
          location: 'Gothenburg',
          description:
            '- Optimised delivery routes for 120 vans with a mixed-integer model, saving 8% in fuel.\n- Built the first company-wide KPI dashboard and trained 30 colleagues to use it.',
        },
      ],
    },
    {
      id: 'edu',
      title: 'Education',
      side: true,
      entries: [
        {
          id: 'd1',
          title: 'M.Sc. Statistics and Machine Learning',
          subtitle: 'Linköping University',
          date: '2014 – 2016',
          location: 'Linköping',
          description: 'Thesis: probabilistic forecasting of electricity demand with gradient boosting.',
        },
        {
          id: 'd2',
          title: 'B.Sc. Mathematics',
          subtitle: 'Uppsala University',
          date: '2011 – 2014',
          location: 'Uppsala',
          description: '',
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
          title: 'Open Grid Forecasts',
          subtitle: 'Open-source Python library',
          date: '2023',
          location: '',
          description: '- Probabilistic load forecasting toolkit with 1,200+ stars on GitHub.\n- Used by two Nordic utilities and in a university course.',
        },
      ],
    },
    {
      id: 'cert',
      title: 'Certifications',
      side: true,
      inline: true,
      entries: [
        { id: 'c1', title: 'Azure Data Scientist Associate', subtitle: '', ...blank },
        { id: 'c2', title: 'Databricks ML Professional', subtitle: '', ...blank },
      ],
    },
    {
      id: 'skills',
      title: 'Skills',
      side: true,
      inline: true,
      entries: ['Python', 'SQL', 'PySpark', 'scikit-learn', 'PyTorch', 'Airflow', 'dbt', 'Docker', 'Azure', 'Power BI', 'A/B testing', 'Forecasting'].map(
        (title, i) => ({ id: `s${i}`, title, subtitle: '', ...blank }),
      ),
    },
    {
      id: 'lang',
      title: 'Languages',
      side: true,
      inline: true,
      entries: [
        { id: 'l1', title: 'Swedish', subtitle: 'Native', ...blank },
        { id: 'l2', title: 'English', subtitle: 'Fluent', ...blank },
        { id: 'l3', title: 'Spanish', subtitle: 'Conversational', ...blank },
      ],
    },
  ],
};
