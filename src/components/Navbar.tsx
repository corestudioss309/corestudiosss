import logoAsset from '@/assets/core-studio-wordlogo-white.svg';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import './StaggeredMenu.css';

const Navbar = forwardRef<HTMLElement>((_, ref) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const openRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const hero = document.getElementById('hero');
    const threshold = () => Math.max(40, (hero?.offsetHeight ?? window.innerHeight) - 80);
    const handleScroll = () => setIsScrolled(window.scrollY > threshold());
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const animateMenu = useCallback((next: boolean, immediate = false) => {
    const panel = panelRef.current;
    const layers = Array.from(layersRef.current?.children ?? []);
    if (!panel) return;
    timelineRef.current?.kill();
    const direction = isRTL ? -100 : 100;
    const reduced = immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 0 : 0.56;
    const stagger = reduced ? 0 : 0.07;
    const links = panel.querySelectorAll('.staggered-menu-link');
    if (next) {
      gsap.set([panel, ...layers], { xPercent: direction, visibility: 'visible' });
      gsap.set(links, { yPercent: reduced ? 0 : 110, opacity: reduced ? 1 : 0 });
      const timeline = gsap.timeline({ onComplete: () => firstLinkRef.current?.focus({ preventScroll: true }) });
      timeline.to(layers, { xPercent: 0, duration, stagger, ease: 'power4.out' }, 0);
      timeline.to(panel, { xPercent: 0, duration: reduced ? 0 : 0.65, ease: 'power4.out' }, stagger * layers.length);
      timeline.to(links, { yPercent: 0, opacity: 1, duration: reduced ? 0 : 0.65, stagger: reduced ? 0 : 0.085, ease: 'power4.out' }, stagger * layers.length + (reduced ? 0 : 0.18));
      timelineRef.current = timeline;
    } else {
      timelineRef.current = gsap.timeline({ onComplete: () => {
        gsap.set([panel, ...layers], { visibility: 'hidden' });
        if (!immediate) triggerRef.current?.focus({ preventScroll: true });
      }}).to([panel, ...layers.reverse()], { xPercent: direction, duration: reduced ? 0 : 0.32, stagger: reduced ? 0 : 0.04, ease: 'power3.in' });
    }
    gsap.to(iconRef.current, { rotation: next ? 135 : 0, duration: reduced ? 0 : 0.42, ease: 'power3.out' });
  }, [isRTL]);

  const setMenu = useCallback((next: boolean, immediate = false) => {
    if (next === openRef.current && !immediate) return;
    openRef.current = next;
    setOpen(next);
    animateMenu(next, immediate);
  }, [animateMenu]);

  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(false);
      if (event.key === 'Tab') {
        const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a, button:not([disabled])') ?? []);
        if (triggerRef.current) focusable.unshift(triggerRef.current);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, setMenu]);

  useEffect(() => {
    if (panelRef.current) panelRef.current.inert = !open;
  }, [open]);

  useEffect(() => {
    if (openRef.current) setMenu(false, true);
  }, [location.pathname, location.hash]);

  useEffect(() => () => { timelineRef.current?.kill(); }, []);

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const timer = window.setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 150);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const scrollToSection = (id: string) => {
    setMenu(false);
    if (location.pathname !== '/') {
      navigate('/#' + id);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const items = [
    { key: 'nav.home', id: 'hero' },
    { key: 'nav.howItWorks', id: 'how-it-works' },
    { key: 'nav.whyUs', id: 'why-us' },
    { key: 'nav.pricing', id: 'pricing' },
    { key: 'nav.contact', id: 'contact' },
  ];

  return (
    <nav ref={ref} className="staggered-navigation" dir={isRTL ? 'rtl' : 'ltr'} aria-label={isRTL ? 'القائمة الرئيسية' : 'Main navigation'}>
      <div ref={layersRef} className={`staggered-menu-layers ${isRTL ? 'staggered-menu-rtl' : ''}`} aria-hidden="true">
        <div className="staggered-menu-layer staggered-menu-layer-first" />
        <div className="staggered-menu-layer staggered-menu-layer-second" />
      </div>
      {open && <div className="staggered-menu-backdrop" onClick={() => setMenu(false)} aria-hidden="true" />}
      <div ref={panelRef} id="site-menu" className={`staggered-menu-panel ${isRTL ? 'staggered-menu-rtl' : ''}`} aria-hidden={!open}>
        <div className="staggered-menu-content">
          <ol className="staggered-menu-list">
            {items.map((item, index) => (
              <li key={item.id} className="staggered-menu-item">
                <a
                  ref={index === 0 ? firstLinkRef : undefined}
                  className="staggered-menu-link"
                  href={`/#${item.id}`}
                  onClick={(event) => { event.preventDefault(); scrollToSection(item.id); }}
                >
                  <span className="staggered-menu-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span>{t(item.key)}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="staggered-menu-actions">
            <Button variant="outline" onClick={() => { setMenu(false); navigate('/renew'); }}>{isRTL ? 'تجديد' : 'Renew'}</Button>
            <Button onClick={() => scrollToSection('contact')}>{t('nav.getStarted')}</Button>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      <div className={`staggered-navigation-header ${isScrolled && !open ? 'staggered-navigation-scrolled' : ''}`}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Button variant="ghost" className="staggered-logo h-12 px-0 hover:bg-transparent" onClick={() => { setMenu(false); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Core Studios home">
            <img src={logoAsset} alt="Core Studios" className="h-7 w-auto" width={171} height={28} />
          </Button>
          <Button ref={triggerRef} variant="ghost" className="staggered-menu-toggle" aria-expanded={open} aria-controls="site-menu" aria-label={open ? (isRTL ? 'اقفل القائمة' : 'Close menu') : (isRTL ? 'افتح القائمة' : 'Open menu')} onClick={() => setMenu(!openRef.current)}>
            <span>{open ? (isRTL ? 'اقفل' : 'Close') : (isRTL ? 'القائمة' : 'Menu')}</span>
            <span ref={iconRef} className="staggered-menu-icon" aria-hidden="true"><span /><span /></span>
          </Button>
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;
