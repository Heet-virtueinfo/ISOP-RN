const getWelcomeTemplate = () => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ISoP | Central Hub</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #1E3A8A; /* Deep Blue - Authority & Professionalism */
                --secondary: #0EA5E9; /* Cyan - Connectivity */
                --highlight: #14B8A6; /* Teal - Dynamic Highlights */
                --bg: #0F172A; /* Slate Deep */
                --card-bg: rgba(30, 41, 59, 0.7);
                --text: #F8FAFC;
            }
            body { 
                margin: 0; 
                font-family: 'Outfit', sans-serif; 
                background-color: var(--bg);
                background-image: 
                    radial-gradient(circle at 15% 25%, rgba(30, 58, 138, 0.2) 0%, transparent 45%),
                    radial-gradient(circle at 85% 75%, rgba(20, 184, 166, 0.1) 0%, transparent 45%);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text);
                overflow: hidden;
            }
            .container {
                text-align: center;
                padding: 4rem 3rem;
                background: var(--card-bg);
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                border-radius: 40px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.8);
                max-width: 600px;
                width: 90%;
                position: relative;
                animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.96) translateY(15px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            .badge-group {
                display: flex;
                justify-content: center;
                gap: 8px;
                margin-bottom: 2rem;
            }
            .badge {
                padding: 4px 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                font-size: 0.7rem;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: #94A3B8;
            }

            .logo-wrap {
                margin-bottom: 2rem;
                display: inline-flex;
                position: relative;
            }
            .logo-inner {
                width: 72px;
                height: 72px;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 40px rgba(30, 58, 138, 0.5);
            }
            
            h1 { margin: 0; font-size: 2.2rem; font-weight: 600; letter-spacing: -0.03em; line-height: 1.1; }
            h1 span { display: block; font-size: 1rem; font-weight: 400; color: var(--secondary); margin-top: 0.5rem; letter-spacing: 0.05em; text-transform: uppercase; }
            
            p { color: #CBD5E1; margin: 2rem 0 3rem; font-size: 1.1rem; line-height: 1.6; font-weight: 300; }
            
            .feature-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                margin-bottom: 3.5rem;
                text-align: left;
            }
            .feature-item {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                padding: 14px;
                border-radius: 16px;
            }
            .feature-title { font-size: 0.85rem; font-weight: 600; color: var(--highlight); margin-bottom: 4px; }
            .feature-desc { font-size: 0.75rem; color: #64748B; }

            .status-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2rem;
                padding-top: 1rem;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }
            .status-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--highlight);
            }
            .pulse-dot {
                width: 8px;
                height: 8px;
                background: var(--highlight);
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(20, 184, 166, 0); }
                100% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0); }
            }
            .version { font-size: 0.8rem; color: #475569; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="badge-group">
                <div class="badge">Executive Hub</div>
                <div class="badge">Pharmacovigilance Central</div>
            </div>
            
            <div class="logo-wrap">
                <div class="logo-inner">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                </div>
            </div>

            <h1>ISoP Ecosystem <span>International Society of Pharmacovigilance</span></h1>
            
            <p>The strategic engine powering secure connectivity, real-time networking, and event lifecycle management for medical safety experts globally.</p>
            
            <div class="feature-grid">
                <div class="feature-item">
                    <div class="feature-title">Event Logistics</div>
                    <div class="feature-desc">Interactive lifecycle management.</div>
                </div>
                <div class="feature-item">
                    <div class="feature-title">Professional Chat</div>
                    <div class="feature-desc">Secure 1:1 medical networking.</div>
                </div>
                <div class="feature-item">
                    <div class="feature-title">Member Pulse</div>
                    <div class="feature-desc">Real-time engagement tracking.</div>
                </div>
                <div class="feature-item">
                    <div class="feature-title">Bento Analytics</div>
                    <div class="feature-desc">High-fidelity data visualization.</div>
                </div>
            </div>

            <div class="status-wrapper">
                <div class="status-indicator">
                    <div class="pulse-dot"></div>
                    Services Operational
                </div>
            </div>
        </div>
    </body>
    </html>
`;

module.exports = { getWelcomeTemplate };
