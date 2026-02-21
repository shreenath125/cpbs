
import { CategoryRule } from '../types';

/**
 * Configuration for Bhajan Categories.
 * - specificIds: Matches the exact 'songNumber' visible in the app.
 * - keywords: Matches if the song title or content contains any of these words (Hindi).
 */
export const CATEGORY_RULES: CategoryRule[] = [
  {
    id: 'morning',
    label: 'Morning Nitya Kriya',
    // Fixed '3' to '03' to match data format
    specificIds: ['355', '242', '366','01','02', '03',
     '301', '302', '303', '304', '72',
     '353', '354', '371', '28', '235', '236', '237', '234', '240']
  },
  {
    id: 'evening',
    label: 'Evening Nitya Kriya',
    specificIds: ['361','362','367','01', '04', '05', '270', '306','315', '307', '232','310']
  },
  {
    id: 'holi',
    label: 'Holi / Phag',
    specificIds: [
      '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', 
      '187', '188', '190', '274', '289'
    ],
  },
  {
    id: 'badhai',
    label: 'Janmotsav / Badhai',
    specificIds: [
      '192', '193', '198', '205', '213', '206', '207', '210', '195', '204', '203', 
      '206', '212', '200', '201', '202', '209', '211', '194', '438', '288'
    ],
  },
  {
    id: 'jhula',
    label: 'Jhulan / Sawan',
    specificIds: [
      '267','208', '215', '216', '217', '218', '219', '220', '221', '222', '223', '224', 
      '225', '226', '227', '228', '229', '271'
    ],
  },
  {
    id: 'aarti',
    label: 'Aartis',
    specificIds: [
      '355', '356', '357', '358', '359', '360', '361', '362', '363', '364', 
      '365', '366', '367'
    ],
    keywords: ['आरती']
  },
  {
    id: 'ashtak',
    label: 'Ashtakas & Stotras',
    specificIds: [
     '272', '273', '301', '302', '303', '304', '305', '306', '307', '308', '309', '315'
    ],
    keywords: ['अष्टक']
  }
];
