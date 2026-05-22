"use client";

/**
 * CustomSidebar - Sidebar personalizado con colores correctos
 * Reemplazo temporal del UnifiedSidebar para obtener el diseño correcto
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartPie, ShoppingBag, BadgeDollarSign, ChartBarDecreasing, Gauge, 
  FolderDot, Folder, WalletMinimal, Brain, 
  StickyNote, Mail, SquareCheck, Calendar, 
  Cookie, User, Settings, ChevronDown, Monitor, 
  TrendingUp
} from 'lucide-react';

export default function CustomSidebar() {
  const pathname = usePathname();
  const [ecommerceOpen, setEcommerceOpen] = React.useState(false);
  
  const sidebarStyle = {
    backgroundColor: 'hsl(220, 30%, 96%)',
    width: '256px',
    height: '100vh',
    position: 'fixed' as const,
    left: 0,
    top: 0,
    borderRight: '1px solid hsl(220, 20%, 90%)',
    display: 'flex',
    flexDirection: 'column' as const,
    zIndex: 40
  };

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    color: '#334155', // slate-700
    textDecoration: 'none',
    borderRadius: '6px',
    margin: '2px 8px',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  };

  const menuItemHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    color: '#0f172a' // slate-900
  };

  const sectionTitleStyle = {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#64748b', // slate-500
    padding: '16px 16px 8px 16px',
    margin: '8px 0 0 0'
  };

  return (
    <div style={sidebarStyle}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid hsl(220, 20%, 90%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#1e293b',
            color: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            VT
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>VibeThink</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Dashboard</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' as const, padding: '8px 0' }}>
        {/* Dashboards Section */}
        <div style={sectionTitleStyle}>Dashboards</div>
        <div>
          <Link href="/" style={menuItemStyle}>
            <ChartPie size={16} />
            <span>Default</span>
          </Link>
          
          <div>
            <button 
              onClick={() => setEcommerceOpen(!ecommerceOpen)}
              style={{
                ...menuItemStyle,
                width: '100%',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={16} />
                <span>E-commerce</span>
              </div>
              <ChevronDown size={16} style={{ 
                transform: ecommerceOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} />
            </button>
            {ecommerceOpen && (
              <div style={{ paddingLeft: '24px' }}>
                <Link href="/ecommerce-dashboard" style={{...menuItemStyle, fontSize: '13px'}}>
                  <ChartBarDecreasing size={14} />
                  <span>Dashboard</span>
                </Link>
              </div>
            )}
          </div>

          <Link href="/sales-dashboard" style={menuItemStyle}>
            <BadgeDollarSign size={16} />
            <span>Sales</span>
          </Link>
          
          <Link href="/crm-dashboard" style={menuItemStyle}>
            <ChartBarDecreasing size={16} />
            <span>CRM</span>
          </Link>
          
          <Link href="/finance-dashboard" style={menuItemStyle}>
            <TrendingUp size={16} />
            <span>Finance</span>
          </Link>

          <Link href="/website-analytics" style={menuItemStyle}>
            <Gauge size={16} />
            <span>Website Analytics</span>
          </Link>

          <Link href="/project-management" style={menuItemStyle}>
            <FolderDot size={16} />
            <span>Project Management</span>
          </Link>

          <Link href="/file-manager" style={menuItemStyle}>
            <Folder size={16} />
            <span>File Manager</span>
          </Link>

          <Link href="/crypto-dashboard" style={menuItemStyle}>
            <WalletMinimal size={16} />
            <span>Crypto</span>
          </Link>

          <Link href="/pos-system" style={menuItemStyle}>
            <Cookie size={16} />
            <span>POS System</span>
          </Link>
        </div>

        {/* AI Section */}
        <div style={sectionTitleStyle}>AI</div>
        <div>
          <Link href="/ai-chat" style={menuItemStyle}>
            <Brain size={16} />
            <span>AI Chat</span>
          </Link>
        </div>

        {/* Apps Section */}
        <div style={sectionTitleStyle}>Apps</div>
        <div>
          <Link href="/kanban" style={menuItemStyle}>
            <SquareCheck size={16} />
            <span>Kanban</span>
          </Link>
          
          <Link href="/notes" style={menuItemStyle}>
            <StickyNote size={16} />
            <span>Notes</span>
          </Link>

          <Link href="/mail" style={menuItemStyle}>
            <Mail size={16} />
            <span>Mail</span>
          </Link>

          <Link href="/tasks" style={menuItemStyle}>
            <SquareCheck size={16} />
            <span>Tasks</span>
          </Link>

          <Link href="/calendar" style={menuItemStyle}>
            <Calendar size={16} />
            <span>Calendar</span>
          </Link>
        </div>

        {/* Development Section */}
        <div style={sectionTitleStyle}>Development</div>
        <div>
          <Link href="/premium" style={menuItemStyle}>
            <ChartPie size={16} />
            <span>Premium</span>
          </Link>

          <Link href="/debug" style={menuItemStyle}>
            <Settings size={16} />
            <span>Debug</span>
          </Link>

          <Link href="/test-charts" style={menuItemStyle}>
            <ChartPie size={16} />
            <span>Test Charts</span>
          </Link>

          <Link href="/test" style={menuItemStyle}>
            <Monitor size={16} />
            <span>Test</span>
          </Link>

          <Link href="/mobile-test" style={menuItemStyle}>
            <Monitor size={16} />
            <span>Mobile Test</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid hsl(220, 20%, 90%)' }}>
        <div style={menuItemStyle}>
          <User size={16} />
          <span>VibeThink User</span>
        </div>
      </div>
    </div>
  );
}
