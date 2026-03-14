// StoragePaywall.jsx
// Shows modal when storage limit reached
// Personal: after 3 months · Teams: after 6 months
// Two options: Upgrade or Delete and restart

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const StoragePaywall = () => {
  const [status, setStatus]   = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { theme }             = useTheme()
  const navigate              = useNavigate()

  useEffect(() => {
    const check = async () => {
      try {
        const res  = await fetch('/storage/status', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cos_token')}`
          }
        })
        const data = await res.json()
        setStatus(data)
      } catch (e) {}
    }
    check()
    // Check daily
    const interval = setInterval(check, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleDelete = async () => {
    if (!window.confirm(
      'This will permanently delete ALL your memories. Are you sure?'
    )) return
    setDeleting(true)
    await fetch('/storage/clear', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('cos_token')}`
      }
    })
    setDeleting(false)
    setStatus(null)
    window.location.reload()
  }

  // Show warning banner when approaching limit
  if (status?.approaching && !status?.limit_reached) {
    return (
      <div style={{
        position: 'fixed', top: '70px', left: '50%',
        transform: 'translateX(-50%)',
        background: '#1a1500',
        border: '1px solid #f59e0b',
        borderRadius: '10px', padding: '12px 24px',
        zIndex: 9000, display: 'flex',
        alignItems: 'center', gap: '16px'
      }}>
        <span style={{ color:'#f59e0b', fontSize:'13px' }}>
          ⚠️ {status.message}
        </span>
        <button onClick={() => navigate('/pricing')} style={{
          background:'#f59e0b', color:'#000',
          border:'none', borderRadius:'6px',
          padding:'6px 14px', cursor:'pointer',
          fontSize:'12px', fontWeight:600
        }}>Upgrade</button>
      </div>
    )
  }

  // Full modal when limit reached
  if (!status?.limit_reached) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 10000, display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: '16px', padding: '48px',
        maxWidth: '480px', width: '90%',
        textAlign: 'center'
      }}>
        {/* Icon */}
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>🗃️</div>

        {/* Title */}
        <h2 style={{ fontSize:'24px', fontWeight:700,
                     color:theme.text, marginBottom:'12px' }}>
          Storage Limit Reached
        </h2>

        {/* Message */}
        <p style={{ fontSize:'14px', color:theme.textMuted,
                    marginBottom:'8px', lineHeight:1.6 }}>
          You have <strong style={{ color:theme.text }}>
            {status.days_used} days
          </strong> of cognitive memories stored
          ({status.total_memories} total memories).
        </p>
        <p style={{ fontSize:'14px', color:theme.textMuted,
                    marginBottom:'32px', lineHeight:1.6 }}>
          Your <strong style={{ color:theme.text }}>
            {status.plan}
          </strong> plan includes{' '}
          <strong style={{ color:theme.text }}>
            {status.limit_days} days
          </strong> of memory storage.
          Upgrade to continue or delete and start fresh.
        </p>

        {/* Storage bar */}
        <div style={{
          background: theme.bgInput, borderRadius:'8px',
          height:'8px', marginBottom:'32px', overflow:'hidden'
        }}>
          <div style={{
            width:`${Math.min(status.pct_used, 100)}%`,
            height:'100%', background:'#ef4444',
            borderRadius:'8px', transition:'0.5s'
          }}/>
        </div>

        {/* Options */}
        <div style={{ display:'flex',
                      flexDirection:'column', gap:'12px' }}>

          {/* Upgrade */}
          <button onClick={() => navigate('/pricing')} style={{
            padding:'14px', background:'#6366f1',
            color:'#fff', border:'none', borderRadius:'10px',
            cursor:'pointer', fontSize:'15px', fontWeight:600
          }}>
            🚀 Upgrade Plan — Keep All Memories
          </button>

          {/* Plan comparison hint */}
          <div style={{ fontSize:'12px', color:theme.textMuted }}>
            {status.plan === 'personal'
              ? 'Teams plan → 6 months · WorkSense → unlimited'
              : 'WorkSense plan → unlimited memory forever'}
          </div>

          {/* Delete */}
          <button onClick={handleDelete}
            disabled={deleting} style={{
            padding:'12px', background:'transparent',
            color:'#ef4444', border:'1px solid #ef4444',
            borderRadius:'10px', cursor:'pointer',
            fontSize:'14px', opacity: deleting ? 0.5 : 1
          }}>
            {deleting
              ? 'Deleting...'
              : '🗑️ Delete All Data — Start Fresh (Free)'}
          </button>

          <p style={{ fontSize:'11px', color:theme.textMuted }}>
            Deletion is permanent and cannot be undone
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoragePaywall
