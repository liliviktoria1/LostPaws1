import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Логотип і соціальні мережі */}
                <div className="footer-left">
                    <div className="logo-container">
                        {/* Використання абсолютного шляху до логотипу в папці public */}
                        <img src="/assets/logo2.svg" alt="LostPaws Logo" className="footer-logo" />
                        <span className="footer-title">
                            <span className="footer-lost">Lost</span>
                            <span className="paws">Paws</span>
                        </span>
                    </div>
                    <div className="social-icons">
                        {/* TikTok */}
                        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
                            <div className="tiktok-icon-wrapper">
                                <svg width="26" height="31" viewBox="0 0 26 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="tiktok-layer tiktok-red">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M16.3724 0C16.3724 0.0345704 16.4079 0.0691406 16.4079 0.103711C16.8686 1.79766 17.9317 3.28419 19.3492 4.28674C18.8177 3.56076 18.4278 2.73106 18.1798 1.83223C18.038 1.24454 17.9317 0.622268 17.9317 0H16.3724ZM23.7081 7.15608V10.9243C20.9794 10.9243 18.605 10.0946 16.5142 8.71175V19.2212V19.4632C16.3724 24.8216 11.7655 29.1429 6.23711 29.1429C3.8982 29.1429 1.70103 28.3478 0 27.0687C1.84278 29.3849 4.74871 30.8714 8.00902 30.8714C13.5374 30.8714 18.1443 26.5501 18.2861 21.1917V20.9497V10.4748C20.3769 11.8577 22.7867 12.6874 25.48 12.6874V7.3635C24.8776 7.3635 24.2751 7.29436 23.7081 7.15608ZM7.65464 11.0625V15.0727C7.19394 14.9344 6.73325 14.8653 6.23711 14.8653C3.75644 14.8653 1.73647 16.8358 1.73647 19.2557C1.73647 20.9151 2.6933 22.3325 4.07539 23.0931C3.721 22.4708 3.50838 21.7448 3.50838 20.9843C3.50838 18.5643 5.52835 16.5938 8.00902 16.5938C8.50515 16.5938 8.96585 16.663 9.42655 16.8012V11.1663C8.96585 11.0971 8.50515 11.0625 8.00902 11.0625C7.86727 11.0625 7.76095 11.0625 7.65464 11.0625Z" fill="#FE2C55"/>
                                </svg>
                                <svg width="28" height="31" viewBox="0 0 28 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="tiktok-layer tiktok-white">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M20.3061 1.83223C20.1643 1.24454 20.058 0.622268 20.058 0H14.7423V10.3711V12.0651V20.9497C14.7423 23.3696 12.616 25.3401 10.1353 25.3401C7.65464 25.3401 5.6701 23.4042 5.6701 20.9843C5.6701 18.5643 7.69008 16.5938 10.1707 16.5938C10.6669 16.5938 11.1276 16.663 11.5883 16.8012V11.1663C11.1276 11.0971 10.6669 11.0625 10.1707 11.0625C4.53608 11.0625 0 15.4876 0 20.9843C0 26.4464 4.53608 30.906 10.1707 30.906C15.6991 30.906 20.3061 26.5847 20.4478 21.2263V20.9843V10.4748C22.5387 11.8577 24.9485 12.6874 27.6418 12.6874V7.3635C24.1334 7.3635 21.1566 5.01271 20.3061 1.83223Z" fill="white"/>
                                </svg>
                                <svg width="28" height="31" viewBox="0 0 28 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="tiktok-layer tiktok-cyan">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M20.3061 1.83223C20.1643 1.24454 20.058 0.622268 20.058 0H14.7423V10.3711V12.0651V20.9497C14.7423 23.3696 12.616 25.3401 10.1353 25.3401C7.65464 25.3401 5.6701 23.4042 5.6701 20.9843C5.6701 18.5643 7.69008 16.5938 10.1707 16.5938C10.6669 16.5938 11.1276 16.663 11.5883 16.8012V11.1663C11.1276 11.0971 10.6669 11.0625 10.1707 11.0625C4.53608 11.0625 0 15.4876 0 20.9843C0 26.4464 4.53608 30.906 10.1707 30.906C15.6991 30.906 20.3061 26.5847 20.4478 21.2263V20.9843V10.4748C22.5387 11.8577 24.9485 12.6874 27.6418 12.6874V7.3635C24.1334 7.3635 21.1566 5.01271 20.3061 1.83223Z" fill="#25F4EE"/>
                                </svg>
                            </div>
                        </a>

                        {/* Facebook */}
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                            <svg width="32" height="32" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="social-icon-svg">
                                <g clipPath="url(#clip_facebook)">
                                <path d="M20.5 41C31.8218 41 41 31.8218 41 20.5C41 9.17816 31.8218 0 20.5 0C9.17816 0 0 9.17816 0 20.5C0 31.8218 9.17816 41 20.5 41Z" fill="#3C5A9A"/>
                                <path d="M27.1657 6.29248H22.6245C19.9295 6.29248 16.932 7.42593 16.932 11.3323C16.9452 12.6935 16.932 13.9971 16.932 15.4642H13.8143V20.4253H17.0285V34.7076H22.9346V20.331H26.8329L27.1856 15.4502H22.8329C22.8329 15.4502 22.8426 13.279 22.8329 12.6485C22.8329 11.1048 24.4392 11.1932 24.5358 11.1932C25.3002 11.1932 26.7864 11.1954 27.1679 11.1932V6.29248H27.1657Z" fill="white"/>
                                </g>
                                <defs>
                                <clipPath id="clip_facebook">
                                <rect width="41" height="41" fill="white"/>
                                </clipPath>
                                </defs>
                            </svg>
                        </a>

                        {/* Instagram */}
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="social-icon-svg">
                                <defs>
                                    <linearGradient id="ig-sunset-gradient" x1="0" y1="40" x2="40" y2="0" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#f09433"/>
                                        <stop offset="0.25" stopColor="#e6683c"/>
                                        <stop offset="0.5" stopColor="#dc2743"/>
                                        <stop offset="0.75" stopColor="#cc2366"/>
                                        <stop offset="1" stopColor="#bc1888"/>
                                    </linearGradient>
                                </defs>
                                <circle cx="20" cy="20" r="20" fill="url(#ig-sunset-gradient)"/>
                                <g transform="translate(9.2, 5.0) scale(0.9)">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 7c-2.7 0-3 .01-4.1.06-1.1.05-1.8.21-2.4.46a4.9 4.9 0 0 0-1.8 1.1 4.9 4.9 0 0 0-1.1 1.8c-.2.6-.4 1.3-.5 2.4C2 13.9 2 14.3 2 17s.01 3 .06 4.1c.05 1.1.21 1.8.46 2.4a4.9 4.9 0 0 0 1.1 1.8 4.9 4.9 0 0 0 1.8 1.1c.6.2 1.3.4 2.4.5 1.1.05 1.4.06 4.1.06s3-.01 4.1-.06c1.1-.05 1.8-.21 2.4-.46a4.9 4.9 0 0 0 1.8-1.1 4.9 4.9 0 0 0 1.1-1.8c.2-.6.4-1.3.5-2.4.05-1.1.06-1.4.06-4.1s-.01-3-.06-4.1c-.05-1.1-.21-1.8-.46-2.4a4.9 4.9 0 0 0-1.1-1.8a4.9 4.9 0 0 0-1.8-1.1c-.6-.2-1.3-.4-2.4-.5C15 7.01 14.7 7 12 7zm0 1.8c2.7 0 3 .01 4 .06 1.1.05 1.6.22 1.9.35.4.1.7.3 1.1.8s.6.7.7 1.1c.1.3.3.9.3 1.9.05 1 .06 1.3.06 4s-.01 3-.06 4c-.05 1.1-.22 1.6-.35 1.9a3.1 3.1 0 0 1-.8 1.1 3.1 3.1 0 0 1-1.1.8c-.3.1-.9.3-1.9.3-1 .05-1.3.06-4 .06s-3-.01-4-.06c-1.1-.05-1.6-.22-1.9-.35a3.1 3.1 0 0 1-1.1-.8 3.1 3.1 0 0 1-.8-1.1c-.1-.3-.3-.9-.3-1.9-.05-1-.06-1.3-.06-4s.01-3 .06-4c.05-1.1.22-1.6.35-1.9.1-.4.3-.7.8-1.1.4-.4.7-.6 1.1-.7.3-.1.9-.3 1.9-.3 1-.05 1.3-.06 4-.06zM12 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.1-8.3a1.2 1.2 0 1 1 0-2.3 1.2 1.2 0 0 1 0 2.3z" fill="white"/>
                                </g>
                            </svg>
                        </a>

                        {/* YouTube */}
                        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="social-icon-svg">
                                <circle cx="20" cy="20" r="20" fill="#FF0000"/>
                                <g transform="translate(6.5, 10.5)">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M1.52051 1.34142C3.0085 -0.072093 7.60204 -0.072093 13.2828 0.0481968C18.9635 0.168487 24.2856 -0.166643 25.5159 1.65675C26.7462 3.48015 26.84 5.24235 26.7462 9.26637C26.6523 13.2904 26.6889 16.2448 25.0223 17.6248C23.3557 19.0048 19.1638 18.7745 13.2828 18.7745C7.40174 18.7745 3.05258 18.9089 1.53207 17.6248C0.0115513 16.3407 0 13.2686 0 9.22771C0 5.18684 0.0325327 2.75494 1.52051 1.34142Z" fill="white"/>
                                    <path d="M11 6.5L17 9.5L11 12.5V6.5Z" fill="#FF0000"/>
                                </g>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Навігація */}
                <div className="footer-middle">
                    <nav className="footer-nav">
                        <div className="nav-column">
                            <Link to="/" className="footer-link">{t('footer.nav_home')}</Link>
                            <Link to="/maps" className="footer-link">{t('footer.nav_maps')}</Link>
                        </div>
                        <div className="nav-column">
                            <Link to="/contact" className="footer-link">{t('footer.nav_contact')}</Link>
                            <Link to="/announcements" className="footer-link">{t('footer.nav_announcements')}</Link>
                            <Link to="/success-stories" className="footer-link">{t('header.success_stories')}</Link>
                        </div>
                    </nav>
                </div>

                {/* Технічна підтримка */}
                <div className="footer-right">
                    <div className="support-content">
                        <h4 className="footer-support-title">{t('footer.support_title')}</h4>
                        <p className="footer-support-text">+380 (50) xxx xx xx</p>
                        <p className="footer-support-text highlight-email">lostpaws@gmail.com</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
