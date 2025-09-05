// React bundle with the Landing component
import React from 'https://esm.sh/react@18.3.1';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1/client';

// Landing component with Tailwind styling
function TopBar({ title }) {
  return React.createElement('div', {
    className: 'flex justify-between items-center p-4 bg-card/50 backdrop-blur-sm border-b border-border'
  }, [
    React.createElement('h1', {
      key: 'title',
      className: 'text-lg font-semibold text-foreground'
    }, title),
    React.createElement('div', {
      key: 'status',
      className: 'w-2 h-2 bg-primary rounded-full'
    })
  ]);
}

function Landing() {
  return React.createElement('div', {
    className: 'min-h-screen bg-background text-foreground'
  }, [
    React.createElement(TopBar, { key: 'topbar', title: 'Dynamic Capital' }),
    
    // Hero Section
    React.createElement('div', {
      key: 'hero',
      className: 'p-6 text-center'
    }, [
      React.createElement('div', {
        key: 'badge',
        className: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-4'
      }, '🚀 Premium Trading Platform'),
      
      React.createElement('h1', {
        key: 'headline',
        className: 'text-2xl font-bold mb-4 text-foreground'
      }, 'Unlock VIP Trading Signals'),
      
      React.createElement('p', {
        key: 'subtitle',
        className: 'text-muted-foreground mb-6 leading-relaxed'
      }, 'Join thousands of successful traders with our exclusive VIP community. Get real-time signals, expert analysis, and risk management guidance.')
    ]),

    // CTA Section
    React.createElement('div', {
      key: 'cta',
      className: 'px-6 mb-6'
    }, React.createElement('div', {
      className: 'bg-card rounded-lg p-6 border border-border'
    }, [
      React.createElement('h2', {
        key: 'cta-title',
        className: 'text-xl font-semibold mb-3 text-foreground'
      }, 'Start Your VIP Journey'),
      
      React.createElement('p', {
        key: 'cta-desc',
        className: 'text-muted-foreground mb-4'
      }, 'Choose your subscription plan and get instant access to our premium trading community.'),
      
      React.createElement('button', {
        key: 'cta-button',
        className: 'w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors',
        onClick: () => window.location.hash = '#/plan'
      }, 'Choose Plan →')
    ])),

    // Quick Actions
    React.createElement('div', {
      key: 'actions',
      className: 'px-6 mb-6'
    }, [
      React.createElement('h3', {
        key: 'actions-title',
        className: 'text-lg font-semibold mb-4 text-foreground'
      }, 'Quick Actions'),
      
      React.createElement('div', {
        key: 'actions-grid',
        className: 'grid grid-cols-2 gap-3'
      }, [
        React.createElement('button', {
          key: 'bank',
          className: 'bg-card border border-border rounded-lg p-4 text-left hover:bg-accent transition-colors',
          onClick: () => window.location.hash = '#/bank'
        }, [
          React.createElement('div', {
            key: 'bank-icon',
            className: 'text-2xl mb-2'
          }, '🏦'),
          React.createElement('div', {
            key: 'bank-title',
            className: 'font-medium text-foreground'
          }, 'Bank Payment'),
          React.createElement('div', {
            key: 'bank-desc',
            className: 'text-sm text-muted-foreground'
          }, 'Upload receipt')
        ]),
        
        React.createElement('button', {
          key: 'crypto',
          className: 'bg-card border border-border rounded-lg p-4 text-left hover:bg-accent transition-colors',
          onClick: () => window.location.hash = '#/crypto'
        }, [
          React.createElement('div', {
            key: 'crypto-icon',
            className: 'text-2xl mb-2'
          }, '₿'),
          React.createElement('div', {
            key: 'crypto-title',
            className: 'font-medium text-foreground'
          }, 'Crypto Payment'),
          React.createElement('div', {
            key: 'crypto-desc',
            className: 'text-sm text-muted-foreground'
          }, 'Send crypto')
        ])
      ])
    ]),

    // Benefits
    React.createElement('div', {
      key: 'benefits',
      className: 'px-6 mb-6'
    }, React.createElement('div', {
      className: 'bg-card rounded-lg p-6 border border-border'
    }, [
      React.createElement('h3', {
        key: 'benefits-title',
        className: 'text-lg font-semibold mb-4 text-foreground'
      }, 'VIP Benefits'),
      
      React.createElement('div', {
        key: 'benefits-list',
        className: 'space-y-3'
      }, [
        React.createElement('div', {
          key: 'benefit1',
          className: 'flex items-start gap-3'
        }, [
          React.createElement('span', { key: 'icon1', className: 'text-primary mt-0.5' }, '✓'),
          React.createElement('div', { key: 'text1' }, [
            React.createElement('div', { key: 'title1', className: 'font-medium text-foreground' }, 'Exclusive Signals'),
            React.createElement('div', { key: 'desc1', className: 'text-sm text-muted-foreground' }, 'Real-time trading opportunities')
          ])
        ]),
        
        React.createElement('div', {
          key: 'benefit2',
          className: 'flex items-start gap-3'
        }, [
          React.createElement('span', { key: 'icon2', className: 'text-primary mt-0.5' }, '✓'),
          React.createElement('div', { key: 'text2' }, [
            React.createElement('div', { key: 'title2', className: 'font-medium text-foreground' }, 'Daily Analysis'),
            React.createElement('div', { key: 'desc2', className: 'text-sm text-muted-foreground' }, 'Market insights and trends')
          ])
        ]),
        
        React.createElement('div', {
          key: 'benefit3',
          className: 'flex items-start gap-3'
        }, [
          React.createElement('span', { key: 'icon3', className: 'text-primary mt-0.5' }, '✓'),
          React.createElement('div', { key: 'text3' }, [
            React.createElement('div', { key: 'title3', className: 'font-medium text-foreground' }, 'VIP Community'),
            React.createElement('div', { key: 'desc3', className: 'text-sm text-muted-foreground' }, 'Connect with expert traders')
          ])
        ]),
        
        React.createElement('div', {
          key: 'benefit4',
          className: 'flex items-start gap-3'
        }, [
          React.createElement('span', { key: 'icon4', className: 'text-primary mt-0.5' }, '✓'),
          React.createElement('div', { key: 'text4' }, [
            React.createElement('div', { key: 'title4', className: 'font-medium text-foreground' }, 'Risk Management'),
            React.createElement('div', { key: 'desc4', className: 'text-sm text-muted-foreground' }, 'Stop-loss and take-profit guidance')
          ])
        ])
      ])
    ])),

    // Footer Links
    React.createElement('div', {
      key: 'footer',
      className: 'px-6 pb-6'
    }, React.createElement('div', {
      className: 'grid grid-cols-2 gap-3'
    }, [
      React.createElement('button', {
        key: 'me',
        className: 'bg-secondary text-secondary-foreground py-3 px-4 rounded-lg font-medium hover:bg-secondary/80 transition-colors',
        onClick: () => window.location.hash = '#/me'
      }, 'My Account'),
      
      React.createElement('button', {
        key: 'status',
        className: 'bg-secondary text-secondary-foreground py-3 px-4 rounded-lg font-medium hover:bg-secondary/80 transition-colors',
        onClick: () => window.location.hash = '#/status'
      }, 'Status')
    ]))
  ]);
}

// Simple router to handle hash changes
function App() {
  const [currentPath, setCurrentPath] = React.useState(window.location.hash.slice(1) || '/');
  
  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // For now, just show Landing for all routes
  return React.createElement(Landing);
}

// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// Mount the app
const root = document.getElementById('root');
if (root) {
  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(React.createElement(App));
} else {
  console.error('Root element not found');
}