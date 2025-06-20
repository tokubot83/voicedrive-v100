// イベント管理のデモデータ
export interface DemoEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  organizer: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  type: 'training' | 'social' | 'meeting' | 'emergency';
  department?: string;
  facility_id?: string;
}

export const demoEvents: DemoEvent[] = [
  {
    id: 'event-1',
    title: '医療安全研修会',
    description: '年次医療安全研修を実施します。全職員対象です。',
    date: new Date('2025-07-15'),
    time: '14:00-16:00',
    location: '会議室A',
    organizer: '医療安全委員会',
    maxParticipants: 30,
    currentParticipants: 12,
    status: 'scheduled',
    type: 'training',
    department: '全部署',
    facility_id: 'tategami_hospital'
  },
  {
    id: 'event-2',
    title: '夏祭りイベント',
    description: '職員とご家族向けの夏祭りを開催します。',
    date: new Date('2025-07-20'),
    time: '17:00-20:00',
    location: '病院中庭',
    organizer: '職員会',
    maxParticipants: 100,
    currentParticipants: 45,
    status: 'scheduled',
    type: 'social',
    facility_id: 'tategami_hospital'
  },
  {
    id: 'event-3',
    title: '新人オリエンテーション',
    description: '7月入職者向けのオリエンテーションです。',
    date: new Date('2025-07-01'),
    time: '09:00-12:00',
    location: '会議室B',
    organizer: '人事部',
    maxParticipants: 5,
    currentParticipants: 3,
    status: 'scheduled',
    type: 'training',
    facility_id: 'tategami_hospital'
  }
];

export default demoEvents;