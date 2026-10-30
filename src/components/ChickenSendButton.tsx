import React from 'react';

export type SendStatus = 'idle' | 'loading' | 'sent';

interface ChickenSendButtonProps {
  status: SendStatus;
  total: number;
  onClick: () => void;
}

/**
 * The "send order" button, drawn as a cartoon chicken (original artwork).
 * - idle:    gently bobs and blinks; pecks and flaps its wing on hover
 * - loading: runs in place with speed lines
 * - sent:    flutters off to the side
 * The label sits on the chicken's belly.
 */
export const ChickenSendButton: React.FC<ChickenSendButtonProps> = ({ status, total, onClick }) => {
  const label = status === 'loading' ? 'جاري الإرسال...' : status === 'sent' ? 'تم الإرسال!' : 'أرسل الطلب';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status !== 'idle'}
      aria-label={`إرسال الطلب على واتساب - الإجمالي ${total} جنيه`}
      className={`chicken-btn ${status === 'loading' ? 'is-loading' : ''} ${status === 'sent' ? 'is-sent' : ''}`}
    >
      <svg viewBox="0 0 260 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="ckBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFBEF" />
            <stop offset="1" stopColor="#F6E0A8" />
          </linearGradient>
        </defs>

        <ellipse cx="132" cy="184" rx="74" ry="6" fill="#000" opacity=".4" />

        <g className="ck-fly">
          <g className="ck-all">
            {/* tail feathers */}
            <g className="ck-tail">
              <path d="M196 92 C222 62 246 66 244 94 C242 112 222 118 200 112Z" fill="#8C5A1E" />
              <path d="M198 86 C220 48 252 46 250 82 C248 104 226 108 202 104Z" fill="#C98A2E" />
              <path d="M196 100 C226 78 248 92 238 116 C230 128 210 126 196 118Z" fill="#E3B75B" />
            </g>

            {/* legs */}
            <g fill="none" stroke="#F5A623" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path className="ck-leg-a" d="M112 150 L112 174 M112 174 L96 181 M112 174 L112 182 M112 174 L128 181" />
              <path className="ck-leg-b" d="M148 150 L148 174 M148 174 L132 181 M148 174 L148 182 M148 174 L164 181" />
            </g>

            {/* body */}
            <ellipse cx="136" cy="104" rx="84" ry="60" fill="url(#ckBody)" stroke="#D9B36A" strokeWidth="2" />
            <path
              d="M176 146 q8 8 16 0 M196 134 q8 8 16 0 M104 150 q8 6 14 0"
              fill="none"
              stroke="#D9B36A"
              strokeWidth="2"
              strokeLinecap="round"
              opacity=".55"
            />

            {/* wing */}
            <path
              className="ck-wing"
              d="M168 98 C190 88 214 100 214 120 C208 140 184 146 166 132 C158 122 160 106 168 98Z"
              fill="#F6E3B4"
              stroke="#D9B36A"
              strokeWidth="2"
            />

            {/* head */}
            <g className="ck-head">
              <circle cx="76" cy="68" r="34" fill="url(#ckBody)" stroke="#D9B36A" strokeWidth="2" />
              <path
                d="M58 40 C54 22 66 18 70 30 C72 16 86 16 86 30 C92 22 102 30 94 42Z"
                fill="#D7263D"
                stroke="#A81B2E"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M44 62 L18 70 L44 80Z"
                fill="#F5A623"
                stroke="#C97F0A"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M50 84 C42 100 58 108 64 94 C62 90 56 88 50 84Z" fill="#D7263D" />
              <circle cx="64" cy="78" r="6" fill="#F28B82" opacity=".45" />
              <g className="ck-eye">
                <circle cx="62" cy="62" r="5" fill="#1b0f0a" />
                <circle cx="63.6" cy="60.4" r="1.7" fill="#fff" />
              </g>
            </g>

            {/* speed lines, only visible while loading */}
            <path
              className="ck-speed"
              d="M232 80 h18 M236 100 h22 M232 120 h18"
              stroke="#E3B75B"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </g>
      </svg>

      <span className="chicken-label">
        <span className="chicken-label-main">{label}</span>
        {status === 'idle' && <span className="chicken-label-price">{total} ج</span>}
      </span>
    </button>
  );
};
