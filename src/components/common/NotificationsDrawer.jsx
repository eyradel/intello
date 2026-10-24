import React from 'react';
import { Bell, X, AlertTriangle, AlertCircle, Info, ShieldAlert, Check } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 'notif-01',
    severity: 'CRITICAL',
    title: 'CRITICAL NARRATIVE DETECTED',
    message: 'Transport fare surcharge discussions accelerating along Accra-Kumasi arterial corridor (+47% velocity).',
    timestamp: '3 mins ago',
    region: 'Greater Accra / Eastern',
    read: false
  },
  {
    id: 'notif-02',
    severity: 'CRITICAL',
    title: 'COORDINATION WATCH TRIGGERED',
    message: 'Syndicated copypasta pattern identified across 48 accounts propagating artificial fuel panic.',
    timestamp: '14 mins ago',
    region: 'Multi-Region',
    read: false
  },
  {
    id: 'notif-03',
    severity: 'WARNING',
    title: 'REGIONAL ANOMALY: TAMALE WATER INTAKE',
    message: 'Spike in citizen call-ins regarding residential tap dry spells; subsidized tanker delivery active.',
    timestamp: '38 mins ago',
    region: 'Northern Region',
    read: false
  },
  {
    id: 'notif-04',
    severity: 'WARNING',
    title: 'FOOD STAPLE PRICE DRIFT',
    message: 'Upper East millet spot rates moved +18% following border logistics transit delays.',
    timestamp: '1 hr ago',
    region: 'Upper East',
    read: true
  },
  {
    id: 'notif-05',
    severity: 'INFO',
    title: 'HIGH CONFIDENCE MODEL RE-CALIBRATION',
    message: 'NLP code-switching model v3.4 synced; Ghanaian Pidgin nuance confidence increased to 93.8%.',
    timestamp: '2 hrs ago',
    region: 'National Pipeline',
    read: true
  }
];

export default function NotificationsDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="notif-drawer-backdrop" onClick={onClose}>
      <div className="notif-drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="notif-drawer-header">
          <div className="notif-title-wrap">
            <Bell size={16} className="text-cyan animate-pulse" />
            <h3>INTELLIGENCE ALERTS & NOTIFICATIONS</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="notif-list">
          {NOTIFICATIONS.map(n => {
            const isCrit = n.severity === 'CRITICAL';
            const isWarn = n.severity === 'WARNING';

            return (
              <div key={n.id} className={`notif-card ${n.severity.toLowerCase()} ${n.read ? 'read' : 'unread'}`}>
                <div className="notif-card-top">
                  <span className={`notif-sev-badge ${n.severity.toLowerCase()}`}>
                    {isCrit ? <AlertCircle size={12} /> : isWarn ? <AlertTriangle size={12} /> : <Info size={12} />}
                    {n.severity}
                  </span>
                  <span className="notif-time">{n.timestamp}</span>
                </div>

                <div className="notif-card-title">{n.title}</div>
                <div className="notif-card-msg">{n.message}</div>

                <div className="notif-card-footer">
                  <span className="notif-reg">{n.region}</span>
                  {!n.read && <span className="unread-dot">NEW</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="notif-drawer-footer">
          <button className="mark-read-btn"><Check size={14} /> MARK ALL REVIEWED</button>
        </div>
      </div>
    </div>
  );
}
