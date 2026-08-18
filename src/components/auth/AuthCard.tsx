import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Logo from '../Logo';
import Card from '../ui/Card';

interface Props {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  dividerText?: string;
  footer?: React.ReactNode;
}

const AuthCard: React.FC<Props> = ({ icon, title, subtitle, children, dividerText, footer }) => (
  <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md">
      <Card elevated className="p-7 sm:p-8">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Logo size={22} />
          <span className="font-display text-[16px] font-bold tracking-tight text-ink">ShopLogs</span>
        </Link>

        <div className="text-center mb-7">
          {icon && (
            <div className="mx-auto w-12 h-12 bg-primary-soft text-primary rounded-[var(--radius-md)] flex items-center justify-center mb-4">
              {icon}
            </div>
          )}
          <h1 className="font-display text-[22px] font-bold text-ink mb-1.5">{title}</h1>
          <p className="text-[13px] text-ink-muted leading-relaxed">{subtitle}</p>
        </div>

        {children}

        {footer && (
          <>
            {dividerText && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[11.5px]">
                  <span className="px-3 bg-surface text-ink-muted">{dividerText}</span>
                </div>
              </div>
            )}
            <div className="text-center">{footer}</div>
          </>
        )}
      </Card>

      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  </div>
);

export default AuthCard;
